import time
import random
import hashlib
from typing import List, Dict, Tuple, Optional, Set
from ..models.telemetry import TelemetryEvent, EventSeverity, EventType


class ImperfectionEngine:
    """
    Simulates real-world imperfect telemetry conditions:
      - Duplicate telemetry packets
      - Latency jitter / out-of-order arrival
      - Packet loss / missing telemetry
      - Dead device heartbeat failure

    Provides resilient processing:
      - Deduplication within a sliding time window
      - Temporal sorting and sequence alignment
      - Tracking of missing telemetry with graceful confidence penalty
    """

    def __init__(self):
        # Simulation knobs
        self.duplicate_rate: float = 0.05       # 5% probability of generating duplicate
        self.delay_rate: float = 0.10           # 10% probability of delaying event
        self.drop_rate: float = 0.05            # 5% probability of dropping event
        self.device_failure_rate: float = 0.0   # On-demand device silence
        self.failed_devices: Set[str] = set()

        # Resilient processor state
        self.seen_event_hashes: Set[str] = set()
        self.seen_event_timestamps: Dict[str, float] = {}
        self.delay_buffer: List[Tuple[float, TelemetryEvent]] = []  # (release_time, event)
        self.missing_telemetry_records: List[Dict[str, any]] = []
        self.last_device_heartbeats: Dict[str, float] = {}

    def configure(self, duplicate_rate: float = 0.05, delay_rate: float = 0.10, drop_rate: float = 0.05):
        self.duplicate_rate = duplicate_rate
        self.delay_rate = delay_rate
        self.drop_rate = drop_rate

    def set_device_failure(self, device_id: str, failed: bool):
        if failed:
            self.failed_devices.add(device_id)
        else:
            self.failed_devices.discard(device_id)

    def _compute_event_fingerprint(self, event: TelemetryEvent) -> str:
        raw = f"{event.source_device}:{event.destination_device}:{event.event_type}:{event.user}:{event.description}"
        return hashlib.md5(raw.encode()).hexdigest()

    def simulate_transmission(self, raw_events: List[TelemetryEvent]) -> List[TelemetryEvent]:
        """
        Applies network imperfections to raw telemetry events.
        May produce duplicates, delay some into the buffer, or drop some completely.
        """
        now = time.time()
        ready_events: List[TelemetryEvent] = []

        # 1. First drain any previously delayed events whose release time has arrived
        remaining_delayed: List[Tuple[float, TelemetryEvent]] = []
        for release_time, delayed_event in self.delay_buffer:
            if now >= release_time:
                ready_events.append(delayed_event)
            else:
                remaining_delayed.append((release_time, delayed_event))
        self.delay_buffer = remaining_delayed

        # 2. Process incoming batch
        for event in raw_events:
            # Check if originating from a device in simulated failure state
            if event.source_device in self.failed_devices:
                self.missing_telemetry_records.append({
                    "device_id": event.source_device,
                    "event_type": event.event_type,
                    "timestamp": now,
                    "reason": "Device telemetry sensor offline"
                })
                continue

            # Simulate Packet Drop (Missing Telemetry)
            if random.random() < self.drop_rate and event.severity != EventSeverity.CRITICAL:
                self.missing_telemetry_records.append({
                    "device_id": event.source_device,
                    "event_type": event.event_type,
                    "timestamp": now,
                    "reason": "Network packet loss"
                })
                # We drop this event from immediate delivery
                continue

            # Simulate Latency Jitter (Delayed / Out-of-order)
            if random.random() < self.delay_rate:
                jitter_delay = random.uniform(1.5, 4.0)
                event.is_delayed = True
                event.delay_seconds = round(jitter_delay, 2)
                event.original_timestamp = event.timestamp
                self.delay_buffer.append((now + jitter_delay, event))
                continue

            ready_events.append(event)

            # Simulate Packet Duplication
            if random.random() < self.duplicate_rate:
                dup_event = event.model_copy(deep=True)
                dup_event.event_id = f"{event.event_id}_DUP"
                dup_event.is_duplicate = True
                dup_event.timestamp = event.timestamp + random.uniform(0.1, 0.5)
                # Stagger duplicate slightly into ready list or delay buffer
                self.delay_buffer.append((now + 0.5, dup_event))

        return ready_events

    def process_and_deduplicate(self, incoming_events: List[TelemetryEvent]) -> Tuple[List[TelemetryEvent], int]:
        """
        Deduplicates incoming telemetry, normalizes timestamps, and updates heartbeat tracking.
        Returns: (deduplicated_and_sorted_events, duplicates_dropped_count)
        """
        now = time.time()
        deduped: List[TelemetryEvent] = []
        duplicates_count = 0

        # Purge fingerprints older than 60 seconds from dedup cache
        cutoff = now - 60.0
        expired_keys = [k for k, t in self.seen_event_timestamps.items() if t < cutoff]
        for k in expired_keys:
            self.seen_event_hashes.discard(k)
            self.seen_event_timestamps.pop(k, None)

        for ev in incoming_events:
            fp = self._compute_event_fingerprint(ev)
            # Check if this exact fingerprint was seen in the active window
            if ev.is_duplicate or fp in self.seen_event_hashes:
                duplicates_count += 1
                continue

            self.seen_event_hashes.add(fp)
            self.seen_event_timestamps[fp] = now
            self.last_device_heartbeats[ev.source_device] = now
            deduped.append(ev)

        # Sort by actual timestamp to handle out-of-order arrivals
        deduped.sort(key=lambda x: x.timestamp)
        return deduped, duplicates_count

    def get_missing_telemetry_status(self, device_ids: List[str]) -> Dict[str, bool]:
        """Returns map of device_id -> is_reporting"""
        now = time.time()
        status_map = {}
        for d in device_ids:
            if d in self.failed_devices:
                status_map[d] = False
            else:
                last_hb = self.last_device_heartbeats.get(d, now)
                # If no heartbeat for > 45s, mark as unavailable
                status_map[d] = (now - last_hb) <= 45.0
        return status_map

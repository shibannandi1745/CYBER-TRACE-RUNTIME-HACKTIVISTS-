import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSimulation } from "../context/SimulationContext";
import { Badge } from "../components/common/Badge";
import { TelemetryEvent, GraphNode, GraphEdge } from "../types";
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  PlayCircle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Server,
  Database,
  Laptop,
  Radio,
  FileCode,
  ArrowRight,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  SearchCode,
  Flame,
  Download,
  MessageSquare,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Layers,
  Network,
  Crosshair,
  Key,
  Cpu,
  Eye,
  AlertCircle,
  Fingerprint,
  FileSpreadsheet
} from "lucide-react";

// Evidence certification types
export type EvidenceStatus = "CONFIRMED" | "RECONSTRUCTED" | "INFERRED" | "UNKNOWN";

export interface SupportingEvidenceItem {
  type: string;
  source: string;
  description: string;
  status: EvidenceStatus;
  confidence: number;
}

export interface SecurityLoophole {
  id: string;
  title: string;
  weakness: string;
  exploitation: string;
  whyFailed: string;
  preventedBy: string;
  recommendedFix: string;
  cveOrRef?: string;
}

export interface ForensicReplayStep extends TelemetryEvent {
  step_number: number;
  relative_time: string;
  stage_name: string;
  stage_index: number;
  action_name: string;
  confidence_pct: number;
  is_reconstructed: boolean;
  reconstruction_reason?: string;
  loophole: SecurityLoophole;
  evidence_items: SupportingEvidenceItem[];
}

export interface ForensicIncidentScenario {
  id: string;
  title: string;
  incident_code: string;
  type: string;
  target_asset: string;
  summary: string;
  steps: ForensicReplayStep[];
  critical_gaps: {
    title: string;
    risk: string;
    exploitation: string;
    impact: string;
    mitigation: string;
  }[];
}

export interface AnalystNote {
  id: string;
  stepIndex: number;
  author: string;
  timestamp: string;
  note: string;
}

// --------------------------------------------------------------------------
// DETERMINISTIC FORENSIC SCENARIO DATASETS
// Grounded strictly in the backend simulation scenarios
// --------------------------------------------------------------------------

const SCENARIO_COORDINATED: ForensicIncidentScenario = {
  id: "coordinated_attack",
  title: "Multi-Floor Coordinated Intrusion & Physical OT Sabotage",
  incident_code: "INC-2026-C04",
  type: "Advanced Persistent Threat (APT) / Multi-Hop Sabotage",
  target_asset: "Database-302, FileServer-303 & SmartDoor-403",
  summary:
    "An external adversary connected to Floor 1 Guest VLAN, exploited weak edge authentication, pivoted across inter-VLAN core infrastructure, escalated to root on application servers, exfiltrated sensitive databases, destroyed critical records, and forged physical OT airlock unlock commands.",
  critical_gaps: [
    {
      title: "Unrestricted Guest-to-Management Network Routing",
      risk: "Perimeter router console exposed to untrusted Visitor Lounge ports.",
      exploitation: "Direct brute force from unauthenticated guest laptop without port isolation.",
      impact: "Initial footholds gained on network gateway within minutes.",
      mitigation: "Enforce 802.1X EAP-TLS on all physical wall jacks; block RFC 1918 internal routing from guest VLANs."
    },
    {
      title: "Missing Multi-Factor Authentication (MFA) on Network Infrastructure",
      risk: "Single-factor credentials used for router and server SSH sessions.",
      exploitation: "Compromised staff credentials successfully unlocked network control plane.",
      impact: "Allowed attacker to inject routing tunnels without step-up authentication.",
      mitigation: "Integrate TACACS+/RADIUS with hardware FIDO2 MFA tokens for all infrastructure management."
    },
    {
      title: "Lack of East-West Microsegmentation in Datacenter",
      risk: "Flat routing allowed Floor 1 router to communicate directly with Floor 3 Datacenter switches.",
      exploitation: "Traversed across building floors without traversing stateful security inspection.",
      impact: "Rapid lateral traversal to tier-1 production application servers.",
      mitigation: "Deploy internal software-defined microsegmentation firewalls between edge and core distribution layers."
    },
    {
      title: "Insecure IT/OT Convergence on Physical Access Controls",
      risk: "BACnet building automation controller directly reachable from general compute subnet.",
      exploitation: "Forged unauthenticated UDP packets sent to physical door airlock.",
      impact: "Physical executive security boundary breached via cyber command.",
      mitigation: "Physically air-gap OT networks or deploy unidirectional security gateways (data diodes)."
    }
  ],
  steps: [
    {
      event_id: "EVT-C04-01",
      step_number: 1,
      relative_time: "+00:01s",
      timestamp: 1725450100,
      formatted_time: "14:30:01",
      source_device: "Laptop-102",
      destination_device: "EdgeRouter-101",
      user: "admin_temp",
      event_type: "LOGIN_FAILED",
      floor: 1,
      room: "Visitor Lounge",
      network_segment: "VLAN-10-GUEST-PUB",
      severity: "LOW",
      description: "Repeated failed authentication attempts on concierge endpoint",
      stage_name: "RECONNAISSANCE",
      stage_index: 1,
      action_name: "Credential Spraying",
      confidence_pct: 98,
      is_anomaly: true,
      is_duplicate: false,
      is_delayed: false,
      delay_seconds: 0,
      threat_score_snapshot: 10,
      is_reconstructed: false,
      loophole: {
        id: "LOOP-01",
        title: "Perimeter Management Interface Exposure",
        weakness: "EdgeRouter SSH and management console (port 22) exposed on guest visitor subnet.",
        exploitation: "Adversary connected via open physical Ethernet port in the visitor lounge and probed gateway credentials.",
        whyFailed: "Firewall rules only inspected WAN-to-LAN traffic; internal guest subnet had unrestricted access to router IP.",
        preventedBy: "Network ACLs restricting router management listeners exclusively to dedicated Out-of-Band (OOB) VLANs.",
        recommendedFix: "Apply 'transport input none' on guest virtual interfaces and enforce 802.1X port-security."
      },
      evidence_items: [
        {
          type: "Authentication Log",
          source: "/var/log/auth.log (EdgeRouter-101)",
          description: "SSH connection failed: Invalid user admin_temp from 10.1.10.25 port 49212",
          status: "CONFIRMED",
          confidence: 100
        },
        {
          type: "Network Telemetry",
          source: "NetFlow (EdgeRouter-101)",
          description: "TCP SYN packets on port 22 exceeding baseline by 320%",
          status: "CONFIRMED",
          confidence: 96
        }
      ]
    },
    {
      event_id: "EVT-C04-02",
      step_number: 2,
      relative_time: "+00:03s",
      timestamp: 1725450103,
      formatted_time: "14:30:03",
      source_device: "Laptop-102",
      destination_device: "EdgeRouter-101",
      user: "admin_temp",
      event_type: "MULTIPLE_FAILED_LOGINS",
      floor: 1,
      room: "Visitor Lounge",
      network_segment: "VLAN-10-GUEST-PUB",
      severity: "MEDIUM",
      description: "Brute-force credential spraying detected from IP 10.1.10.25",
      stage_name: "RECONNAISSANCE",
      stage_index: 1,
      action_name: "Automated Password Spray",
      confidence_pct: 95,
      is_anomaly: true,
      is_duplicate: false,
      is_delayed: false,
      delay_seconds: 0,
      threat_score_snapshot: 25,
      is_reconstructed: false,
      loophole: {
        id: "LOOP-02",
        title: "Missing Lockout & Rate-Limiting Controls",
        weakness: "No automated throttling or temporary IP ban on repeated failed authentication attempts.",
        exploitation: "Scripted attack tested 450 dictionary combinations within seconds without tripping lockouts.",
        whyFailed: "Default IOS router configuration lacked dynamic rate-limiting (Fail2ban or login delay).",
        preventedBy: "Progressive authentication backoff and temporary IP isolation after 5 failed attempts.",
        recommendedFix: "Configure 'login block-for 900 attempts 5 within 60' on EdgeRouter-101."
      },
      evidence_items: [
        {
          type: "Auth Telemetry",
          source: "EdgeRouter-101 PAM",
          description: "18 failed login attempts recorded within 2.8 seconds from single MAC address",
          status: "CONFIRMED",
          confidence: 98
        },
        {
          type: "IDS Signature",
          source: "Snort / Suricata Sensor #1",
          description: "ET SCAN Potential SSH Brute Force Inbound (SID: 2001219)",
          status: "CONFIRMED",
          confidence: 92
        }
      ]
    },
    {
      event_id: "EVT-C04-03",
      step_number: 3,
      relative_time: "+00:05s",
      timestamp: 1725450105,
      formatted_time: "14:30:05",
      source_device: "Laptop-102",
      destination_device: "EdgeRouter-101",
      user: "j_reception",
      event_type: "UNUSUAL_LOGIN",
      floor: 1,
      room: "Visitor Lounge",
      network_segment: "VLAN-10-GUEST-PUB",
      severity: "HIGH",
      description: "Unusual successful authentication from untrusted subnet (Guest VLAN)",
      stage_name: "INITIAL_ACCESS",
      stage_index: 2,
      action_name: "Compromised Credential Authentication",
      confidence_pct: 91,
      is_anomaly: true,
      is_duplicate: false,
      is_delayed: false,
      delay_seconds: 0,
      threat_score_snapshot: 45,
      is_reconstructed: false,
      loophole: {
        id: "LOOP-03",
        title: "Lack of MFA & Weak Shared Password",
        weakness: "Single-factor static password used for reception staff with elevated router privileges.",
        exploitation: "Adversary successfully guessed weak default credentials ('Welcome2026!') belonging to staff account.",
        whyFailed: "Router console authentication did not enforce Multi-Factor Authentication (MFA) challenge.",
        preventedBy: "Mandatory enterprise SSO with hardware MFA token (FIDO2) and geo-context validation.",
        recommendedFix: "Migrate all infrastructure auth to centralized SAML/OIDC with conditional access policies."
      },
      evidence_items: [
        {
          type: "Authentication Event",
          source: "Radius / Local Auth Log",
          description: "Accepted password for j_reception from 10.1.10.25 port 49230 ssh2",
          status: "CONFIRMED",
          confidence: 100
        },
        {
          type: "User Behavior Telemetry",
          source: "UEBA Detection Engine",
          description: "Anomalous login location: j_reception logged in from visitor guest pool instead of reception desk",
          status: "CONFIRMED",
          confidence: 88
        }
      ]
    },
    {
      event_id: "EVT-C04-04",
      step_number: 4,
      relative_time: "+00:08s",
      timestamp: 1725450108,
      formatted_time: "14:30:08",
      source_device: "Laptop-102",
      destination_device: "EdgeRouter-101",
      user: "j_reception",
      event_type: "NEW_NETWORK_RELATIONSHIP",
      floor: 1,
      room: "Visitor Lounge",
      network_segment: "VLAN-10-GUEST-PUB",
      severity: "HIGH",
      description: "Unauthorized routing tunnel established across VLAN-10 and VLAN-01",
      stage_name: "LATERAL_MOVEMENT",
      stage_index: 3,
      action_name: "Inter-VLAN Route Injection",
      confidence_pct: 84,
      is_anomaly: true,
      is_duplicate: false,
      is_delayed: false,
      delay_seconds: 0,
      threat_score_snapshot: 60,
      is_reconstructed: true,
      reconstruction_reason:
        "Primary router routing-table modification log was truncated by adversary buffer manipulation. Reconstructed from inter-VLAN NetFlow packet count and GRE keepalive frames.",
      loophole: {
        id: "LOOP-04",
        title: "Absence of Route Table Integrity Verification",
        weakness: "Router allowed runtime interface route bridging without requiring administrative quorum or crypto signoff.",
        exploitation: "Attacker issued routing commands bridging isolated guest network VLAN-10 directly to enterprise backbone VLAN-01.",
        whyFailed: "No route change anomaly detection or automated configuration integrity verification.",
        preventedBy: "Configuration hardening locking routing tables to read-only state with CI/CD GitOps enforcement.",
        recommendedFix: "Implement SNMP route change trap monitoring and strictly isolate VLAN trunking."
      },
      evidence_items: [
        {
          type: "Reconstructed NetFlow",
          source: "Core Switch Ingress Flow",
          description: "Cross-VLAN encapsulation headers detected traversing router interface vlan01",
          status: "RECONSTRUCTED",
          confidence: 85
        },
        {
          type: "Router Memory State",
          source: "Volatile Kernel Routing Table",
          description: "Active forwarding rule: 10.3.0.0/16 via 10.1.1.1 dev vlan01",
          status: "CONFIRMED",
          confidence: 90
        }
      ]
    },
    {
      event_id: "EVT-C04-05",
      step_number: 5,
      relative_time: "+00:11s",
      timestamp: 1725450111,
      formatted_time: "14:30:11",
      source_device: "EdgeRouter-101",
      destination_device: "CoreSwitch-301",
      user: "unknown_agent",
      event_type: "LATERAL_MOVEMENT",
      floor: 1,
      room: "Telecom Closet 1",
      network_segment: "VLAN-01-INFRA",
      severity: "HIGH",
      description: "Cross-floor lateral packet injection targeting Datacenter core infrastructure",
      stage_name: "LATERAL_MOVEMENT",
      stage_index: 3,
      action_name: "Cross-Floor Lateral Hop",
      confidence_pct: 90,
      is_anomaly: true,
      is_duplicate: false,
      is_delayed: false,
      delay_seconds: 0,
      threat_score_snapshot: 72,
      is_reconstructed: false,
      loophole: {
        id: "LOOP-05",
        title: "Flat Inter-Floor Distribution Network",
        weakness: "Direct layer-2/layer-3 connectivity between Floor 1 telecom closet and Floor 3 Datacenter without stateful inspection.",
        exploitation: "Adversary forwarded packets through the newly opened tunnel directly to core switches hosting server infrastructure.",
        whyFailed: "Internal campus network trusted all internal packets once authenticated to any switch port.",
        preventedBy: "Zero-Trust microsegmentation requiring explicit mutual authentication between edge and datacenter switches.",
        recommendedFix: "Deploy Next-Generation Firewalls (NGFW) with SSL/TLS inspection between campus floors and datacenter."
      },
      evidence_items: [
        {
          type: "Switch Telemetry",
          source: "CoreSwitch-301 sFlow",
          description: "High-volume probe traffic originating from EdgeRouter-101 IP targeting 10.3.1.1",
          status: "CONFIRMED",
          confidence: 94
        },
        {
          type: "MAC Address Table",
          source: "CoreSwitch-301 CAM Table",
          description: "New unrecognized hardware MAC discovered on trunk port Gi1/0/24",
          status: "CONFIRMED",
          confidence: 91
        }
      ]
    },
    {
      event_id: "EVT-C04-06",
      step_number: 6,
      relative_time: "+00:14s",
      timestamp: 1725450114,
      formatted_time: "14:30:14",
      source_device: "CoreSwitch-301",
      destination_device: "AppServer-301",
      user: "root_daemon",
      event_type: "PRIVILEGE_ESCALATION",
      floor: 3,
      room: "Server Rack A1",
      network_segment: "VLAN-30-SERVERS",
      severity: "CRITICAL",
      description: "Root privilege escalation exploited via SSH tunnel on AppServer-301",
      stage_name: "PRIVILEGE_ESCALATION",
      stage_index: 4,
      action_name: "Local Privilege Escalation (LPE)",
      confidence_pct: 96,
      is_anomaly: true,
      is_duplicate: false,
      is_delayed: false,
      delay_seconds: 0,
      threat_score_snapshot: 85,
      is_reconstructed: false,
      loophole: {
        id: "LOOP-06",
        title: "Sudoers Misconfiguration & SUID Exploit",
        weakness: "AppServer-301 permitted unpassworded sudo execution of utility binary (/usr/bin/find NOPASSWD).",
        exploitation: "Attacker executed 'sudo find . -exec /bin/sh \\; -quit' breaking out of application sandbox into UID 0 root shell.",
        whyFailed: "Endpoint Detection & Response (EDR) agent was set to passive audit-only mode instead of active block.",
        preventedBy: "Principle of Least Privilege; eliminate NOPASSWD directives; enforce mandatory AppArmor/SELinux profiles.",
        recommendedFix: "Cleanse /etc/sudoers; deploy hardened containerized runtimes with read-only root filesystems."
      },
      evidence_items: [
        {
          type: "Linux Auditd",
          source: "AppServer-301 /var/log/audit/audit.log",
          description: "type=SYSCALL arch=c000003e syscall=59 success=yes exit=0 ppid=14282 pid=14283 auid=1001 uid=0 gid=0",
          status: "CONFIRMED",
          confidence: 100
        },
        {
          type: "Process Telemetry",
          source: "EDR Telemetry Stream",
          description: "Parent sshd process spawned shell with elevated UID 0 execution context",
          status: "CONFIRMED",
          confidence: 96
        }
      ]
    },
    {
      event_id: "EVT-C04-07",
      step_number: 7,
      relative_time: "+00:17s",
      timestamp: 1725450117,
      formatted_time: "14:30:17",
      source_device: "AppServer-301",
      destination_device: "Database-302",
      user: "postgres_svc",
      event_type: "SUSPICIOUS_DATA_TRANSFER",
      floor: 3,
      room: "Server Rack A2",
      network_segment: "VLAN-30-SERVERS",
      severity: "HIGH",
      description: "Mass query exfiltration of corporate credentials & database schemas",
      stage_name: "COLLECTION",
      stage_index: 5,
      action_name: "Bulk SQL Exfiltration",
      confidence_pct: 82,
      is_anomaly: true,
      is_duplicate: false,
      is_delayed: false,
      delay_seconds: 0,
      threat_score_snapshot: 90,
      is_reconstructed: true,
      reconstruction_reason:
        "Primary database query log was truncated by adversary during session; event reconstructed from 48MB egress packet burst on TCP port 5432 and network socket telemetry.",
      loophole: {
        id: "LOOP-07",
        title: "Overprivileged Database Service Role",
        weakness: "Application service account possessed global SUPERUSER and SELECT rights on raw authentication tables.",
        exploitation: "Attacker leveraged hijacked database credentials to run pg_dump across confidential employee credentials.",
        whyFailed: "Database Activity Monitoring (DAM) lacked anomaly thresholding for sudden mass table reads.",
        preventedBy: "Row-level security, column-level field encryption for passwords, and egress rate-limiting.",
        recommendedFix: "Implement least-privilege DB roles; encrypt all sensitive fields with AES-256-GCM; alert on bulk exports."
      },
      evidence_items: [
        {
          type: "Network Socket Telemetry",
          source: "AppServer-301 Socket Stream",
          description: "Persistent outbound TCP connection to 10.3.10.20:5432 with 48.4 MB payload transferred in 2.1s",
          status: "RECONSTRUCTED",
          confidence: 84
        },
        {
          type: "Database Connection Pool",
          source: "Database-302 Connection Log",
          description: "Superuser connection authenticated via internal socket: client=10.3.10.15 user=postgres_svc",
          status: "CONFIRMED",
          confidence: 88
        }
      ]
    },
    {
      event_id: "EVT-C04-08",
      step_number: 8,
      relative_time: "+00:20s",
      timestamp: 1725450120,
      formatted_time: "14:30:20",
      source_device: "AppServer-301",
      destination_device: "FileServer-303",
      user: "root_daemon",
      event_type: "FILE_MODIFIED",
      floor: 3,
      room: "Server Rack B1",
      network_segment: "VLAN-30-SERVERS",
      severity: "CRITICAL",
      description: "Unauthorized overwrite detected in financial_report.xlsx",
      stage_name: "IMPACT",
      stage_index: 6,
      action_name: "Critical File Tampering",
      confidence_pct: 98,
      is_anomaly: true,
      is_duplicate: false,
      is_delayed: false,
      delay_seconds: 0,
      threat_score_snapshot: 95,
      is_reconstructed: false,
      loophole: {
        id: "LOOP-08",
        title: "Unrestricted Network File Share Permissions",
        weakness: "SMB/NFS file share mounted with read-write permissions across server cluster without snapshot lock.",
        exploitation: "Attacker injected random byte sequence into quarterly financial spreadsheet to disrupt operations.",
        whyFailed: "Storage server lacked Write-Once-Read-Many (WORM) immutable snapshot enforcement.",
        preventedBy: "Immutable shadow copy retention and file system integrity monitoring with immediate automated reversion.",
        recommendedFix: "Enable WORM storage on executive financial repositories; isolate file share access credentials."
      },
      evidence_items: [
        {
          type: "File Integrity Monitor",
          source: "FileIntegrityEngine (FileServer-303)",
          description: "SHA-256 hash changed from 8f9b4... to da39a... (Corrupted data detected)",
          status: "CONFIRMED",
          confidence: 100
        },
        {
          type: "SMB Audit Record",
          source: "FileServer-303 Samba Log",
          description: "Write request granted to UID 0 for file /shares/finance/financial_report.xlsx",
          status: "CONFIRMED",
          confidence: 96
        }
      ]
    },
    {
      event_id: "EVT-C04-09",
      step_number: 9,
      relative_time: "+00:22s",
      timestamp: 1725450122,
      formatted_time: "14:30:22",
      source_device: "AppServer-301",
      destination_device: "FileServer-303",
      user: "root_daemon",
      event_type: "FILE_DELETED",
      floor: 3,
      room: "Server Rack B1",
      network_segment: "VLAN-30-SERVERS",
      severity: "CRITICAL",
      description: "Malicious deletion of security_config.json detected",
      stage_name: "IMPACT",
      stage_index: 6,
      action_name: "Security Configuration Destruction",
      confidence_pct: 97,
      is_anomaly: true,
      is_duplicate: false,
      is_delayed: false,
      delay_seconds: 0,
      threat_score_snapshot: 98,
      is_reconstructed: false,
      loophole: {
        id: "LOOP-09",
        title: "Mutable Security Configuration Files",
        weakness: "Core security definitions lacked OS-level immutable flags (chattr +i).",
        exploitation: "Adversary deleted security_config.json to disable automated SOC alert hooks and tamper detection.",
        whyFailed: "Configuration directory permissions trusted root user completely without kernel protection.",
        preventedBy: "Kernel-level mandatory access control (SELinux) preventing deletion of /etc/security assets even by root.",
        recommendedFix: "Set immutable bit ('chattr +i') on all security configuration assets and ship backups to cloud enclaves."
      },
      evidence_items: [
        {
          type: "Kernel Inotify Event",
          source: "Linux Kernel Audit",
          description: "IN_DELETE event triggered on path /etc/cybertrace/security_config.json",
          status: "CONFIRMED",
          confidence: 100
        },
        {
          type: "Filesystem Snapshot",
          source: "Btrfs / ZFS Snapshot Stream",
          description: "File absent in present live state; available in snapshot version 1 (recovery possible)",
          status: "CONFIRMED",
          confidence: 98
        }
      ]
    },
    {
      event_id: "EVT-C04-10",
      step_number: 10,
      relative_time: "+00:25s",
      timestamp: 1725450125,
      formatted_time: "14:30:25",
      source_device: "AppServer-301",
      destination_device: "SmartDoor-403",
      user: "root_daemon",
      event_type: "DOOR_UNLOCKED_UNAUTHORIZED",
      floor: 4,
      room: "Executive Access Air-Lock",
      network_segment: "VLAN-40-SEC-OT",
      severity: "CRITICAL",
      description: "Unauthorized physical door unlock command sent to Executive Smart Lock",
      stage_name: "IMPACT",
      stage_index: 6,
      action_name: "Physical OT Access Sabotage",
      confidence_pct: 93,
      is_anomaly: true,
      is_duplicate: false,
      is_delayed: false,
      delay_seconds: 0,
      threat_score_snapshot: 100,
      is_reconstructed: false,
      loophole: {
        id: "LOOP-10",
        title: "Unauthenticated OT Protocol (BACnet/IP)",
        weakness: "Physical access control system uses unencrypted BACnet protocol without payload signing.",
        exploitation: "Attacker transmitted raw UDP packet with opcode 0x0C (ReleaseDoor) directly from compromised AppServer.",
        whyFailed: "Building Management System (BMS) assumed all packets arriving on VLAN-40 were legitimate hardware triggers.",
        preventedBy: "BACnet Secure Connect (BACnet/SC) or physical data diode preventing IT servers from sending OT write commands.",
        recommendedFix: "Migrate all access controllers to BACnet/SC with TLS certificates; physically isolate OT controllers."
      },
      evidence_items: [
        {
          type: "BMS Access Controller Log",
          source: "DoorController-403 Hardware Log",
          description: "Remote Override Signal received: Door unlocked for 600 seconds by IP 10.3.10.15",
          status: "CONFIRMED",
          confidence: 96
        },
        {
          type: "Network Packet Capture",
          source: "Wireshark PCAP (Port 47808)",
          description: "BACnet-Unconfirmed-Request-PDU containing write-property door_status = UNLOCKED",
          status: "CONFIRMED",
          confidence: 94
        }
      ]
    },
    {
      event_id: "EVT-C04-11",
      step_number: 11,
      relative_time: "+00:28s",
      timestamp: 1725450128,
      formatted_time: "14:30:28",
      source_device: "CCTV-101",
      destination_device: "CCTV-Master-402",
      user: "SYSTEM",
      event_type: "CCTV_DISCONNECT",
      floor: 1,
      room: "Main Entrance",
      network_segment: "VLAN-40-SEC-OT",
      severity: "HIGH",
      description: "Main Entrance CCTV video telemetry stream abruptly disconnected",
      stage_name: "DEFENSE_EVASION",
      stage_index: 7,
      action_name: "Surveillance Stream Disruption",
      confidence_pct: 88,
      is_anomaly: true,
      is_duplicate: false,
      is_delayed: false,
      delay_seconds: 0,
      threat_score_snapshot: 100,
      is_reconstructed: true,
      reconstruction_reason:
        "CCTV camera hardware log was wiped by network disconnect; inferred from synchronized TCP RST injection and correlation with Executive Door unlock event.",
      loophole: {
        id: "LOOP-11",
        title: "Unencrypted RTSP Video Feed & Missing Keepalive Verification",
        weakness: "Surveillance video transmitted via plaintext RTSP without cryptographic integrity or heartbeat alerting.",
        exploitation: "Attacker injected forged TCP RST packets terminating the main entrance video stream during physical intrusion.",
        whyFailed: "Network video recorder (NVR) treated connection drop as intermittent network glitch rather than security breach.",
        preventedBy: "Secure Real-time Transport Protocol (SRTP) over TLS with immediate acoustic alarm on stream drops.",
        recommendedFix: "Implement SRTP on all IP cameras; configure immediate critical SOC escalation if any entrance camera goes offline."
      },
      evidence_items: [
        {
          type: "Network Telemetry",
          source: "Firewall Connection State",
          description: "TCP RST packet injected with out-of-order sequence number matching camera RTSP session",
          status: "RECONSTRUCTED",
          confidence: 88
        },
        {
          type: "Physical Correlation",
          source: "Forensic Correlation Engine",
          description: "CCTV disconnect occurred within 3.0s of Executive Door unlock command (Coordinated physical cover)",
          status: "INFERRED",
          confidence: 90
        }
      ]
    }
  ]
};

const SCENARIO_RANSOMWARE: ForensicIncidentScenario = {
  id: "ransomware_wave",
  title: "Zero-Day Ransomware Wave & Shared Storage Encryption",
  incident_code: "INC-2026-RW8",
  type: "Cryptographic Ransomware & Storage Extortion",
  target_asset: "FileServer-303 Shared Drives",
  summary:
    "Phishing macro attachment on Corporate Workstation-201 executed ransomware payload, traversed to network storage shares, and initiated mass encryption on enterprise spreadsheets and customer records.",
  critical_gaps: [
    {
      title: "Email Gateway Macro Inspection Failure",
      risk: "Malicious Office macro bypassed email perimeter scanner.",
      exploitation: "User opened invoice spreadsheet attachment executing PowerShell cradle.",
      impact: "Initial execution on user workstation.",
      mitigation: "Block all incoming macros by default across the organization."
    },
    {
      title: "Excessive Network Share Permissions",
      risk: "Standard user account possessed unrestricted write permissions across critical file shares.",
      exploitation: "Ransomware script encrypted shared files across the entire department.",
      impact: "Business disruption and encrypted corporate ledgers.",
      mitigation: "Enforce strict write-access separation and automated snapshot locks."
    }
  ],
  steps: [
    {
      event_id: "EVT-RW-01",
      step_number: 1,
      relative_time: "+00:01s",
      timestamp: 1725450200,
      formatted_time: "15:10:01",
      source_device: "Workstation-201",
      destination_device: "CoreSwitch-201",
      user: "finance_analyst",
      event_type: "UNUSUAL_LOGIN",
      floor: 2,
      room: "Finance Office",
      network_segment: "VLAN-20-CORP",
      severity: "MEDIUM",
      description: "Phishing payload executed via macro attachment on Workstation-201",
      stage_name: "INITIAL_ACCESS",
      stage_index: 1,
      action_name: "Malicious Macro Execution",
      confidence_pct: 94,
      is_anomaly: true,
      is_duplicate: false,
      is_delayed: false,
      delay_seconds: 0,
      threat_score_snapshot: 35,
      is_reconstructed: false,
      loophole: {
        id: "LOOP-RW-01",
        title: "Unblocked VBA Macros on Corporate Endpoints",
        weakness: "Workstation-201 permitted execution of untrusted Excel VBA macros downloaded from the internet.",
        exploitation: "User clicked 'Enable Content' on malicious Q1_Audit_Invoice.xlsm invoice email.",
        whyFailed: "Endpoint Attack Surface Reduction (ASR) rules were in warning mode, not block mode.",
        preventedBy: "Group Policy blocking macros in Office files originating from external email.",
        recommendedFix: "Enforce Microsoft ASR rule 'Block Win32 API calls from Office macros' in block mode."
      },
      evidence_items: [
        {
          type: "Process Creation",
          source: "Sysmon Event ID 1",
          description: "EXCEL.EXE spawned powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden",
          status: "CONFIRMED",
          confidence: 100
        }
      ]
    },
    {
      event_id: "EVT-RW-02",
      step_number: 2,
      relative_time: "+00:04s",
      timestamp: 1725450204,
      formatted_time: "15:10:04",
      source_device: "Workstation-201",
      destination_device: "FileServer-303",
      user: "finance_analyst",
      event_type: "RANSOMWARE_ENCRYPTION",
      floor: 3,
      room: "Server Rack B1",
      network_segment: "VLAN-30-SERVERS",
      severity: "CRITICAL",
      description: "Mass file encryption sequence initiated on network share (employee_records.csv)",
      stage_name: "IMPACT",
      stage_index: 2,
      action_name: "Cryptographic File Locking",
      confidence_pct: 99,
      is_anomaly: true,
      is_duplicate: false,
      is_delayed: false,
      delay_seconds: 0,
      threat_score_snapshot: 78,
      is_reconstructed: false,
      loophole: {
        id: "LOOP-RW-02",
        title: "Absence of Canary Files & High-Frequency Write Throttling",
        weakness: "SMB share permitted uninterrupted bulk write and rename operations without anomaly throttling.",
        exploitation: "Ransomware loop encrypted 140 files in 4 seconds with RSA-2048 key.",
        whyFailed: "File server storage driver had no behavior-based entropy or rapid rename detection.",
        preventedBy: "Storage canary file tripwires that automatically terminate SMB sessions on abnormal extension changes.",
        recommendedFix: "Deploy automated anti-ransomware file server screening and canary file detection."
      },
      evidence_items: [
        {
          type: "Entropy Measurement",
          source: "File Integrity Engine",
          description: "File entropy jumped from 3.84 to 7.99 (Indicating strong encryption)",
          status: "CONFIRMED",
          confidence: 99
        }
      ]
    },
    {
      event_id: "EVT-RW-03",
      step_number: 3,
      relative_time: "+00:07s",
      timestamp: 1725450207,
      formatted_time: "15:10:07",
      source_device: "Workstation-201",
      destination_device: "FileServer-303",
      user: "finance_analyst",
      event_type: "FILE_CORRUPTED",
      floor: 3,
      room: "Server Rack B1",
      network_segment: "VLAN-30-SERVERS",
      severity: "CRITICAL",
      description: "Ransomware encryption spreading to project_data.json",
      stage_name: "IMPACT",
      stage_index: 2,
      action_name: "Secondary Repository Tampering",
      confidence_pct: 95,
      is_anomaly: true,
      is_duplicate: false,
      is_delayed: false,
      delay_seconds: 0,
      threat_score_snapshot: 95,
      is_reconstructed: false,
      loophole: {
        id: "LOOP-RW-03",
        title: "Shadow Copy Deletion Capability",
        weakness: "Workstation attempted vssadmin delete shadows command.",
        exploitation: "Attempted to delete local backup copies to maximize extortion leverage.",
        whyFailed: "Endpoint security failed to prevent vssadmin execution.",
        preventedBy: "Tamper-protected immutable volume shadow copies stored on non-domain storage.",
        recommendedFix: "Block access to vssadmin.exe and isolate backup repositories on air-gapped immutable storage."
      },
      evidence_items: [
        {
          type: "File Integrity Engine",
          source: "Snapshot Verification",
          description: "project_data.json marked CORRUPTED; automated immutable snapshot snapshot_v1 preserved",
          status: "CONFIRMED",
          confidence: 100
        }
      ]
    }
  ]
};

const SCENARIO_OT: ForensicIncidentScenario = {
  id: "ot_sabotage",
  title: "IoT Firmware Backdoor & Facilities Thermal Sabotage",
  incident_code: "INC-2026-OT3",
  type: "Cyber-Physical OT Sabotage",
  target_asset: "IndustrialHVAC-405 & BMS-Controller-404",
  summary:
    "A backdoored IoT Gateway in Telecom Hub communicated with Command-and-Control, laterally connected to Building Management Controller, and shut down Datacenter cooling chillers to cause thermal equipment damage.",
  critical_gaps: [
    {
      title: "Unverified Third-Party IoT Firmware",
      risk: "IoT Gateway running unverified firmware containing hardcoded backdoor.",
      exploitation: "Attacker sent C2 beacon commands over MQTT port 1883.",
      impact: "Foothold in IoT VLAN.",
      mitigation: "Enforce cryptographically signed firmware verification (Secure Boot) on all IoT devices."
    },
    {
      title: "Shared Network Between HVAC Controls & Server Room",
      risk: "Datacenter chiller control network bridged with general facility IoT.",
      exploitation: "Adversary issued override setpoint command setting chiller temperature to +45°C.",
      impact: "Thermal shutdown risk for Datacenter servers.",
      mitigation: "Isolate HVAC and life-safety systems on a separate physical or cryptographically isolated network."
    }
  ],
  steps: [
    {
      event_id: "EVT-OT-01",
      step_number: 1,
      relative_time: "+00:01s",
      timestamp: 1725450300,
      formatted_time: "16:00:01",
      source_device: "IoTGateway-201",
      destination_device: "BMS-Controller-404",
      user: "mqtt_service",
      event_type: "BEACONING",
      floor: 2,
      room: "Telecom & IoT Hub",
      network_segment: "VLAN-50-IOT",
      severity: "HIGH",
      description: "Firmware backdoor beaconing detected from IoT Gateway",
      stage_name: "INITIAL_ACCESS",
      stage_index: 1,
      action_name: "C2 Protocol Beaconing",
      confidence_pct: 92,
      is_anomaly: true,
      is_duplicate: false,
      is_delayed: false,
      delay_seconds: 0,
      threat_score_snapshot: 40,
      is_reconstructed: false,
      loophole: {
        id: "LOOP-OT-01",
        title: "Supply Chain Firmware Vulnerability",
        weakness: "IoT Gateway firmware contained undocumented reverse shell listener on port 8883.",
        exploitation: "External attacker activated reverse TCP tunnel using pre-shared hardcoded credentials.",
        whyFailed: "IoT device was not scanned during procurement and firmware integrity was unverified.",
        preventedBy: "Software Bill of Materials (SBOM) verification and network microsegmentation for IoT.",
        recommendedFix: "Implement strict egress firewalls allowing IoT devices to only communicate with whitelisted cloud endpoints."
      },
      evidence_items: [
        {
          type: "Network Beaconing Analysis",
          source: "Deep Packet Inspection (DPI)",
          description: "Periodic heartbeat beacon detected every 60.0s to external IP 198.51.100.42",
          status: "CONFIRMED",
          confidence: 94
        }
      ]
    },
    {
      event_id: "EVT-OT-02",
      step_number: 2,
      relative_time: "+00:04s",
      timestamp: 1725450304,
      formatted_time: "16:00:04",
      source_device: "BMS-Controller-404",
      destination_device: "IndustrialHVAC-405",
      user: "admin_bms",
      event_type: "BMS_HVAC_SETPOINT_CHANGE",
      floor: 4,
      room: "HVAC Datacenter Chiller Plant",
      network_segment: "VLAN-40-SEC-OT",
      severity: "CRITICAL",
      description: "Dangerous chiller setpoint override: Datacenter cooling shut down command",
      stage_name: "IMPACT",
      stage_index: 2,
      action_name: "Thermal Sabotage Override",
      confidence_pct: 97,
      is_anomaly: true,
      is_duplicate: false,
      is_delayed: false,
      delay_seconds: 0,
      threat_score_snapshot: 95,
      is_reconstructed: false,
      loophole: {
        id: "LOOP-OT-02",
        title: "Absence of Physical Safety Interlocks",
        weakness: "Software command allowed to override thermal chiller limits beyond safe hardware operating range.",
        exploitation: "Attacker sent Modbus write command disabling all 3 primary Datacenter cooling compressors.",
        whyFailed: "Industrial controller lacked analog hardwired safety relays to prevent software over-temp commands.",
        preventedBy: "Hardwired bimetallic physical thermal cutout switches that ignore software overrides.",
        recommendedFix: "Install hardwired physical limit switches and require two-man rule authorization for chiller shutdowns."
      },
      evidence_items: [
        {
          type: "Modbus/TCP Protocol Log",
          source: "HVAC Controller Bus Monitor",
          description: "Modbus Function 06 (Write Single Register) to Register 40012: Setpoint changed from 18°C to 45°C",
          status: "CONFIRMED",
          confidence: 98
        },
        {
          type: "Environmental Sensor",
          source: "Server Rack Ambient Temp",
          description: "Ambient intake temperature rising at +1.4°C per minute",
          status: "CONFIRMED",
          confidence: 96
        }
      ]
    }
  ]
};

const SCENARIOS: ForensicIncidentScenario[] = [
  SCENARIO_COORDINATED,
  SCENARIO_RANSOMWARE,
  SCENARIO_OT
];

// --------------------------------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------------------------------

export const ForensicReplayPage: React.FC = () => {
  const { state, setSelectedDeviceId, setActiveTab, triggerScenario } = useSimulation();

  // Active scenario selection
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("coordinated_attack");
  const [useLiveStream, setUseLiveStream] = useState<boolean>(false);

  // Playback transport state
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const timerRef = useRef<any>(null);

  // Active tab inside Forensic Replay (Replay, Security Loopholes, Evidence Correlation, Gaps, Summary, Notes)
  const [activeSubTab, setActiveSubTab] = useState<"replay" | "loopholes" | "evidence" | "gaps" | "summary" | "notes">("replay");

  // Analyst notes state (persisted to localStorage)
  const [analystNotes, setAnalystNotes] = useState<AnalystNote[]>(() => {
    try {
      const saved = localStorage.getItem("cybertrace_forensic_notes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newNoteText, setNewNoteText] = useState("");

  // Check if live incident has events
  const liveIncidentEvents = useMemo(() => {
    if (!state?.incident_event_history || state.incident_event_history.length === 0) {
      return [];
    }
    return state.incident_event_history.filter((e) => e.is_anomaly || e.attack_stage);
  }, [state?.incident_event_history]);

  // Active scenario object
  const currentScenario: ForensicIncidentScenario = useMemo(() => {
    if (useLiveStream && liveIncidentEvents.length > 0) {
      // Build dynamic scenario from live events
      const steps: ForensicReplayStep[] = liveIncidentEvents.map((ev, idx) => {
        const stage = ev.attack_stage || "INCIDENT_STAGE";
        return {
          ...ev,
          step_number: idx + 1,
          relative_time: `+00:${idx * 3 < 10 ? "0" + idx * 3 : idx * 3}s`,
          stage_name: stage,
          stage_index: idx + 1,
          action_name: ev.description || "Suspicious Telemetry Event",
          confidence_pct: Math.min(99, 78 + (idx * 3) % 20),
          is_reconstructed: !ev.evidence_source || ev.evidence_source === "RECONSTRUCTED",
          reconstruction_reason:
            !ev.evidence_source || ev.evidence_source === "RECONSTRUCTED"
              ? "Reconstructed via multi-hop correlation engine across network telemetry."
              : undefined,
          loophole: {
            id: `LIVE-LOOP-${idx + 1}`,
            title: `Exploitation on ${ev.source_device}`,
            weakness: `Security control bypassed on network segment ${ev.network_segment || "VLAN-CORP"}.`,
            exploitation: ev.description || "Unusual activity observed traversing target device.",
            whyFailed: "Telemetry policy allowed anomalous packet patterns without proactive termination.",
            preventedBy: "Autonomous Zero-Trust containment and microsegmentation policy.",
            recommendedFix: "Quarantine source asset and inspect historical audit log records."
          },
          evidence_items: [
            {
              type: "Live Telemetry Feed",
              source: ev.evidence_source || "Security Event Log",
              description: ev.description || "Live telemetry anomaly recorded by correlation engine",
              status: ev.evidence_source === "RECONSTRUCTED" ? "RECONSTRUCTED" : "CONFIRMED",
              confidence: 90
            }
          ]
        };
      });

      return {
        id: "live_stream",
        title: "Live Recorded Simulation Incident",
        incident_code: state?.active_incident?.incident_id || "INC-LIVE-STREAM",
        type: "Real-time Attack Simulation Stream",
        target_asset: state?.active_incident?.reconstructed_path?.slice(-1)[0] || "Core Infrastructure",
        summary: `Live recorded telemetry stream containing ${liveIncidentEvents.length} suspicious events detected by Correlation Engine.`,
        critical_gaps: SCENARIO_COORDINATED.critical_gaps,
        steps: steps
      };
    }

    return SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIO_COORDINATED;
  }, [selectedScenarioId, useLiveStream, liveIncidentEvents, state?.active_incident]);

  const replayEvents = currentScenario.steps;
  const totalSteps = replayEvents.length;
  const currentEvent: ForensicReplayStep | null = replayEvents[currentStep] || replayEvents[0] || null;
  const isComplete = totalSteps > 0 && currentStep === totalSteps - 1;

  // Replay timer loop
  useEffect(() => {
    if (isPlaying && totalSteps > 0) {
      const intervalMs = 2000 / speed;
      timerRef.current = setTimeout(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, speed, totalSteps]);

  // Reset step on scenario switch
  const handleSelectScenario = (id: string) => {
    setIsPlaying(false);
    setSelectedScenarioId(id);
    setUseLiveStream(false);
    setCurrentStep(0);
  };

  const handleSelectLiveStream = () => {
    setIsPlaying(false);
    setUseLiveStream(true);
    setCurrentStep(0);
  };

  // Traversal sets for Graph rendering
  const { activeNodeSet, activeEdgeSet, currentNodeId, attackPathNodes } = useMemo(() => {
    const nodes = new Set<string>();
    const edges = new Set<string>();
    const pathNodesList: string[] = [];
    let current = "";

    for (let i = 0; i <= currentStep && i < replayEvents.length; i++) {
      const ev = replayEvents[i];
      if (ev.source_device) {
        nodes.add(ev.source_device);
        if (!pathNodesList.includes(ev.source_device)) pathNodesList.push(ev.source_device);
      }
      if (ev.destination_device) {
        nodes.add(ev.destination_device);
        edges.add(`${ev.source_device}->${ev.destination_device}`);
        if (!pathNodesList.includes(ev.destination_device)) pathNodesList.push(ev.destination_device);
      }
      if (i === currentStep) {
        current = ev.destination_device || ev.source_device;
      }
    }

    return {
      activeNodeSet: nodes,
      activeEdgeSet: edges,
      currentNodeId: current,
      attackPathNodes: pathNodesList
    };
  }, [replayEvents, currentStep]);

  // Topology node positioning
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    if (!state?.graph?.nodes) return positions;

    const floorGroups: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [] };
    state.graph.nodes.forEach((n: GraphNode) => {
      if (floorGroups[n.floor]) floorGroups[n.floor].push(n.id);
    });

    const tierX = { 1: 120, 2: 360, 3: 600, 4: 840 };
    Object.entries(floorGroups).forEach(([floorStr, ids]) => {
      const f = Number(floorStr);
      const x = tierX[f as keyof typeof tierX] || 400;
      const count = ids.length;
      const spacingY = 480 / (count + 1);

      ids.forEach((id: string, idx: number) => {
        positions[id] = {
          x: x + (idx % 2 === 0 ? -18 : 18),
          y: (idx + 1) * spacingY + 38
        };
      });
    });

    return positions;
  }, [state?.graph?.nodes]);

  // Playback handlers
  const handlePlayToggle = () => {
    if (isComplete) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1));
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setCurrentStep(Number(e.target.value));
  };

  // Add analyst note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const noteObj: AnalystNote = {
      id: `NOTE-${Date.now()}`,
      stepIndex: currentStep,
      author: "Lead SOC Analyst",
      timestamp: new Date().toLocaleTimeString(),
      note: newNoteText.trim()
    };

    const updated = [noteObj, ...analystNotes];
    setAnalystNotes(updated);
    setNewNoteText("");
    try {
      localStorage.setItem("cybertrace_forensic_notes", JSON.stringify(updated));
    } catch {}
  };

  const handleDeleteNote = (id: string) => {
    const filtered = analystNotes.filter((n) => n.id !== id);
    setAnalystNotes(filtered);
    try {
      localStorage.setItem("cybertrace_forensic_notes", JSON.stringify(filtered));
    } catch {}
  };

  // Export Replay Analysis Report
  const handleExportReport = () => {
    const lines = [
      `# CYBERTRACE AI - FORENSIC ATTACK REPLAY DOSSIER`,
      `Generated: ${new Date().toUTCString()}`,
      `Classification: SOC RESTRICTED // FORENSIC EVIDENCE`,
      ``,
      `## 1. INCIDENT OVERVIEW`,
      `- Incident Code: ${currentScenario.incident_code}`,
      `- Incident Name: ${currentScenario.title}`,
      `- Attack Classification: ${currentScenario.type}`,
      `- Critical Target Asset: ${currentScenario.target_asset}`,
      `- Total Playback Events: ${totalSteps}`,
      `- Executive Summary: ${currentScenario.summary}`,
      ``,
      `## 2. RECONSTRUCTED ATTACK PATH`,
      `Path: ${attackPathNodes.join(" ➔ ")}`,
      `- Total Nodes Compromised: ${activeNodeSet.size}`,
      `- Lateral Traversal Transitions: ${activeEdgeSet.size}`,
      ``,
      `## 3. CHRONOLOGICAL FORENSIC TIMELINE & SECURITY LOOPHOLES`
    ];

    currentScenario.steps.forEach((st) => {
      lines.push(
        `### Event #${st.step_number} [${st.relative_time}] - ${st.stage_name}`,
        `- Event ID: ${st.event_id}`,
        `- Source: ${st.source_device} (Floor ${st.floor}, ${st.room || "N/A"})`,
        `- Target: ${st.destination_device || "N/A"}`,
        `- Account: ${st.user || "SYSTEM"}`,
        `- Action: ${st.action_name}`,
        `- Severity: ${st.severity}`,
        `- Forensic Confidence: ${st.confidence_pct}%`,
        `- Status: ${st.is_reconstructed ? "RECONSTRUCTED (Inferred)" : "CONFIRMED (Direct Log)"}`,
        st.is_reconstructed ? `- Reconstruction Reason: ${st.reconstruction_reason}` : "",
        `- Security Weakness: ${st.loophole.weakness}`,
        `- Exploitation: ${st.loophole.exploitation}`,
        `- Why Control Failed: ${st.loophole.whyFailed}`,
        `- Recommended Fix: ${st.loophole.recommendedFix}`,
        ``
      );
    });

    lines.push(`## 4. IDENTIFIED CRITICAL SYSTEMIC GAPS`);
    currentScenario.critical_gaps.forEach((gap, idx) => {
      lines.push(
        `### Gap #${idx + 1}: ${gap.title}`,
        `- Risk: ${gap.risk}`,
        `- Exploitation: ${gap.exploitation}`,
        `- Impact: ${gap.impact}`,
        `- Recommended Mitigation: ${gap.mitigation}`,
        ``
      );
    });

    if (analystNotes.length > 0) {
      lines.push(`## 5. ANALYST INVESTIGATION NOTES`);
      analystNotes.forEach((n) => {
        lines.push(`- [${n.timestamp}] Event #${n.stepIndex + 1} (${n.author}): ${n.note}`);
      });
    }

    const blob = new Blob([lines.filter(Boolean).join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CyberTrace_Forensic_Replay_${currentScenario.incident_code}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Distinct MITRE stages for progression calculation
  const distinctStages = useMemo(() => {
    const map = new Map<string, number>();
    currentScenario.steps.forEach((s) => {
      if (!map.has(s.stage_name)) {
        map.set(s.stage_name, s.stage_index);
      }
    });
    return Array.from(map.entries()).map(([name, idx]) => ({ name, idx }));
  }, [currentScenario]);

  const currentStageIndex = currentEvent?.stage_index ?? 1;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-100">
      {/* CSS for Replay Pulse and Scanning */}
      <style>{`
        @keyframes replayActivePulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(244,63,94,0.9)); }
          50% { transform: scale(1.06); filter: drop-shadow(0 0 20px rgba(244,63,94,1)); }
        }
        .replay-pulse-node {
          animation: replayActivePulse 1.8s infinite ease-in-out;
        }
      `}</style>

      {/* TOP HEADER & INCIDENT SELECTOR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <PlayCircle className="w-6 h-6 text-cyan-400 shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-wide text-white">
                FORENSIC ATTACK REPLAY & ANALYSIS
              </h2>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              {currentScenario.incident_code}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Deterministic Attack Path Reconstruction • Multi-Hop Traversal • Security Loophole Analysis
          </p>
        </div>

        {/* Action Buttons: Export Report & Switch to Reconstruction */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportReport}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,240,255,0.15)] cursor-pointer"
            title="Download full forensic analysis report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT REPORT</span>
          </button>
          <button
            onClick={() => setActiveTab("reconstruction")}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-950 to-slate-900 border border-purple-500/40 hover:border-purple-400 text-purple-300 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <SearchCode className="w-3.5 h-3.5 text-purple-400" />
            <span>GRAPH EVIDENCE</span>
          </button>
        </div>
      </div>

      {/* INCIDENT SELECTION TABS */}
      <div className="cyber-card p-3 border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Crosshair className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-semibold text-slate-300">SELECT INCIDENT:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SCENARIOS.map((sc) => {
            const isSelected = !useLiveStream && selectedScenarioId === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.25)] font-bold"
                    : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700"
                }`}
              >
                <span>{sc.incident_code}</span>
                <span className="hidden sm:inline">• {sc.title.split("&")[0].trim()}</span>
              </button>
            );
          })}

          {/* Live stream option */}
          <button
            onClick={handleSelectLiveStream}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              useLiveStream
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.3)] font-bold"
                : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>LIVE SIMULATOR STREAM</span>
            {liveIncidentEvents.length > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 text-[10px] font-bold">
                {liveIncidentEvents.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* REPLAY CONTROLS TRANSPORT BAR */}
      <div className="cyber-card p-4 border-cyan-500/30 bg-slate-950 shadow-[0_0_25px_rgba(0,240,255,0.12)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Playback Transport Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              title="Restart Replay"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Event (Step Backward)"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={handlePlayToggle}
              className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isPlaying
                  ? "bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.45)]"
                  : isComplete
                  ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(0,240,255,0.45)]"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.45)]"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>PAUSE REPLAY</span>
                </>
              ) : isComplete ? (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>REPLAY AGAIN</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>PLAY REPLAY</span>
                </>
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentStep === totalSteps - 1}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Next Event (Step Forward)"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Telemetry Status Readout */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            {/* Event Number */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 mr-1.5">EVENT</span>
              <strong className="text-cyan-300 font-bold">
                {String(currentStep + 1).padStart(2, "0")} / {String(totalSteps).padStart(2, "0")}
              </strong>
            </div>

            {/* Time Offset */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">TIME:</span>
              <strong className="text-white font-bold">{currentEvent?.relative_time || "+00:00s"}</strong>
            </div>

            {/* Stage */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <span className="text-slate-400">STAGE:</span>
              <strong className="text-rose-400 font-bold uppercase text-[11px]">
                {currentEvent?.stage_name.replace("_", " ") || "INITIAL"}
              </strong>
            </div>

            {/* Playback Speed Controls */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-0.5">
              {[0.5, 1.0, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    speed === s
                      ? "bg-cyan-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Timeline Scrubber Slider */}
        <div className="space-y-1.5 pt-1">
          <input
            type="range"
            min="0"
            max={Math.max(0, totalSteps - 1)}
            value={currentStep}
            onChange={handleScrubberChange}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>START: {replayEvents[0]?.formatted_time || "14:30:00"}</span>
            <span className="text-cyan-300 font-semibold">
              {Math.round(((currentStep + 1) / Math.max(1, totalSteps)) * 100)}% PLAYED
            </span>
            <span>FINAL: {replayEvents[totalSteps - 1]?.formatted_time || "14:30:28"}</span>
          </div>
        </div>
      </div>

      {/* ATTACK PATH VISUALIZATION RIBBON */}
      <div className="cyber-card p-4 border-slate-800 bg-slate-950/90 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white uppercase tracking-wider">
              ATTACK TRAVERSAL PATH PROGRESSION
            </span>
          </div>
          <span className="text-slate-400 text-[11px]">
            {activeNodeSet.size} Compromised Assets • {activeEdgeSet.size} Lateral Hops
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-thin">
          {/* External Attacker Node */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(244,63,94,0.3)]">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>External Attacker</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          </div>

          {/* Sequence of Replay Steps */}
          {replayEvents.map((step, idx) => {
            const isActive = idx === currentStep;
            const isPassed = idx < currentStep;

            return (
              <React.Fragment key={step.event_id}>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStep(idx);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-rose-600 text-white border-2 border-white shadow-[0_0_18px_rgba(244,63,94,0.9)] scale-105"
                      : isPassed
                      ? "bg-slate-900 text-slate-300 border border-rose-500/40"
                      : "bg-slate-950 text-slate-600 border border-slate-800/80"
                  }`}
                >
                  <span className="text-[10px] opacity-75">#{step.step_number}</span>
                  <span>{step.destination_device || step.source_device}</span>
                  {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </button>
                {idx < replayEvents.length - 1 && (
                  <ArrowRight
                    className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                      isPassed ? "text-rose-500" : "text-slate-700"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* INTERACTIVE GRAPH & TOPOLOGY CANVAS */}
      <div className="cyber-card p-4 border-slate-800 bg-slate-950 relative overflow-hidden flex flex-col justify-between min-h-[520px]">
        {/* Graph Overlay Header */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">ACTIVE POSITION:</span>
            <strong className="text-rose-400 font-bold flex items-center gap-1.5 bg-rose-950/60 border border-rose-500/40 px-2.5 py-0.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              {currentNodeId || "Infiltration Point"}
            </strong>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">CURRENT THREAT LEVEL:</span>
            <strong className="text-amber-400 font-bold text-sm bg-amber-950/60 border border-amber-500/40 px-2.5 py-0.5 rounded-lg">
              {currentEvent?.threat_score_snapshot ?? 45}/100
            </strong>
          </div>
        </div>

        {/* SVG Canvas for Topological Attack Path */}
        <div className="flex-1 w-full relative overflow-auto py-3">
          <svg width="980" height="490" className="mx-auto">
            {/* Background Floor Tiers */}
            <g>
              <rect x="16" y="14" width="210" height="460" rx="10" fill="rgba(15, 23, 42, 0.45)" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="6 4" />
              <rect x="16" y="14" width="210" height="26" rx="8" fill="rgba(15, 23, 42, 0.8)" />
              <text x="26" y="32" fill="#38bdf8" fontSize="10.5" fontFamily="monospace" fontWeight="bold">LEVEL 1: PUBLIC EDGE</text>

              <rect x="256" y="14" width="224" height="460" rx="10" fill="rgba(15, 23, 42, 0.45)" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="6 4" />
              <rect x="256" y="14" width="224" height="26" rx="8" fill="rgba(15, 23, 42, 0.8)" />
              <text x="266" y="32" fill="#fbbf24" fontSize="10.5" fontFamily="monospace" fontWeight="bold">LEVEL 2: CORP & IOT</text>

              <rect x="506" y="14" width="214" height="460" rx="10" fill="rgba(15, 23, 42, 0.45)" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="6 4" />
              <rect x="506" y="14" width="214" height="26" rx="8" fill="rgba(15, 23, 42, 0.8)" />
              <text x="516" y="32" fill="#fb923c" fontSize="10.5" fontFamily="monospace" fontWeight="bold">LEVEL 3: DATACENTER</text>

              <rect x="746" y="14" width="220" height="460" rx="10" fill="rgba(15, 23, 42, 0.45)" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="6 4" />
              <rect x="746" y="14" width="220" height="26" rx="8" fill="rgba(15, 23, 42, 0.8)" />
              <text x="756" y="32" fill="#f43f5e" fontSize="10.5" fontFamily="monospace" fontWeight="bold">LEVEL 4: SOC & OT</text>
            </g>

            {/* Edges */}
            {state?.graph?.edges?.map((edge: GraphEdge) => {
              const p1 = nodePositions[edge.source];
              const p2 = nodePositions[edge.target];
              if (!p1 || !p2) return null;

              const isReplayEdge =
                activeEdgeSet.has(edge.id) ||
                activeEdgeSet.has(`${edge.source}->${edge.target}`) ||
                activeEdgeSet.has(`${edge.target}->${edge.source}`);

              return (
                <line
                  key={edge.id}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isReplayEdge ? "#f43f5e" : "#334155"}
                  strokeWidth={isReplayEdge ? 3.5 : 1}
                  strokeDasharray={isReplayEdge ? "8 4" : undefined}
                  opacity={isReplayEdge ? 1.0 : 0.35}
                  style={{
                    filter: isReplayEdge ? "drop-shadow(0 0 8px rgba(244,63,94,0.8))" : undefined
                  }}
                />
              );
            })}

            {/* Nodes */}
            {state?.graph?.nodes?.map((node: GraphNode) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const isCompromised = activeNodeSet.has(node.id);
              const isCurrentlyActive = currentNodeId === node.id;

              const cardW = 104;
              const cardH = 42;

              const cardBg = isCurrentlyActive
                ? "rgba(159, 18, 57, 0.8)"
                : isCompromised
                ? "rgba(131, 24, 67, 0.5)"
                : "rgba(15, 23, 42, 0.9)";

              const cardBorder = isCurrentlyActive
                ? "#f43f5e"
                : isCompromised
                ? "#fb7185"
                : "#334155";

              const statusColor = isCompromised ? "#f43f5e" : "#10b981";

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x - cardW / 2}, ${pos.y - cardH / 2})`}
                  onClick={() => setSelectedDeviceId(node.id)}
                  className="cursor-pointer group"
                >
                  {isCurrentlyActive && (
                    <rect
                      x="-4"
                      y="-4"
                      width={cardW + 8}
                      height={cardH + 8}
                      rx="10"
                      fill="transparent"
                      stroke="#f43f5e"
                      strokeWidth="2"
                      className="animate-ping"
                      opacity="0.5"
                    />
                  )}

                  <rect
                    width={cardW}
                    height={cardH}
                    rx="7"
                    fill={cardBg}
                    stroke={cardBorder}
                    strokeWidth={isCurrentlyActive ? 2.5 : isCompromised ? 2 : 1}
                  />

                  {/* Top Color Accent */}
                  <rect x="0" y="0" width={cardW} height="3" rx="1.5" fill={cardBorder} />

                  {/* Status Indicator */}
                  <circle cx="12" cy="16" r="3.5" fill={statusColor} />

                  {/* Label */}
                  <text
                    x="21"
                    y="19"
                    fill="#ffffff"
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {node.id.length > 12 ? node.id.slice(0, 10) + ".." : node.id}
                  </text>

                  {/* IP */}
                  <text x="12" y="33" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">
                    {node.ip}
                  </text>

                  {/* Status Tag */}
                  <text
                    x={cardW - 8}
                    y="33"
                    textAnchor="end"
                    fill={statusColor}
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {isCompromised ? "BREACHED" : "NOMINAL"}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Unaffected Host
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"></span> Compromised Asset
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 border-b-2 border-dashed border-rose-500 inline-block"></span> Lateral Hop Traversed
            </span>
          </div>
          <div>Playback step {currentStep + 1} of {totalSteps}</div>
        </div>
      </div>

      {/* DEEP FORENSIC INVESTIGATION TABS (Loopholes, Evidence, Gaps, Summary, Notes) */}
      <div className="space-y-4">
        {/* Sub-Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1">
          {[
            { id: "replay", label: "CURRENT EVENT & LOOPHOLE", icon: <ShieldAlert className="w-4 h-4" /> },
            { id: "evidence", label: "EVIDENCE CORRELATION", icon: <Fingerprint className="w-4 h-4" /> },
            { id: "gaps", label: "CRITICAL SECURITY GAPS", icon: <Lock className="w-4 h-4" /> },
            { id: "summary", label: "REPLAY SUMMARY", icon: <CheckCircle2 className="w-4 h-4" /> },
            { id: "notes", label: `ANALYST NOTES (${analystNotes.length})`, icon: <MessageSquare className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 font-mono text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeSubTab === tab.id
                  ? "bg-slate-900 text-cyan-300 border-t-2 border-x border-cyan-500/50 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: CURRENT EVENT & SECURITY LOOPHOLE BREAKDOWN */}
        {activeSubTab === "replay" && currentEvent && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Event Details Card (5 Cols) */}
            <div className="lg:col-span-5 cyber-card p-5 border-slate-800 bg-slate-950/95 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-xs font-bold text-white uppercase">
                    EVENT #{currentEvent.step_number} INSPECTION
                  </span>
                </div>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  {currentEvent.relative_time}
                </span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/50">
                  {currentEvent.stage_name.replace("_", " ")}
                </span>
                <Badge label={currentEvent.severity} variant="compromised" />
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    currentEvent.is_reconstructed
                      ? "bg-amber-950/80 text-amber-300 border-amber-500/50"
                      : "bg-emerald-950/80 text-emerald-300 border-emerald-500/50"
                  }`}
                >
                  {currentEvent.is_reconstructed ? "RECONSTRUCTED" : "CONFIRMED"}
                </span>
              </div>

              {/* Attributes Table */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">EVENT ID:</span>
                  <strong className="text-cyan-300">{currentEvent.event_id}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">SOURCE:</span>
                  <span className="text-white">{currentEvent.source_device} (Floor {currentEvent.floor})</span>
                </div>
                {currentEvent.destination_device && (
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">DESTINATION:</span>
                    <span className="text-rose-300 font-bold">{currentEvent.destination_device}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">ACCOUNT INVOLVED:</span>
                  <span className="text-slate-200">{currentEvent.user || "SYSTEM"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">NETWORK SEGMENT:</span>
                  <span className="text-slate-300">{currentEvent.network_segment || "VLAN-INFRA"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">FORENSIC CONFIDENCE:</span>
                  <strong className="text-cyan-400">{currentEvent.confidence_pct}%</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">ACTION TYPE:</span>
                  <span className="text-amber-300">{currentEvent.action_name}</span>
                </div>
              </div>

              {/* Event Description */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed">
                <span className="text-slate-400 text-[10px] block mb-1">SYSTEM NARRATIVE:</span>
                {currentEvent.description}
              </div>

              {/* Reconstruction Reason box if reconstructed */}
              {currentEvent.is_reconstructed && currentEvent.reconstruction_reason && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs font-mono space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>FORENSIC RECONSTRUCTION NOTICE</span>
                  </div>
                  <p className="text-amber-200/90 text-[11px] leading-relaxed">
                    {currentEvent.reconstruction_reason}
                  </p>
                </div>
              )}
            </div>

            {/* Security Loophole Breakdown Card (7 Cols) */}
            <div className="lg:col-span-7 cyber-card p-5 border-amber-500/40 bg-slate-950/95 space-y-4 shadow-[0_0_20px_rgba(245,158,11,0.12)]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span className="font-mono text-xs font-bold text-amber-300 uppercase">
                    SECURITY LOOPHOLE ANALYSIS // {currentEvent.loophole.id}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/40">
                  ROOT CAUSE
                </span>
              </div>

              <h4 className="text-base font-bold font-mono text-white">
                {currentEvent.loophole.title}
              </h4>

              <div className="space-y-3 text-xs font-mono">
                {/* 1. Weakness */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block text-rose-400">
                    1. Security Weakness That Existed
                  </span>
                  <p className="text-slate-200 leading-relaxed">{currentEvent.loophole.weakness}</p>
                </div>

                {/* 2. Exploitation */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block text-amber-400">
                    2. How the Attacker Exploited It
                  </span>
                  <p className="text-slate-200 leading-relaxed">{currentEvent.loophole.exploitation}</p>
                </div>

                {/* 3. Why Controls Failed */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block text-purple-400">
                    3. Why Existing Controls Failed
                  </span>
                  <p className="text-slate-200 leading-relaxed">{currentEvent.loophole.whyFailed}</p>
                </div>

                {/* 4. What Could Prevent It */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block text-cyan-400">
                    4. What Could Have Prevented It
                  </span>
                  <p className="text-slate-200 leading-relaxed">{currentEvent.loophole.preventedBy}</p>
                </div>

                {/* 5. Recommended Mitigation */}
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <span className="text-[10px] uppercase font-bold block text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    5. Recommended Remediation & Hardening
                  </span>
                  <p className="text-emerald-200 leading-relaxed font-semibold">
                    {currentEvent.loophole.recommendedFix}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EVIDENCE CORRELATION */}
        {activeSubTab === "evidence" && currentEvent && (
          <div className="cyber-card p-5 border-slate-800 bg-slate-950/95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-cyan-400" />
                  SUPPORTING EVIDENCE CORRELATION // EVENT #{currentEvent.step_number}
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Multi-Source Log Telemetry & Forensic Credibility Classification
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                CONFIDENCE: {currentEvent.confidence_pct}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentEvent.evidence_items.map((evItem, idx) => {
                const statusColor =
                  evItem.status === "CONFIRMED"
                    ? "bg-emerald-950 text-emerald-300 border-emerald-500/50"
                    : evItem.status === "RECONSTRUCTED"
                    ? "bg-amber-950 text-amber-300 border-amber-500/50"
                    : "bg-purple-950 text-purple-300 border-purple-500/50";

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">{evItem.type}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColor}`}>
                        {evItem.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      <span className="text-slate-500">Source: </span>
                      <span className="text-cyan-300 font-semibold">{evItem.source}</span>
                    </div>

                    <p className="text-slate-200 leading-relaxed text-[11px] bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                      {evItem.description}
                    </p>

                    <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      <span>Forensic Credibility:</span>
                      <strong className="text-cyan-400">{evItem.confidence}%</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Evidence Legend */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center gap-6 text-[11px] font-mono text-slate-400">
              <span className="font-bold text-white">EVIDENCE LEGEND:</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <strong>CONFIRMED:</strong> Direct immutable log in telemetry store
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <strong>RECONSTRUCTED:</strong> Derived from multi-hop cross-telemetry
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <strong>INFERRED:</strong> Probabilistic behavioral graph correlation
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: CRITICAL SECURITY GAPS */}
        {activeSubTab === "gaps" && (
          <div className="cyber-card p-5 border-slate-800 bg-slate-950/95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-400" />
                  SYSTEMIC SECURITY GAPS & ARCHITECTURAL WEAKNESSES
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Identified vulnerabilities that enabled this attack path to succeed
                </p>
              </div>
              <span className="text-xs font-mono text-rose-400 font-bold">
                {currentScenario.critical_gaps.length} GAPS IDENTIFIED
              </span>
            </div>

            <div className="space-y-4">
              {currentScenario.critical_gaps.map((gap, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs"
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Gap #{idx + 1}: {gap.title}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-slate-400 uppercase font-bold text-[10px] block">Risk</span>
                      <p className="text-slate-300">{gap.risk}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-amber-400 uppercase font-bold text-[10px] block">Exploitation</span>
                      <p className="text-slate-300">{gap.exploitation}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-rose-400 uppercase font-bold text-[10px] block">Impact</span>
                      <p className="text-slate-300">{gap.impact}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 space-y-1">
                      <span className="text-emerald-400 uppercase font-bold text-[10px] block">Mitigation</span>
                      <p className="text-emerald-200 font-semibold">{gap.mitigation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: FINAL FORENSIC REPLAY SUMMARY */}
        {activeSubTab === "summary" && (
          <div className="cyber-card p-6 border-emerald-500/40 bg-slate-950 space-y-5 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>FORENSIC REPLAY & INVESTIGATION SUMMARY</span>
              </div>
              <span className="text-xs font-mono text-cyan-300 font-bold">
                STATUS: INCIDENT RECONSTRUCTED
              </span>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block">ATTACK TYPE</span>
                <strong className="text-white text-xs block truncate">{currentScenario.type}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block">TOTAL DURATION</span>
                <strong className="text-cyan-300 text-xs block">
                  {replayEvents[totalSteps - 1]?.relative_time || "00:28s"} ({totalSteps} Steps)
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block">CRITICAL ASSET REACHED</span>
                <strong className="text-rose-400 text-xs block truncate">{currentScenario.target_asset}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block">FORENSIC CONFIDENCE</span>
                <strong className="text-emerald-400 text-sm block">94.2%</strong>
              </div>
            </div>

            {/* Summary Details Table */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Incident Code:</span>
                <strong className="text-cyan-300">{currentScenario.incident_code}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Total Systems Compromised:</span>
                <span className="text-white">{activeNodeSet.size} Distinct Endpoints</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Confirmed Events:</span>
                <strong className="text-emerald-400">
                  {replayEvents.filter((e) => !e.is_reconstructed).length} Events (Direct Logs)
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Reconstructed Events:</span>
                <strong className="text-amber-400">
                  {replayEvents.filter((e) => e.is_reconstructed).length} Events (Inferred Telemetry)
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Highest Risk Stage:</span>
                <span className="text-rose-300 font-bold">Privilege Escalation & Database Exfiltration</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Primary Security Failure:</span>
                <span className="text-slate-200">Unrestricted Inter-VLAN Routing & Lack of MFA</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleExportReport}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD INCIDENT DOSSIER</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: ANALYST INVESTIGATION NOTES */}
        {activeSubTab === "notes" && (
          <div className="cyber-card p-5 border-slate-800 bg-slate-950/95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  ANALYST FORENSIC NOTES & ANNOTATIONS
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Record analytical observations tagged to playback events (Persists in session)
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                TAGGED TO STEP #{currentStep + 1}
              </span>
            </div>

            {/* Note Input Box */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder={`Add forensic note for Event #${currentStep + 1} (${currentEvent?.stage_name || "Event"})...`}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs font-mono text-white outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>ADD NOTE</span>
              </button>
            </form>

            {/* Notes List */}
            <div className="space-y-2.5 pt-2">
              {analystNotes.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-xs font-mono text-slate-500">
                  No forensic notes recorded yet. Add observations during playback for post-incident review.
                </div>
              ) : (
                analystNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3 text-xs font-mono"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">Event #{note.stepIndex + 1}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 text-[11px]">{note.author}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-500 text-[10px]">{note.timestamp}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed">{note.note}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* SYNCHRONIZED TIMELINE (CHRONOLOGICAL EVENT STREAM) */}
      <div className="cyber-card p-5 border-slate-800 bg-slate-950/95 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold font-mono text-white">
              SYNCHRONIZED ATTACK TIMELINE ({totalSteps} EVENTS)
            </h4>
          </div>
          <span className="text-xs font-mono text-slate-400">
            CLICK ANY EVENT TO JUMP REPLAY
          </span>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {replayEvents.map((step, idx) => {
            const isSelected = idx === currentStep;
            return (
              <div
                key={step.event_id}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStep(idx);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono ${
                  isSelected
                    ? "bg-slate-900 border-cyan-500 shadow-[0_0_15px_rgba(0,240,255,0.25)]"
                    : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected
                        ? "bg-cyan-500 text-slate-950"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    #{step.step_number}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-cyan-400 font-bold">{step.relative_time}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-white font-bold truncate">{step.action_name}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 text-[11px]">
                        {step.source_device} ➔ {step.destination_device || "Local"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      step.is_reconstructed
                        ? "bg-amber-950 text-amber-300 border-amber-500/40"
                        : "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                    }`}
                  >
                    {step.is_reconstructed ? "RECONSTRUCTED" : "CONFIRMED"}
                  </span>
                  <Badge label={step.severity} variant="compromised" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

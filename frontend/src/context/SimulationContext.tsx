import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { SimulationState, SirenState } from "../types";
import { playSirenOnce, stopSiren, initAndUnlockAudio } from "../utils/audio";

interface SimulationContextType {
  state: SimulationState | null;
  isConnected: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sirenState: SirenState;
  silenceSiren: () => Promise<void>;
  playSiren: () => void;
  triggerScenario: (scenarioId: string) => Promise<void>;
  setAnalystAvailability: (status: "AVAILABLE" | "BUSY" | "AWAY" | "OFFLINE") => Promise<void>;
  acknowledgeAlert: () => Promise<void>;
  approveContainment: () => Promise<void>;
  rejectAlert: (reason: string) => Promise<void>;
  isolateDevice: (deviceId: string) => Promise<void>;
  unIsolateDevice: (deviceId: string) => Promise<void>;
  restoreFile: (filename: string, version?: number) => Promise<any>;
  togglePause: () => Promise<void>;
  setSimSpeed: (speed: number) => Promise<void>;
  resetSimulation: () => Promise<void>;
  setImperfectionConfig: (dup: number, delay: number, drop: number) => Promise<void>;
  selectedDeviceId: string | null;
  setSelectedDeviceId: (id: string | null) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const WS_BASE = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SimulationState | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [sirenState, setSirenState] = useState<SirenState>("IDLE");
  
  const playedSirenKeys = useRef<Set<string>>(new Set());
  const wsRef = useRef<WebSocket | null>(null);

  // Synchronize 3-Stage Siren Alert System with Active Escalation Alerts
  useEffect(() => {
    if (!state) return;

    const alert = state.active_alert;

    if (alert && alert.status === "PENDING") {
      const stageKey = `${alert.incident_id || alert.alert_id}_stage_${alert.stage}`;

      if (alert.siren_silenced) {
        stopSiren();
        setSirenState("SILENCED");
      } else if (!playedSirenKeys.current.has(stageKey)) {
        playedSirenKeys.current.add(stageKey);
        setSirenState("PLAYING");
        playSirenOnce(() => {
          setSirenState((prev) => (prev === "PLAYING" ? "IDLE" : prev));
        });
      }
    } else {
      playedSirenKeys.current.clear();
      if (sirenState === "PLAYING" && (!alert || alert.status !== "PENDING")) {
        setSirenState("IDLE");
      }
    }
  }, [state?.active_alert]);


  // Window interaction listener to guarantee instant audio unlock upon user interaction
  useEffect(() => {
    const handleInteraction = () => {
      initAndUnlockAudio();
    };

    window.addEventListener("click", handleInteraction, { passive: true });
    window.addEventListener("pointerdown", handleInteraction, { passive: true });
    window.addEventListener("keydown", handleInteraction, { passive: true });
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  // Initial Fetch & WebSocket setup
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/state`);
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (err) {
      console.warn("Polling fallback error:", err);
    }
  }, []);

  useEffect(() => {
    let reconnectTimeout: any;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(WS_BASE);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.system_status) {
              setState(data);
            }
          } catch (e) {
            console.error("Error parsing WS packet:", e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connectWebSocket, 2000);
        };

        ws.onerror = () => {
          setIsConnected(false);
          ws.close();
        };
      } catch (err) {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connectWebSocket, 2000);
      }
    };

    fetchState();
    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, [fetchState]);

  // Siren Control Actions
  const silenceSiren = async () => {
    stopSiren();
    setSirenState("SILENCED");
    try {
      await fetch(`${API_BASE}/api/siren/silence`, { method: "POST" });
    } catch (e) {
      console.warn("Failed to notify backend of siren silence:", e);
    }
  };

  const playSiren = () => {
    setSirenState("PLAYING");
    playSirenOnce(() => {
      setSirenState((prev) => (prev === "PLAYING" ? "IDLE" : prev));
    });
  };

  // REST API Actions
  const triggerScenario = async (scenarioId: string) => {
    playSiren();
    await fetch(`${API_BASE}/api/scenario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario_id: scenarioId }),
    });
  };

  const setAnalystAvailability = async (status: "AVAILABLE" | "BUSY" | "AWAY" | "OFFLINE") => {
    await fetch(`${API_BASE}/api/analyst/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ availability: status }),
    });
  };

  const acknowledgeAlert = async () => {
    stopSiren();
    setSirenState("IDLE");
    await fetch(`${API_BASE}/api/analyst/acknowledge`, {
      method: "POST",
    });
  };

  const approveContainment = async () => {
    stopSiren();
    setSirenState("IDLE");
    await fetch(`${API_BASE}/api/analyst/approve`, {
      method: "POST",
    });
  };

  const rejectAlert = async (reason: string) => {
    stopSiren();
    setSirenState("IDLE");
    await fetch(`${API_BASE}/api/analyst/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
  };

  const isolateDevice = async (deviceId: string) => {
    await fetch(`${API_BASE}/api/device/isolate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id: deviceId }),
    });
  };

  const unIsolateDevice = async (deviceId: string) => {
    await fetch(`${API_BASE}/api/device/un-isolate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id: deviceId }),
    });
  };

  const restoreFile = async (filename: string, version?: number) => {
    const res = await fetch(`${API_BASE}/api/file/restore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, target_version: version }),
    });
    return await res.json();
  };

  const togglePause = async () => {
    if (!state) return;
    await fetch(`${API_BASE}/api/simulation/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pause: !state.system_status.is_paused }),
    });
  };

  const setSimSpeed = async (speed: number) => {
    await fetch(`${API_BASE}/api/simulation/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ speed }),
    });
  };

  const resetSimulation = async () => {
    stopSiren();
    setSirenState("IDLE");
    playedSirenKeys.current.clear();
    await fetch(`${API_BASE}/api/simulation/reset`, {
      method: "POST",
    });
  };

  const setImperfectionConfig = async (duplicate_rate: number, delay_rate: number, drop_rate: number) => {
    await fetch(`${API_BASE}/api/simulation/imperfections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duplicate_rate, delay_rate, drop_rate }),
    });
  };

  return (
    <SimulationContext.Provider
      value={{
        state,
        isConnected,
        activeTab,
        setActiveTab,
        sirenState,
        silenceSiren,
        playSiren,
        triggerScenario,
        setAnalystAvailability,
        acknowledgeAlert,
        approveContainment,
        rejectAlert,
        isolateDevice,
        unIsolateDevice,
        restoreFile,
        togglePause,
        setSimSpeed,
        resetSimulation,
        setImperfectionConfig,
        selectedDeviceId,
        setSelectedDeviceId,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
};

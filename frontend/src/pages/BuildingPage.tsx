import React, { useState } from "react";
import { useSimulation } from "../context/SimulationContext";
import { Badge } from "../components/common/Badge";
import { Device, Floor, Room } from "../types";
import {
  Building2,
  Server,
  Laptop,
  Router,
  Video,
  Lock,
  Layers,
  ShieldAlert,
  Cpu,
  Wifi,
  Printer,
  Thermometer,
  AlertTriangle,
  X,
} from "lucide-react";

export const BuildingPage: React.FC = () => {
  const { state, isolateDevice, unIsolateDevice, selectedDeviceId, setSelectedDeviceId } = useSimulation();
  const [selectedFloor, setSelectedFloor] = useState<number | "ALL">("ALL");

  if (!state) return null;

  const { devices, floors, attack_path } = state;

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "SERVER":
      case "DATABASE":
      case "FILE_SERVER":
        return <Server className="w-4 h-4" />;
      case "LAPTOP":
      case "WORKSTATION":
        return <Laptop className="w-4 h-4" />;
      case "ROUTER":
      case "SWITCH":
        return <Router className="w-4 h-4" />;
      case "CCTV":
        return <Video className="w-4 h-4" />;
      case "DOOR_CONTROLLER":
        return <Lock className="w-4 h-4" />;
      case "BMS":
      case "IOT_GATEWAY":
        return <Cpu className="w-4 h-4" />;
      case "ACCESS_POINT":
        return <Wifi className="w-4 h-4" />;
      case "PRINTER":
        return <Printer className="w-4 h-4" />;
      case "SENSOR":
        return <Thermometer className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string, isIsolated: boolean) => {
    if (isIsolated) return { border: "border-purple-500", bg: "bg-purple-950/80", text: "text-purple-300", glow: "rgba(168,85,247,0.5)" };
    switch (status) {
      case "COMPROMISED":
        return { border: "border-rose-500", bg: "bg-rose-950/90", text: "text-rose-300", glow: "rgba(244,63,94,0.6)" };
      case "HIGH_RISK":
        return { border: "border-orange-500", bg: "bg-orange-950/90", text: "text-orange-300", glow: "rgba(249,115,22,0.5)" };
      case "SUSPICIOUS":
        return { border: "border-amber-500", bg: "bg-amber-950/90", text: "text-amber-300", glow: "rgba(245,158,11,0.4)" };
      case "PROTECTED":
        return { border: "border-blue-500", bg: "bg-blue-950/80", text: "text-blue-300", glow: "rgba(59,130,246,0.4)" };
      default:
        return { border: "border-emerald-500/40", bg: "bg-slate-900/80", text: "text-emerald-400", glow: "rgba(16,185,129,0.2)" };
    }
  };

  const selectedDevice = selectedDeviceId ? (devices[selectedDeviceId] as Device) : null;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Floor Switcher Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            DIGITAL TWIN: SPATIAL SMART BUILDING VISUALIZER
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            4-Level Multi-Floor Facility • Real-time Threat Vector & Device Spatial Telemetry
          </p>
        </div>

        {/* Floor Switcher Buttons */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setSelectedFloor("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              selectedFloor === "ALL"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ALL FLOORS (3D STACK)
          </button>
          {[1, 2, 3, 4].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFloor(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedFloor === f
                  ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              FLOOR {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Building Display & Device Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 or 12 Cols: Floors Canvas */}
        <div className={selectedDevice ? "lg:col-span-8 space-y-6" : "lg:col-span-12 space-y-6"}>
          {floors
            .filter((f: Floor) => selectedFloor === "ALL" || f.floor_number === selectedFloor)
            .map((floor: Floor) => {
              const isFloorTraversed = attack_path && attack_path.nodes.some((id: string) => devices[id]?.floor === floor.floor_number);

              return (
                <div
                  key={floor.floor_number}
                  className={`cyber-card p-5 border transition-all duration-300 ${
                    isFloorTraversed
                      ? "border-rose-500/50 bg-slate-950/90 shadow-[0_0_30px_rgba(244,63,94,0.15)]"
                      : "border-slate-800 bg-slate-950/70"
                  }`}
                >
                  {/* Floor Header Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 font-mono font-bold text-xs text-cyan-300">
                        LEVEL {floor.floor_number}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold font-mono text-white">{floor.name}</h3>
                        <p className="text-[11px] text-slate-400">{floor.description}</p>
                      </div>
                    </div>
                    {isFloorTraversed && (
                      <Badge label="ACTIVE THREAT PROPAGATION" variant="compromised" />
                    )}
                  </div>

                  {/* Rooms & Devices Layout Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {floor.rooms.map((room: Room) => {
                      const roomDevices = room.device_ids.map((id: string) => devices[id]).filter(Boolean);

                      return (
                        <div
                          key={room.id}
                          className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/90 flex flex-col justify-between"
                        >
                          {/* Room Title */}
                          <div className="text-[11px] font-mono font-bold text-slate-300 pb-2 border-b border-slate-800 flex items-center justify-between">
                            <span>{room.name}</span>
                            <span className="text-[9px] text-slate-500 font-mono">RM-{room.id.replace('room-', '')}</span>
                          </div>

                          {/* Devices in this room */}
                          <div className="mt-3 space-y-2">
                            {roomDevices.map((dev: Device) => {
                              const style = getStatusColor(dev.status, dev.is_isolated);
                              const isOrigin = attack_path && attack_path.source_device === dev.id;
                              const isSelected = selectedDeviceId === dev.id;

                              return (
                                <div
                                  key={dev.id}
                                  onClick={() => setSelectedDeviceId(dev.id)}
                                  className={`p-2.5 rounded-lg border cursor-pointer transition-all hover:scale-102 overflow-hidden ${
                                    isSelected
                                      ? "ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                                      : ""
                                  } ${style.bg} ${style.border}`}
                                  style={{
                                    boxShadow: isOrigin || dev.status === "COMPROMISED" ? `0 0 15px ${style.glow}` : undefined,
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-1.5 min-w-0 w-full">
                                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                      <span className={`shrink-0 ${style.text}`}>{getDeviceIcon(dev.type)}</span>
                                      <span className="text-xs font-bold font-mono text-white truncate flex-1 min-w-0" title={dev.id}>
                                        {dev.id}
                                      </span>
                                    </div>
                                    <span className={`text-[9px] sm:text-[10px] font-mono font-bold shrink-0 ml-1 ${style.text}`}>
                                      {dev.is_isolated ? "ISOLATED" : dev.status}
                                    </span>
                                  </div>
                                  <div className="mt-1 flex items-center justify-between gap-1 text-[10px] font-mono text-slate-400 min-w-0 w-full">
                                    <span className="truncate min-w-0 flex-1">{dev.ip_address}</span>
                                    {dev.risk_score > 0 && (
                                      <span className="text-rose-400 font-bold shrink-0 ml-1">Risk: {dev.risk_score}</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Right 4 Cols: Device Inspector Drawer (If Device Selected) */}
        {selectedDevice && (
          <div className="lg:col-span-4 cyber-card p-4 sm:p-5 border-cyan-500/40 bg-slate-950 space-y-4 sticky top-20 h-fit min-w-0 w-full overflow-hidden">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800 gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30 shrink-0">
                  {getDeviceIcon(selectedDevice.type)}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold font-mono text-white truncate" title={selectedDevice.id}>{selectedDevice.id}</h3>
                  <p className="text-[11px] text-slate-400 truncate" title={selectedDevice.name}>{selectedDevice.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDeviceId(null)}
                className="p-1 rounded text-slate-400 hover:text-white shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Attributes Table */}
            <div className="space-y-2 text-xs font-mono min-w-0">
              <div className="flex justify-between py-1 border-b border-slate-900 gap-2 min-w-0 w-full">
                <span className="text-slate-400 shrink-0">IP Address:</span>
                <span className="text-cyan-300 font-bold truncate min-w-0 text-right">{selectedDevice.ip_address}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900 gap-2 min-w-0 w-full">
                <span className="text-slate-400 shrink-0">Location:</span>
                <span className="text-white truncate min-w-0 text-right">Floor {selectedDevice.floor} • {selectedDevice.room}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900 gap-2 min-w-0 w-full">
                <span className="text-slate-400 shrink-0">Segment:</span>
                <span className="text-slate-300 truncate min-w-0 text-right">{selectedDevice.network_segment}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900 gap-2 min-w-0 w-full">
                <span className="text-slate-400 shrink-0">Criticality:</span>
                <span className="text-amber-400 font-bold shrink-0">{selectedDevice.criticality}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900 gap-2 min-w-0 w-full">
                <span className="text-slate-400 shrink-0">Status:</span>
                <span className="shrink-0 min-w-0 flex justify-end truncate">
                  <Badge
                    label={selectedDevice.is_isolated ? "QUARANTINED" : selectedDevice.status}
                    variant={selectedDevice.is_isolated ? "quarantined" : (selectedDevice.status.toLowerCase() as any)}
                  />
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900 gap-2 min-w-0 w-full">
                <span className="text-slate-400 shrink-0">Risk Score:</span>
                <span className="text-rose-400 font-bold shrink-0">{selectedDevice.risk_score}/100</span>
              </div>
            </div>

            {/* Connected Neighbors */}
            <div>
              <span className="text-[11px] uppercase font-mono text-slate-400 block mb-1.5">
                Connected Topology Links ({selectedDevice.connected_devices.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedDevice.connected_devices.map((nb: string) => (
                  <span
                    key={nb}
                    onClick={() => setSelectedDeviceId(nb)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer hover:border-cyan-500/50 hover:text-cyan-300 truncate max-w-full"
                  >
                    {nb}
                  </span>
                ))}
              </div>
            </div>

            {/* Threat Reasons */}
            {selectedDevice.threat_reasons.length > 0 && (
              <div>
                <span className="text-[11px] uppercase font-mono text-rose-400 block mb-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Correlated Threat Evidence:</span>
                </span>
                <ul className="text-[11px] font-mono text-slate-300 space-y-1 pl-4 list-disc break-words">
                  {selectedDevice.threat_reasons.map((r: string, i: number) => (
                    <li key={i} className="break-words">{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Containment Control Buttons */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              {selectedDevice.is_isolated ? (
                <button
                  onClick={() => unIsolateDevice(selectedDevice.id)}
                  className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-mono text-xs font-bold transition-all"
                >
                  ROLLBACK ISOLATION (UN-QUARANTINE)
                </button>
              ) : (
                <button
                  onClick={() => isolateDevice(selectedDevice.id)}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>MANUALLY QUARANTINE DEVICE</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

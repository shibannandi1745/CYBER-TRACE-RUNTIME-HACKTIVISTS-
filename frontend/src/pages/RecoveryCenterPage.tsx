import React, { useState } from "react";
import { useSimulation } from "../context/SimulationContext";
import { Badge } from "../components/common/Badge";
import { Modal } from "../components/common/Modal";
import { ProtectedFile, FileVersion } from "../types";
import {
  RotateCcw,
  CheckCircle2,
  History,
  FileCode,
  ShieldCheck,
  Lock,
} from "lucide-react";

export const RecoveryCenterPage: React.FC = () => {
  const { state, restoreFile } = useSimulation();
  const [selectedFileName, setSelectedFileName] = useState<string>("financial_report.xlsx");
  const [targetVersion, setTargetVersion] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [restoreResult, setRestoreResult] = useState<any | null>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  if (!state) return null;

  const { file_integrity } = state;
  const filesList = Object.values(file_integrity.files) as ProtectedFile[];
  const selectedFile = file_integrity.files[selectedFileName] || filesList[0];

  const handleTriggerRestore = async () => {
    if (!selectedFile) return;
    setIsRestoring(true);
    try {
      const res = await restoreFile(selectedFile.filename, targetVersion || undefined);
      setRestoreResult(res);
      setIsConfirmOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-cyan-400" />
          IMMUTABLE SNAPSHOT RECOVERY & DISASTER RESTORATION CENTER
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Version Diffs • Last Known-Good Snapshot Identification • One-Click Cryptographic Rollback
        </p>
      </div>

      {/* Main Grid: File Selector Sidebar & Version Comparator Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Files List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs uppercase font-mono text-slate-400 mb-1">
            PROTECTED DATA VAULT ASSETS
          </div>

          <div className="space-y-2">
            {filesList.map((f: ProtectedFile) => {
              const isSelected = selectedFileName === f.filename;
              const hasDamage = f.status === "CORRUPTED" || f.status === "DELETED" || f.status === "MODIFIED";

              return (
                <div
                  key={f.file_id}
                  onClick={() => {
                    setSelectedFileName(f.filename);
                    setTargetVersion(f.known_good_version);
                    setRestoreResult(null);
                  }}
                  className={`cyber-card p-3.5 border cursor-pointer transition-all ${
                    isSelected
                      ? "border-cyan-500/60 bg-slate-900 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                      : "border-slate-800 hover:border-slate-700 bg-slate-950/70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileCode className={`w-4 h-4 shrink-0 ${hasDamage ? "text-rose-400" : "text-cyan-400"}`} />
                      <span className="text-xs font-bold font-mono text-white truncate min-w-0 flex-1" title={f.filename}>{f.filename}</span>
                    </div>
                    <Badge
                      label={f.status}
                      variant={
                        f.status === "HEALTHY"
                          ? "normal"
                          : f.status === "RESTORED"
                          ? "protected"
                          : "compromised"
                      }
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 min-w-0">
                    <span className="truncate">{f.owner} • v{f.current_version}</span>
                    <span className="shrink-0">{f.is_recovery_available ? "✓ Backup Exists" : "✗ No Backup"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Version Diff & Snapshot Restoration Canvas */}
        <div className="lg:col-span-8 space-y-6">
          {selectedFile ? (
            <div className="cyber-card p-6 border-slate-800 bg-slate-950/90 space-y-6">
              {/* File Title Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3 min-w-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <h3 className="text-base font-bold font-mono text-cyan-300 truncate max-w-full" title={selectedFile.filename}>{selectedFile.filename}</h3>
                    <Badge
                      label={selectedFile.status}
                      variant={
                        selectedFile.status === "HEALTHY"
                          ? "normal"
                          : selectedFile.status === "RESTORED"
                          ? "protected"
                          : "compromised"
                      }
                    />
                  </div>
                  <p className="text-xs font-mono text-slate-400 mt-0.5 break-words">
                    Storage: {selectedFile.device_id} ({selectedFile.file_path})
                  </p>
                </div>

                {/* Restoration Trigger Button */}
                {selectedFile.is_recovery_available ? (
                  <button
                    onClick={() => {
                      setTargetVersion(selectedFile.known_good_version);
                      setIsConfirmOpen(true);
                    }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <RotateCcw className="w-4 h-4 shrink-0" />
                    <span>RESTORE LAST KNOWN-GOOD (v{selectedFile.known_good_version})</span>
                  </button>
                ) : (
                  <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 flex items-center gap-1.5 shrink-0">
                    <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Recovery Not Available (Unprotected)</span>
                  </div>
                )}
              </div>

              {/* Success Result Banner */}
              {restoreResult && (
                <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-xs font-mono text-emerald-300 space-y-1 animate-fade-in break-words">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{restoreResult.message}</span>
                  </div>
                  <div className="break-all">Restored Hash: <code className="text-white">{restoreResult.known_good_hash}</code></div>
                  <div>Restoration Timestamp: {restoreResult.restore_time}</div>
                </div>
              )}

              {/* Version History Table */}
              <div>
                <h4 className="text-xs font-bold font-mono uppercase text-slate-400 mb-3 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>SNAPSHOT VERSION HISTORY ({selectedFile.versions.length} VERSIONS)</span>
                </h4>

                <div className="space-y-3">
                  {selectedFile.versions.map((ver: FileVersion) => {
                    const isKnownGood = ver.is_known_good;
                    const isCurrent = ver.version_number === selectedFile.current_version;

                    return (
                      <div
                        key={ver.version_id}
                        className={`p-4 rounded-xl border transition-all min-w-0 ${
                          isKnownGood
                            ? "bg-slate-900/90 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                            : isCurrent && selectedFile.status !== "HEALTHY" && selectedFile.status !== "RESTORED"
                            ? "bg-rose-950/40 border-rose-500/40"
                            : "bg-slate-900/40 border-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold font-mono text-sm text-white shrink-0">Version {ver.version_number}</span>
                            {isKnownGood && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/50 flex items-center gap-1 shrink-0">
                                <ShieldCheck className="w-3 h-3 shrink-0" />
                                LAST KNOWN-GOOD SNAPSHOT
                              </span>
                            )}
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 shrink-0">
                                Current Active Version
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono text-slate-400 shrink-0">{ver.formatted_time}</span>
                        </div>

                        <p className="text-xs font-mono text-slate-300 mt-2 break-words">{ver.content_summary}</p>

                        <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80 gap-2">
                          <span className="min-w-0">
                            SHA-256:{" "}
                            <strong className="text-cyan-300 font-mono inline-block max-w-[150px] sm:max-w-[220px] truncate align-bottom" title={ver.sha256_hash}>
                              {ver.sha256_hash}
                            </strong>
                          </span>
                          <span>Size: {(ver.size_bytes / 1024).toFixed(1)} KB</span>
                          <span>Modified By: <strong className="text-slate-200">{ver.modified_by}</strong></span>
                          {selectedFile.is_recovery_available && !isCurrent && (
                            <button
                              onClick={() => {
                                setTargetVersion(ver.version_number);
                                setIsConfirmOpen(true);
                              }}
                              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline font-semibold shrink-0"
                            >
                              Restore This Snapshot &rarr;
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="cyber-card p-12 text-center text-slate-500 font-mono text-xs">
              Select a file from the vault to inspect version history and rollback options.
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="CONFIRM SNAPSHOT RESTORATION"
        subtitle="Cryptographic Rollback Operation"
      >
        <div className="space-y-4 text-xs font-mono">
          <p className="text-slate-300 leading-relaxed">
            Are you sure you want to restore <strong className="text-cyan-300">{selectedFile?.filename}</strong> to snapshot{" "}
            <strong className="text-emerald-400">Version {targetVersion || selectedFile?.known_good_version}</strong>?
          </p>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 text-slate-400">
            <div>• Target File: <span className="text-white">{selectedFile?.filename}</span></div>
            <div>• Target Device: <span className="text-white">{selectedFile?.device_id}</span></div>
            <div>• Target Snapshot: <span className="text-emerald-400 font-bold">Version {targetVersion} (Known-Good)</span></div>
            <div>• SHA-256 Hash will be verified and reverted to snapshot baseline.</div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => setIsConfirmOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-mono"
            >
              CANCEL
            </button>
            <button
              onClick={handleTriggerRestore}
              disabled={isRestoring}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isRestoring ? "RESTORING..." : "CONFIRM RESTORATION"}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

import React, { useState } from "react";
import { SimulationProvider, useSimulation } from "./context/SimulationContext";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { AlertBanner } from "./components/layout/AlertBanner";
import { SimulatorDrawer } from "./components/simulation/SimulatorDrawer";
import { SIREN_AUDIO_DATA_URI } from "./utils/sirenDataUri";

import { OverviewPage } from "./pages/OverviewPage";
import { BuildingPage } from "./pages/BuildingPage";
import { AttackGraphPage } from "./pages/AttackGraphPage";
import { AlertsPage } from "./pages/AlertsPage";
import { DecisionsPage } from "./pages/DecisionsPage";
import { DataIntegrityPage } from "./pages/DataIntegrityPage";
import { RecoveryCenterPage } from "./pages/RecoveryCenterPage";
import { IncidentsPage } from "./pages/IncidentsPage";
import { TimelinePage } from "./pages/TimelinePage";
import { AuditLogPage } from "./pages/AuditLogPage";
import { ForensicReplayPage } from "./pages/ForensicReplayPage";
import { ReconstructionPage } from "./pages/ReconstructionPage";

const MainLayout: React.FC = () => {
  const { activeTab } = useSimulation();
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const renderActivePage = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewPage />;
      case "building":
        return <BuildingPage />;
      case "graph":
        return <AttackGraphPage />;
      case "alerts":
        return <AlertsPage />;
      case "decisions":
        return <DecisionsPage />;
      case "integrity":
        return <DataIntegrityPage />;
      case "recovery":
        return <RecoveryCenterPage />;
      case "incidents":
        return <IncidentsPage />;
      case "timeline":
        return <TimelinePage />;
      case "replay":
        return <ForensicReplayPage />;
      case "reconstruction":
        return <ReconstructionPage />;
      case "audit":
        return <AuditLogPage />;
      default:
        return <OverviewPage />;
    }
  };


  const [isInitialized, setIsInitialized] = useState(false);

  const handleInitialize = () => {
    // Unlock HTML5 Audio element on first click
    const audioEl = document.getElementById("cybertrace-siren-audio") as HTMLAudioElement | null;
    if (audioEl) {
      audioEl.play().then(() => {
        audioEl.pause();
        audioEl.currentTime = 0;
      }).catch(() => {});
    }
    setIsInitialized(true);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-mono text-center space-y-6 cyber-grid-bg relative overflow-hidden">
        <audio id="cybertrace-siren-audio" src={SIREN_AUDIO_DATA_URI} preload="auto" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/90 pointer-events-none"></div>
        <div className="z-10 p-8 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-2xl max-w-md w-full mx-4">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">CYBER<span className="text-cyan-400">TRACE</span> AI</h1>
          <p className="text-sm text-slate-400 mb-8">Spatial Cyber Threat Reconstruction Engine</p>
          <button
            onClick={handleInitialize}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm tracking-widest shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all hover:scale-[1.02]"
          >
            INITIALIZE AUDIO & ENTER SOC
          </button>
          <p className="text-[10px] text-slate-500 mt-4 uppercase">Required to enable emergency siren alerts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans cyber-grid-bg">
      {/* Permanent Audio DOM Element */}
      <audio id="cybertrace-siren-audio" src={SIREN_AUDIO_DATA_URI} preload="auto" />

      {/* Header */}
      <Header onOpenSimulator={() => setIsSimulatorOpen(true)} />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto pb-12">
          {/* Active Escalation HUD Banner */}
          <AlertBanner />

          {/* Active Page Component */}
          {renderActivePage()}
        </main>
      </div>

      {/* Simulator Control Drawer */}
      <SimulatorDrawer isOpen={isSimulatorOpen} onClose={() => setIsSimulatorOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <SimulationProvider>
      <MainLayout />
    </SimulationProvider>
  );
}

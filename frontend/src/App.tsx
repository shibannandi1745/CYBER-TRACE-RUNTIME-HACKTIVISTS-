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
import { LoginPage, UserProfile } from "./pages/LoginPage";
import { LogOut } from "lucide-react";

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


  const [authUser, setAuthUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("cybertrace_auth_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const handleLogin = (user: UserProfile) => {
    // Unlock HTML5 Audio element on authentication
    const audioEl = document.getElementById("cybertrace-siren-audio") as HTMLAudioElement | null;
    if (audioEl) {
      audioEl.play().then(() => {
        audioEl.pause();
        audioEl.currentTime = 0;
      }).catch(() => {});
    }
    localStorage.setItem("cybertrace_auth_user", JSON.stringify(user));
    setAuthUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("cybertrace_auth_user");
    setAuthUser(null);
  };

  if (!authUser) {
    return (
      <>
        <audio id="cybertrace-siren-audio" src={SIREN_AUDIO_DATA_URI} preload="auto" />
        <LoginPage onLogin={handleLogin} />
      </>
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

      {/* Floating Active Analyst / Session Status Bar */}
      <div className="fixed bottom-3 right-4 z-50 flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-2xl text-xs font-mono">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-slate-400 text-[11px]">SOC Analyst:</span>
        <span className="text-cyan-300 font-bold text-[11px] truncate max-w-[150px]">{authUser.name}</span>
        {authUser.authProvider === "google" && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/60 font-sans font-medium flex items-center gap-1">
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Google
          </span>
        )}
        <button
          onClick={handleLogout}
          title="Sign out of SOC Console"
          className="ml-1 pl-2 border-l border-slate-700 text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <LogOut className="w-3 h-3" />
          <span className="text-[11px]">Sign Out</span>
        </button>
      </div>
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

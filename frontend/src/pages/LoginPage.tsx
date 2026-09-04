import React, { useState } from "react";
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Volume2,
  Fingerprint,
  Radio,
  CheckCircle2,
  Globe,
  Cpu,
  AlertCircle,
  KeyRound
} from "lucide-react";

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  role: string;
  clearance: string;
  authProvider: "google" | "credentials" | "demo";
}

export interface AuthorizedAnalyst {
  email: string;
  password: string;
  name: string;
  role: string;
  clearance: string;
}

// Authorized SOC accounts for Zero-Trust credential validation
export const AUTHORIZED_ANALYSTS: AuthorizedAnalyst[] = [
  {
    email: "analyst@cybertrace.ai",
    password: "CyberTrace@2026",
    name: "Lead SOC Analyst",
    role: "Tier-3 Cyber Defense Specialist",
    clearance: "LEVEL 4 ALPHA"
  },
  {
    email: "admin@cybertrace.ai",
    password: "Admin@CyberTrace2026",
    name: "SOC Commander",
    role: "Autonomous Defense Director",
    clearance: "LEVEL 5 OMEGA"
  },
  {
    email: "shibannandi@cybertrace.ai",
    password: "CyberTrace@2026",
    name: "Shiban Nandi",
    role: "Lead SecOps Director",
    clearance: "LEVEL 5 TOP-SECRET"
  }
];

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  // Credentials state
  const [email, setEmail] = useState("analyst@cybertrace.ai");
  const [password, setPassword] = useState("CyberTrace@2026");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);

  // Status & modal states
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Mock available Google Accounts for realistic OAuth Chooser
  const mockGoogleAccounts = [
    {
      name: "Shiban Nandi",
      email: "shibannandi.aiml24d@sbjit.edu.in",
      role: "Lead SecOps Director",
      clearance: "LEVEL 5 TOP-SECRET",
      avatarBg: "from-blue-600 to-indigo-600",
      initials: "SN"
    },
    {
      name: "CyberTrace SecOps Enclave",
      email: "command.soc@cybertrace.ai",
      role: "Autonomous Defense Controller",
      clearance: "LEVEL 4 RESTRICTED",
      avatarBg: "from-cyan-600 to-emerald-600",
      initials: "CT"
    }
  ];

  const triggerLoginSuccess = (profile: UserProfile) => {
    setIsLoading(true);
    setStatusMessage("Authenticating Zero-Trust Security Token...");
    setErrorText(null);

    setTimeout(() => {
      setStatusMessage("Verifying Clearance & Access Enclave...");
    }, 450);

    setTimeout(() => {
      setStatusMessage("Priming HTML5 Siren & Spatial Audio Engine...");
    }, 900);

    setTimeout(() => {
      setIsLoading(false);
      onLogin(profile);
    }, 1400);
  };

  const handleGoogleSelect = (acc: typeof mockGoogleAccounts[0]) => {
    setShowGoogleModal(false);
    triggerLoginSuccess({
      name: acc.name,
      email: acc.email,
      role: acc.role,
      clearance: acc.clearance,
      authProvider: "google"
    });
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    const trimmed = customGoogleEmail.trim();

    if (!trimmed || !trimmed.includes("@") || !trimmed.includes(".")) {
      setModalError("Please enter a valid Google Account email (e.g. name@gmail.com).");
      return;
    }

    const username = trimmed.split("@")[0].replace(/[._-]/g, " ");
    const formattedName = username
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    setShowGoogleModal(false);
    triggerLoginSuccess({
      name: formattedName || "Google Analyst",
      email: trimmed,
      role: "SOC Incident Analyst",
      clearance: "LEVEL 4 RESTRICTED",
      authProvider: "google"
    });
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Check for empty inputs
    if (!cleanEmail) {
      setErrorText("Authentication failed: Please enter your Analyst ID or Email.");
      return;
    }

    if (!cleanPassword) {
      setErrorText("Authentication failed: Please enter your Security Passcode.");
      return;
    }

    // 2. Validate against authorized accounts (Strict Zero-Trust validation)
    const matchedAccount = AUTHORIZED_ANALYSTS.find(
      (acc) => acc.email.toLowerCase() === cleanEmail && acc.password === cleanPassword
    );

    if (!matchedAccount) {
      setErrorText("Access Denied: Invalid Analyst ID or Security Passcode. Zero-Trust policy rejected authentication.");
      return;
    }

    // 3. Authenticated successfully
    triggerLoginSuccess({
      name: matchedAccount.name,
      email: matchedAccount.email,
      role: matchedAccount.role,
      clearance: matchedAccount.clearance,
      authProvider: "credentials"
    });
  };

  const handleQuickDemoAccess = () => {
    setErrorText(null);
    triggerLoginSuccess({
      name: "CyberTrace Lead Analyst",
      email: "demo.analyst@cybertrace.ai",
      role: "Threat Response Commander",
      clearance: "LEVEL 5-OMEGA",
      authProvider: "demo"
    });
  };

  const handleFillDemoCredentials = () => {
    setEmail("analyst@cybertrace.ai");
    setPassword("CyberTrace@2026");
    setErrorText(null);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#05070f] text-slate-100 flex flex-col items-center justify-center p-4 overflow-x-hidden cyber-grid-bg selection:bg-cyan-500 selection:text-black">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Top Bar / Status Badges */}
      <div className="w-full max-w-5xl flex items-center justify-between py-4 px-2 text-xs font-mono text-slate-400 z-10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-semibold tracking-wider">SOC GATEWAY ACTIVE</span>
          <span className="text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-500">ENCLAVE: US-EAST-01</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:flex items-center gap-1 text-cyan-400/80 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded text-[11px]">
            <Radio className="w-3 h-3 animate-pulse text-cyan-400" />
            ZERO-TRUST ENFORCED
          </span>
          <span className="text-slate-400 bg-slate-900/60 border border-slate-800 px-2.5 py-0.5 rounded text-[11px]">
            FIPS 140-3
          </span>
        </div>
      </div>

      {/* Main Login Card Container */}
      <div className="relative z-10 w-full max-w-md my-auto">
        {/* Glowing border card wrapper */}
        <div className="relative rounded-3xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,240,255,0.12)] p-6 sm:p-8 md:p-9 transition-all">
          {/* Subtle Top Glowing Line Accent */}
          <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-slate-900 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_25px_rgba(0,240,255,0.35)] relative overflow-hidden group">
                <Shield className="w-8 h-8 text-cyan-400 relative z-10 transition-transform group-hover:scale-110 duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border-2 border-slate-900"></span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white flex items-center gap-1.5">
              CYBER<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">TRACE</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-500/40">
                AI
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs font-sans">
              Spatial Cyber Threat Reconstruction & Autonomous Defense Platform
            </p>
          </div>

          {/* Error Message with Shake Animation if invalid credentials */}
          {errorText && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5 shadow-[0_0_15px_rgba(244,63,94,0.25)]">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-300">Authentication Rejected</p>
                <p className="text-[11px] text-rose-200/90 mt-0.5 leading-relaxed">{errorText}</p>
              </div>
            </div>
          )}

          {/* Loading / Handshake Overlay */}
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 font-mono">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <Cpu className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white tracking-wide">{statusMessage}</p>
                <p className="text-[11px] text-cyan-400/80 mt-1">ESTABLISHING ENCRYPTED SECURE CHANNEL</p>
              </div>
            </div>
          ) : (
            <>
              {/* Primary Google Auth Section */}
              <div className="space-y-3 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setErrorText(null);
                    setShowGoogleModal(true);
                  }}
                  className="w-full relative group overflow-hidden rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-medium text-sm py-3.5 px-4 flex items-center justify-center gap-3 transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] hover:scale-[1.01] active:scale-[0.99] border border-slate-200 cursor-pointer"
                >
                  {/* Google 4-Color SVG Logo */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="font-semibold text-slate-800 tracking-tight">
                    Continue with Google
                  </span>
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                  </span>
                </button>

                <p className="text-center text-[11px] text-slate-400 font-sans">
                  Enterprise SSO supported for <span className="text-cyan-400 font-mono">@cybertrace.ai</span> & Google Workspace
                </p>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-5">
                <div className="border-t border-slate-800 w-full"></div>
                <span className="bg-slate-900/90 px-3 text-[10px] font-mono uppercase tracking-widest text-slate-400 shrink-0 border border-slate-800/80 rounded-full py-0.5">
                  or analyst credentials
                </span>
                <div className="border-t border-slate-800 w-full"></div>
              </div>

              {/* Credentials Form */}
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Analyst ID / Email</span>
                    <span className="text-slate-400 text-[10px] lowercase">clearance lvl 4+</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorText) setErrorText(null);
                      }}
                      placeholder="analyst@cybertrace.ai"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border ${
                        errorText ? "border-rose-500/70 focus:border-rose-400" : "border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      } text-sm text-white placeholder-slate-600 font-mono transition-all outline-none`}
                    />
                  </div>
                </div>

                {/* Password Field with Working Show/Hide Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider">
                      Security Passcode
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                      title={showPassword ? "Hide passcode" : "Show passcode"}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPassword ? "Hide" : "Show"}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorText) setErrorText(null);
                      }}
                      placeholder="Enter security passcode"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/70 border ${
                        errorText ? "border-rose-500/70 focus:border-rose-400" : "border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      } text-sm text-white placeholder-slate-600 font-mono transition-all outline-none`}
                    />
                    {/* Inline Eye Icon Button inside Input */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4 text-slate-500" />}
                    </button>
                  </div>
                </div>

                {/* Authorized Credentials Helper Banner */}
                <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-[11px] font-mono text-slate-300 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-slate-400 truncate">
                      Valid: <span className="text-cyan-300 font-semibold">analyst@cybertrace.ai</span> / <span className="text-cyan-300 font-semibold">CyberTrace@2026</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillDemoCredentials}
                    className="text-[10px] text-cyan-400 hover:text-cyan-200 border border-cyan-500/40 rounded px-2 py-0.5 bg-cyan-950/40 hover:bg-cyan-900/60 transition-colors shrink-0 cursor-pointer font-bold"
                  >
                    Auto-Fill
                  </button>
                </div>

                {/* Session Settings & Audio Status */}
                <div className="pt-1 flex flex-col gap-2.5 text-xs text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberTerminal}
                      onChange={(e) => setRememberTerminal(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900 w-3.5 h-3.5"
                    />
                    <span className="text-slate-300 text-[11px]">Remember terminal session (30 days)</span>
                  </label>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-cyan-300/80">
                    <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Emergency sirens & audio alerts primed upon login</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono font-bold text-sm tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.35)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>AUTHENTICATE & ENTER SOC</span>
                </button>
              </form>

              {/* Quick One-Click Demo Access */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 text-center">
                <button
                  type="button"
                  onClick={handleQuickDemoAccess}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>One-Click Guest Demo Clearance</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer Security Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> SOC-2 TYPE II
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-cyan-400" /> TLS 1.3 ENCRYPTED
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Fingerprint className="w-3 h-3 text-indigo-400" /> HARDWARE MFA READY
          </span>
        </div>
      </div>

      {/* Google Account Chooser Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-7 border border-slate-200 animate-scaleUp">
            {/* Google Header */}
            <div className="flex flex-col items-center text-center pb-5 border-b border-slate-100">
              <svg className="w-8 h-8 mb-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Choose a Google Account</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                to sign in to <strong className="text-slate-800">CyberTrace AI SOC Enclave</strong>
              </p>
            </div>

            {/* List of Accounts */}
            <div className="divide-y divide-slate-100 my-4">
              {mockGoogleAccounts.map((acc, index) => (
                <button
                  key={index}
                  onClick={() => handleGoogleSelect(acc)}
                  className="w-full py-3.5 px-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${acc.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-sm`}
                    >
                      {acc.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {acc.name}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">{acc.email}</p>
                      <span className="inline-block mt-0.5 text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                        {acc.role}
                      </span>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>

            {/* Custom Google Account Input */}
            <form onSubmit={handleCustomGoogleSubmit} className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Use another Google Account:
              </label>
              {modalError && (
                <p className="text-xs text-rose-600 mb-1.5">{modalError}</p>
              )}
              <div className="flex gap-2">
                <input
                  type="email"
                  value={customGoogleEmail}
                  onChange={(e) => {
                    setCustomGoogleEmail(e.target.value);
                    if (modalError) setModalError(null);
                  }}
                  placeholder="yourname@gmail.com"
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </form>

            {/* Modal Cancel Button */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Encrypted OAuth 2.0 PKCE</span>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper chevron icon
function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

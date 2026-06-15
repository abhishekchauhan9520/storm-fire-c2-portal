import React, { useState } from "react";
import { 
  Grid, 
  Eye, 
  Compass, 
  MessageSquare, 
  Target, 
  Tv, 
  BookOpen, 
  Database, 
  ShieldCheck, 
  HelpCircle, 
  Activity, 
  ChevronRight, 
  AlertTriangle,
  Shield,
  Settings,
  Thermometer,
  UserCheck,
  Menu,
  X,
  Brain
} from "lucide-react";
import DeltaWiki from "./DeltaWiki";
import DeltaElement from "./DeltaElement";
import DeltaTube from "./DeltaTube";
import Skycord from "./Skycord";
import DeltaTargetHub from "./DeltaTargetHub";
import DeltaDataFabric from "./DeltaDataFabric";
import DeltaPrisma from "./DeltaPrisma";
import IndraNetBrain2035 from "./IndraNetBrain2035";
import DeltaVezha from "./DeltaVezha";

interface DeltaPortalProps {
  currentRole: string;
  onChangeRole: (role: any) => void;
  logs: any[];
  onAddLog: (log: { source: string; type: "ALERT" | "INFO" | "SUCCESS" | "WARNING"; message: string }) => void;
  nodes: any[];
  onToggleNodeStatus: (id: string) => void;
  combatUnits: any[];
  onRestoreReadyStatus: (id: string) => void;
  himalayanOps: boolean;
  onToggleHimalayanOps: () => void;
  renderMonitorCopView: () => React.ReactNode;
  activeWorkspace: "LOBBY" | "MONITOR" | "VEZHA" | "ELEMENT" | "TARGET_HUB" | "TUBE" | "WIKI" | "DATA_FABRIC" | "PRISMA" | "BRAIN_2035";
  setActiveWorkspace: (ws: "LOBBY" | "MONITOR" | "VEZHA" | "ELEMENT" | "TARGET_HUB" | "TUBE" | "WIKI" | "DATA_FABRIC" | "PRISMA" | "BRAIN_2035") => void;
}

export default function DeltaPortal({
  currentRole,
  onChangeRole,
  logs,
  onAddLog,
  nodes,
  onToggleNodeStatus,
  combatUnits,
  onRestoreReadyStatus,
  himalayanOps,
  onToggleHimalayanOps,
  renderMonitorCopView,
  activeWorkspace,
  setActiveWorkspace
}: DeltaPortalProps) {
  // Drawer open state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const bentoModules = [
    {
      id: "PRISMA",
      title: "STRIX PRISMA C2 Suite",
      desc: "Persistent Recon-Strike command software. Orchestrates mission targets, traces waypoint routing, coordinates active fleet status, and runs AAR strike analytics.",
      badge: "UAV OPERATION CENTRIC",
      badgeColor: "text-rose-400 bg-rose-950/30 border-rose-900/60",
      icon: Compass,
      iconColor: "text-rose-450 animate-pulse"
    },
    {
      id: "MONITOR",
      title: "Monitor COP Map",
      desc: "Sovereign multi-branch common operational picture displaying live battlefield positions on 3D topographic terrain matrices.",
      badge: "LIVE GEOSPATIAL VECTOR",
      badgeColor: "text-cyan-400 bg-cyan-950/30 border-cyan-900/60",
      icon: Eye,
      iconColor: "text-cyan-400"
    },
    {
      id: "VEZHA",
      title: "Asta-S UAV Discord Wall",
      desc: "Russian Asta-S tactical multi-level UAV feeds wall, voice chat lobby, battery cooling state tracking, and live video stream grids.",
      badge: "7 TACTICAL CHANNELS",
      badgeColor: "text-sky-400 bg-sky-950/30 border-sky-900/60",
      icon: Compass,
      iconColor: "text-sky-400"
    },
    {
      id: "ELEMENT",
      title: "Kavach Secure Messenger",
      desc: "AES-ASCON end-to-end encrypted Telegram clones, group chats, self-destruct texts, multimedia sharing, reactions, and voice lounges.",
      badge: "TELEGRAM GRADE E2E",
      badgeColor: "text-emerald-400 bg-emerald-950/30 border-emerald-900/60",
      icon: MessageSquare,
      iconColor: "text-emerald-400"
    },
    {
      id: "TARGET_HUB",
      title: "Target Hub Planner",
      desc: "High-value tactical target registry directory. Classulates threats, simulates ballistics angles, and cues Shakti rocket launchers.",
      badge: "2 NOMINATIONS IN QUEUE",
      badgeColor: "text-red-400 bg-red-950/30 border-red-900/60",
      icon: Target,
      iconColor: "text-red-400 animate-pulse"
    },
    {
      id: "TUBE",
      title: "Multi-Sensor Fusion Center",
      desc: "Acoustic line spectrogram tracker, EO/IR thermal cameras stream, satellite orbits, and sonar waterfall decoder matrix keys.",
      badge: "SPECTRAL WATERFALL ACTIVE",
      badgeColor: "text-purple-400 bg-purple-950/30 border-purple-900/60",
      icon: Tv,
      iconColor: "text-purple-400"
    },
    {
      id: "DATA_FABRIC",
      title: "Sovereign Fusion Fabric",
      desc: "Entity Resolution de-duplicating coordinates. Tracks interconnected multi-agency intelligence Operational Knowledge Graphs.",
      badge: "99.8% PRECISION TRUNK",
      badgeColor: "text-amber-400 bg-amber-950/30 border-amber-900/60",
      icon: Database,
      iconColor: "text-amber-400"
    },
    {
      id: "WIKI",
      title: "Sovereign Reference Wiki",
      desc: "Approved 20-Layer Sovereign Combat Capability specifications. Trace design models from digital edge infrastructure to joint national desks.",
      badge: "CLASSIFIED SECRET",
      badgeColor: "text-indigo-400 bg-indigo-950/30 border-indigo-900/60",
      icon: BookOpen,
      iconColor: "text-indigo-400"
    },
    {
      id: "BRAIN_2035",
      title: "INDRA-NET C2 2035 Brain",
      desc: "Revolutionary Core Mission sub-second sensor-to-shooter loop. Features multi-agent AI staff dashboard, tactical wargaming engines, and high-altitude weather compensation.",
      badge: "COGNITIVE INTELLIGENCE",
      badgeColor: "text-purple-400 bg-purple-950/30 border-purple-900/60 animate-pulse",
      icon: Brain,
      iconColor: "text-purple-400 animate-pulse"
    }
  ];

  // Sidebar navigation options configuration
  const sidebarNavItems = [
    { id: "LOBBY", label: "Dashboard Portal", icon: Grid, badge: "Home", color: "text-indigo-400" },
    { id: "BRAIN_2035", label: "INDRA-NET 2035 Brain", icon: Brain, badge: "2035 AI", color: "text-purple-400" },
    { id: "PRISMA", label: "STRIX PRISMA C2 Suite", icon: ShieldCheck, badge: "Strategic", color: "text-rose-400" },
    { id: "MONITOR", label: "Monitor COP Map", icon: Eye, badge: "GIS Live", color: "text-cyan-400" },
    { id: "VEZHA", label: "Asta-S UAV Discord", icon: Compass, badge: "Asta-S", color: "text-sky-400" },
    { id: "ELEMENT", label: "Kavach Messenger", icon: MessageSquare, badge: "Telegram", color: "text-emerald-400" },
    { id: "TARGET_HUB", label: "Tactical Target Hub", icon: Target, badge: "Fire Acc", color: "text-red-400" },
    { id: "TUBE", label: "Multi-Sensor Fusion", icon: Tv, badge: "Spectral", color: "text-purple-400" },
    { id: "DATA_FABRIC", label: "Sovereign Data Fabric", icon: Database, badge: "Graph", color: "text-amber-400" },
    { id: "WIKI", label: "L1-L20 Blueprint Wiki", icon: BookOpen, badge: "Secret", color: "text-slate-400" },
  ];

  const getActiveModuleHighlight = (id: string, active: boolean) => {
    if (!active) return "bg-slate-950/45 border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200";
    switch (id) {
      case "LOBBY": return "bg-indigo-950/40 border-indigo-800/80 text-white shadow-[0_0_8px_rgba(99,102,241,0.15)]";
      case "BRAIN_2035": return "bg-purple-950/40 border-purple-800/80 text-purple-450 shadow-[0_0_8px_rgba(168,85,247,0.15)]";
      case "PRISMA": return "bg-rose-950/40 border-rose-800/80 text-rose-450 shadow-[0_0_8px_rgba(244,63,94,0.15)]";
      case "MONITOR": return "bg-cyan-950/40 border-cyan-800/80 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]";
      case "VEZHA": return "bg-sky-950/40 border-sky-800/80 text-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.15)]";
      case "ELEMENT": return "bg-emerald-950/40 border-emerald-800/80 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.15)]";
      case "TARGET_HUB": return "bg-red-950/40 border-red-800/80 text-red-400 shadow-[0_0_8px_rgba(248,113,113,0.15)]";
      case "TUBE": return "bg-purple-950/40 border-purple-800/80 text-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.15)]";
      case "DATA_FABRIC": return "bg-amber-950/40 border-amber-800/80 text-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.15)]";
      default: return "bg-slate-950/40 border-slate-700 text-indigo-400";
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full select-none items-stretch relative">
      
      {/* 1. SECTOR TOP UTILS BAR WITH HAMBURGER TOGGLE */}
      <div className="flex flex-wrap items-center justify-between bg-slate-900/95 border border-slate-800 rounded-lg p-3 shadow-xl gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-red-500 hover:text-red-400 rounded-md text-[10px] uppercase font-black tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-md shrink-0"
            title="Open Sectors Command Menu"
            id="open-nav-drawer-btn"
          >
            <Menu className="h-4 w-4" />
            <span>≡ SECTOR MENU</span>
          </button>
          
          <div className="h-5 w-px bg-slate-800" />

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[7.5px] text-slate-500 font-extrabold uppercase">COCKPIT STATE:</span>
              <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider">
                {sidebarNavItems.find(item => item.id === activeWorkspace)?.label || "Dashboard Portal"}
              </span>
            </div>
            <span className="text-[7.5px] text-slate-600 font-black uppercase mt-0.5 leading-none">
              INDRA COMBAT CONTROLLER Gateway
            </span>
          </div>
        </div>

        {/* Global indicators in top bar */}
        <div className="flex items-center gap-3">
          {himalayanOps && (
            <span className="text-[7.5px] text-amber-400 bg-amber-950/40 border border-amber-900/40 px-1.5 py-0.5 rounded font-black animate-pulse uppercase">
              HIGH-ALT METEO ACTIVE
            </span>
          )}
          <span className="text-[7.5px] text-slate-500 font-bold uppercase hidden sm:inline">THEATER LINK: ENCRYPTED SEC0</span>
          <span className="text-[8px] bg-red-950/30 text-rose-450 border border-red-900/40 rounded px-2 py-0.5 font-bold uppercase select-none animate-pulse">
            DEFCON-2 LOCK
          </span>
        </div>
      </div>

      {/* 2. SLIDE-OUT DRAWER OVERLAY WRAPPER */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[999] transition-all"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 3. SLIDE-OUT ASIDE DRAWER ELEMENT */}
      <aside 
        className={`fixed top-0 left-0 h-full w-80 bg-slate-900 border-r border-slate-800 p-4 shadow-2xl z-[1000] flex flex-col justify-between font-mono text-[11px] gap-4 transition-transform duration-300 ease-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header & Close Button */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-red-950 to-red-900 p-1.5 border border-red-800/85 rounded flex items-center justify-center">
                <Shield className="h-4 w-4 text-red-500 animate-pulse" />
              </div>
              <div>
                <h2 className="font-black text-white text-[12px] tracking-widest uppercase block">
                  STRIX C2 CENTRAL
                </h2>
                <span className="text-[7.5px] text-slate-500 font-extrabold uppercase tracking-wider block">
                  SOVEREIGN THEATER SHIELD
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 px-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-md text-[10px] transition-all"
              title="Close Panel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[7px] bg-slate-950 p-1.5 border border-slate-850 rounded">
            <span className="text-slate-500">OPERATIONAL RULE:</span>
            <span className="text-red-500 font-bold bg-red-955/40 px-1 rounded border border-red-900/40 animate-pulse">
              DEFCON-2 LOCK
            </span>
          </div>

          {/* Navigation Items Link Stack */}
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider px-1 block mb-1">
              COMMAND SECTIONS
            </span>
            {sidebarNavItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeWorkspace === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveWorkspace(item.id as any);
                    setIsSidebarOpen(false); // AUTO CLOSE
                  }}
                  className={`w-full px-2.5 py-2 rounded-md border flex items-center justify-between text-left transition-all font-mono text-[10.5px] font-bold ${getActiveModuleHighlight(item.id, isActive)}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <IconComp className={`h-3.5 w-3.5 ${isActive ? item.color : "text-slate-500"}`} />
                    <span className="truncate uppercase tracking-wide">{item.label}</span>
                  </div>
                  <span className={`text-[7px] uppercase tracking-tighter px-1 rounded-sm border ${
                    isActive 
                      ? "bg-slate-950/60 text-slate-300 border-white/10" 
                      : "bg-slate-950 text-slate-500 border-slate-800"
                  }`}>
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tactical Parameters / Calibration Bottom Area */}
        <div className="border-t border-slate-800 pt-3 flex flex-col gap-2.5">
          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider px-1">
            SECTOR CALIBRATION
          </span>

          {/* Himalayan Meteorology High-Altitude Toggle */}
          <button
            onClick={() => {
              onToggleHimalayanOps();
              setIsSidebarOpen(false);
            }}
            className={`w-full p-2 border rounded font-mono text-[9px] font-bold uppercase transition-all flex items-center justify-between ${
              himalayanOps
                ? "bg-amber-955/60 border-amber-600 text-amber-400"
                : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Thermometer className={`h-3.5 w-3.5 ${himalayanOps ? "text-amber-400 animate-pulse" : "text-slate-500"}`} />
              <span className="truncate">Himalayan Ops</span>
            </div>
            <span className={`text-[7px] font-black px-1 rounded ${himalayanOps ? "bg-amber-900 border border-amber-600 text-amber-200" : "bg-slate-900 text-slate-500"}`}>
              {himalayanOps ? "ACTIVE" : "OFFLINE"}
            </span>
          </button>

          {/* Quick Identity / Zero-Trust Role indicator */}
          <div className="bg-slate-950 p-2 border border-slate-850 rounded flex flex-col gap-1 text-[8.5px]">
            <span className="text-[7.5px] text-slate-500 block uppercase font-bold">IDENTITY ACCESS ROLE:</span>
            <div className="flex items-center gap-1.5 text-white uppercase font-black truncate">
              <UserCheck className="h-3 w-3 text-indigo-400 shrink-0" />
              <span className="truncate text-slate-200">{currentRole.replace("_", " ")}</span>
            </div>
          </div>

          <div className="text-[7.5px] text-slate-600 flex items-center gap-1 leading-normal uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>GRID TELEMETRY INTEGRATED</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Selected Workspace Panel */}
      <main className="flex-1 min-w-0 w-full flex flex-col gap-4">
        
        {/* VIEW 1: LOBBY View - Replaces traditional Lobby to center summary metrics & launching buttons */}
        {activeWorkspace === "LOBBY" && (
          <div className="flex flex-col gap-4 w-full">
            
            {/* Top Overview banner */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xl">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h3 className="font-mono text-xs font-black text-white uppercase tracking-wider">
                    Sovereign Strix-C2 Terminal Active
                  </h3>
                  <p className="font-mono text-[10.5px] text-slate-400 leading-normal max-w-2xl mt-0.5">
                    Unified defense-grade coordinate mapping system. Harmonizing high-altitude border communications, autonomous drone telemetry statistics, and weapon trajectory calculations under secure Defcon-2 rules.
                  </p>
                </div>
              </div>
            </div>

            {/* Bento Grid launcher buttons (Image 4 clone) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bentoModules.map((mod) => {
                const IconComp = mod.icon;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveWorkspace(mod.id as any)}
                    className="p-4 bg-slate-900 hover:bg-slate-900/60 border border-slate-800 hover:border-indigo-900 rounded-lg text-left shadow-xl hover:shadow-indigo-950/15 flex flex-col justify-between gap-4 transition-all group select-none min-h-[170px]"
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850 group-hover:border-indigo-500/30 transition-all flex items-center justify-center">
                        <IconComp className={`h-5 w-5 ${mod.iconColor} group-hover:scale-105 transition-all`} />
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${mod.badgeColor}`}>
                        {mod.badge}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <h4 className="font-mono text-xs font-black text-white group-hover:text-indigo-400 uppercase tracking-wider flex items-center gap-1 transition-all">
                        {mod.title}
                        <ChevronRight className="h-3 w-3 text-slate-500 group-hover:translate-x-0.5 transition-all" />
                      </h4>
                      <p className="font-sans text-[10.5px] text-slate-400 leading-normal line-clamp-3">
                        {mod.desc}
                      </p>
                    </div>
                  </button>
                );
              })}

              {/* Special eighth grid item: Defcon indicators and terminal diagnostics */}
              <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-lg shadow-inner flex flex-col justify-between min-h-[170px] select-none font-mono text-xs text-slate-500">
                <div className="flex items-center gap-1.5 text-slate-300 font-bold border-b border-slate-900 pb-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  <span>TACTICAL COMPUTE HEALTH</span>
                </div>
                
                <div className="flex flex-col gap-1 text-[8.5px] py-1">
                  <div className="flex items-center justify-between">
                    <span>COGNITIVE ENGINE:</span>
                    <span className="text-emerald-400 font-semibold bg-emerald-950/20 border border-emerald-950 px-1 rounded">HEALTHY</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>EDGE SECTORS NODES:</span>
                    <span className="text-cyan-400">ONLINE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>THEATER ENCRYPTION KEYS:</span>
                    <span className="text-emerald-400">SECURE TRUNK</span>
                  </div>
                </div>

                <div className="text-[7.5px] bg-slate-900 p-1 border border-slate-850/60 rounded flex items-center gap-1.5 text-slate-400 leading-relaxed uppercase">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span>Verified sovereign security seals active. Re-checked by INDRA C2.</span>
                </div>
              </div>
            </div>

            {/* Quick logs strip at the bottom of launcher */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 shadow-md flex items-center justify-between select-none font-mono text-[9px] text-slate-400">
              <span className="text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Activity className="h-3 w-3 animate-ping" />
                LATEST SYSTEM BROADCAST:
              </span>
              <span className="truncate max-w-xl text-slate-300">
                {logs[0] ? `${logs[0].timestamp} [${logs[0].source}] ${logs[0].message}` : "No active transmissions yet."}
              </span>
            </div>

          </div>
        )}

        {/* VIEW: PRISMA UAV C2 Command Desk */}
        {activeWorkspace === "PRISMA" && (
          <DeltaPrisma onAddLog={onAddLog} himalayanOps={himalayanOps} />
        )}

        {/* VIEW 2: Monitor COP MAP view */}
        {activeWorkspace === "MONITOR" && (
          <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between items-center select-none bg-slate-900 border border-slate-800 rounded-lg p-2.5">
              <span className="text-[10px] font-mono font-black text-white uppercase tracking-wider">
                🧭 COOPERATIVE OPERATIONAL PICTURE GIS Map View
              </span>
              <span className="text-[8px] font-mono text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-900/50 px-2 py-0.5 rounded uppercase">
                STATUS: LIVE MULTI-RADAR FEEDS
              </span>
            </div>

            {/* Render actual Tactical Map, sidebars, layers status trackers, etc. */}
            <div className="min-w-0">
              {renderMonitorCopView()}
            </div>
          </div>
        )}

        {/* VIEW 3: VEZHA Drone Control */}
        {activeWorkspace === "VEZHA" && (
          <div className="flex flex-col gap-4 w-full">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-white uppercase tracking-wider">
                📡 VEZHA HEAVY UAV CONTROL STREAM
              </span>
              <span className="text-[8.5px] text-sky-400 font-bold uppercase">SIGNAL DECODERS ONLINE</span>
            </div>
            <DeltaVezha onAddLog={onAddLog} himalayanOps={himalayanOps} />
          </div>
        )}

        {/* VIEW 4: ELEMENT secure messaging chat */}
        {activeWorkspace === "ELEMENT" && (
          <div className="flex flex-col gap-4 w-full">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-white uppercase tracking-wider">
                💬 SECURE CHAT GRID TERMINAL
              </span>
              <span className="text-[8.5px] text-emerald-400 font-bold uppercase">AES-ASCON TRUNK</span>
            </div>
            <DeltaElement
              onAddLog={onAddLog}
              onSelectCoordinate={(coords) => {
                setActiveWorkspace("MONITOR");
                onAddLog({
                  source: "PORTAL GATEWAY",
                  type: "SUCCESS",
                  message: `TRANSIT ROUTING: Toggled active view to Monitor MAP. Centered and anchored onto coordination target: ${coords}.`
                });
              }}
            />
          </div>
        )}

        {/* VIEW 5: TARGET HUB planning */}
        {activeWorkspace === "TARGET_HUB" && (
          <div className="flex flex-col gap-4 w-full">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-white uppercase tracking-wider">
                🎯 WEAPONEERING COORDINATES & BALLISTICS PLANNING
              </span>
              <span className="text-[8.5px] text-red-400 font-bold uppercase border border-red-955 bg-red-950/20 px-1 rounded">SHAKTI STRIKE GRID</span>
            </div>
            <DeltaTargetHub onAddLog={onAddLog} />
          </div>
        )}

        {/* VIEW 6: TUBE multi-sensors list */}
        {activeWorkspace === "TUBE" && (
          <div className="flex flex-col gap-4 w-full">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-white uppercase tracking-wider">
                📺 MULTI-SENSOR ACOUSTIC FUSION & SPECTRAL WATERFALL
              </span>
              <span className="text-[8.5px] text-purple-400 font-bold uppercase">TRIG DECODER ACTIVE</span>
            </div>
            <DeltaTube onAddLog={onAddLog} />
          </div>
        )}

        {/* VIEW 7: SOVEREIGN DATA FABRIC Operational Knowledge Graph */}
        {activeWorkspace === "DATA_FABRIC" && (
          <div className="flex flex-col gap-4 w-full">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-white uppercase tracking-wider">
                🗄️ SOVEREIGN DATA FUSION FABRIC & ENTITY RECORDS
              </span>
              <span className="text-[8.5px] text-amber-400 font-bold uppercase">ZERO-TRUST SECURE</span>
            </div>
            <DeltaDataFabric onAddLog={onAddLog} />
          </div>
        )}

        {/* VIEW 8: WIKI reference capabilities */}
        {activeWorkspace === "WIKI" && (
          <div className="flex flex-col gap-4 w-full">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-white uppercase tracking-wider">
                📖 ARCHITECTURAL LAYER AUDITS (L-1 TO L-20)
              </span>
              <span className="text-[8.5px] text-slate-400 font-bold uppercase">REFERENCE MANUAL CLASSIFIED</span>
            </div>
            <DeltaWiki />
          </div>
        )}

        {/* VIEW 9: BRAIN_2035 - CORE MISSION DECISION BRAIN */}
        {activeWorkspace === "BRAIN_2035" && (
          <div className="flex flex-col gap-4 w-full">
            <IndraNetBrain2035 onAddLog={onAddLog} himalayanOps={himalayanOps} />
          </div>
        )}

      </main>
    </div>
  );
}

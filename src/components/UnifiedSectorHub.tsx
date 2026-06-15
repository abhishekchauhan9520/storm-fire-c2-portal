import React, { useState } from "react";
import { CommandSystem } from "../types";
import { Shield, Zap, Globe, Cpu, Radio, Laptop, RefreshCw, BarChart2, Info, CheckCircle2, AlertTriangle, Play, HelpCircle, Activity } from "lucide-react";

interface UnifiedSectorHubProps {
  systems: CommandSystem[];
  onToggleOverlay: (systemId: string) => void;
  onSetStatus: (systemId: string, status: CommandSystem["status"]) => void;
  onAddLog: (log: { source: string; type: "ALERT" | "INFO" | "SUCCESS" | "WARNING"; message: string }) => void;
}

export default function UnifiedSectorHub({ systems, onToggleOverlay, onSetStatus, onAddLog }: UnifiedSectorHubProps) {
  const [activeBranchTab, setActiveBranchTab] = useState<CommandSystem["branch"] | "ALL">("ALL");
  const [drillRunning, setDrillRunning] = useState<string | null>(null);

  // Group counting
  const totalSystems = systems.length;
  const integratedCount = systems.filter(s => s.status === "INTEGRATED").length;
  const overlayCount = systems.filter(s => s.activeOverlay).length;

  const branchLabels: Record<CommandSystem["branch"] | "ALL", { label: string; desc: string; color: string; icon: any }> = {
    ALL: { label: "🌐 FULL SUITE", desc: "Global All-Domain C2 Framework", color: "text-indigo-400 border-indigo-950", icon: Globe },
    ARMY: { label: "🪖 ARMY COMMAND", desc: "Akashteer, ACCCS Shakti & Battlefield Systems", color: "text-emerald-400 border-emerald-950", icon: Shield },
    AIR_FORCE: { label: "🪂 AIR SPACE SHIELD", desc: "IACCS, AFNET & Strategic Air Defense Networks", color: "text-sky-400 border-sky-950", icon: Radio },
    NAVY: { label: "⚓ NAVY MARITIME", desc: "NC3I, IMAC, Maritime Domain Awareness & CMS", color: "text-cyan-400 border-cyan-950", icon: Activity },
    TRI_SERVICE: { label: "🤝 JOINT INTEGRAL", desc: "DCN, IDS Info Grid & Unified Defence Cloud Networks", color: "text-purple-400 border-purple-950", icon: Cpu },
    SPACE_ISR: { label: "🛰️ SPACE & ISR", desc: "Space SSA Situational, Satellite Taskings & ELINT Fusion", color: "text-yellow-400 border-yellow-950", icon: Globe },
    CYBER_EW: { label: "💻 CYBER & SPECTRUM", desc: "DCA CSAP, SIEM Security Center & Signal Intelligence", color: "text-red-400 border-red-950", icon: Laptop },
    LOGISTICS: { label: "📦 LOGISTICS & ERP", desc: "Ammunition tracking, Fuel supplies & military ERP systems", color: "text-pink-400 border-pink-955", icon: Zap },
  };

  const handleTriggerDrill = (sys: CommandSystem) => {
    setDrillRunning(sys.id);
    onAddLog({
      source: sys.acronym,
      type: "INFO",
      message: `🔄 INITIALIZING DIAGNOSTIC DRILL on system [${sys.name}]. Injecting multi-spectral synchronization ping.`
    });

    const isSuccess = Math.random() > 0.15; // 85% success for drills

    setTimeout(() => {
      setDrillRunning(null);
      if (isSuccess) {
        onSetStatus(sys.id, "INTEGRATED");
        onAddLog({
          source: sys.acronym,
          type: "SUCCESS",
          message: `🛰️ DIAGNOSTIC SUCCESS: [${sys.name}] verified within next-gen Ukrainian Delta schema with 100% telemetry alignment.`
        });
      } else {
        onSetStatus(sys.id, "COGNITIVE_DEGRADED");
        onAddLog({
          source: sys.acronym,
          type: "WARNING",
          message: `⚠️ DIAGNOSTIC IMPEDIMENT: Signal jitter detected on [${sys.name}]. Commencing cognitive frequency auto-switch route.`
        });
      }
    }, 1500);
  };

  const handleBulkIntegrate = () => {
    const targetSet = activeBranchTab === "ALL" ? systems : systems.filter(s => s.branch === activeBranchTab);
    targetSet.forEach(sys => {
      onSetStatus(sys.id, "INTEGRATED");
    });
    onAddLog({
      source: "INTEGRATION CORE",
      type: "SUCCESS",
      message: `⚡ BULK COMMENCEMENT: Integrated all systems under branch filter [${activeBranchTab}] directly into the common operational picture (COP).`
    });
  };

  const filteredSystems = activeBranchTab === "ALL" ? systems : systems.filter(s => s.branch === activeBranchTab);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-xl select-none flex flex-col gap-4">
      
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-950/60 border border-indigo-500/50 p-2 rounded">
            <Globe className="h-5 w-5 text-indigo-400 animate-spin" style={{ animationDuration: "30s" }} />
          </div>
          <div>
            <h2 className="text-sm font-mono font-black uppercase text-white tracking-widest flex items-center gap-2">
              UNIFIED C2 STRATEGIC INTEGRATOR HUB (NEXT-GEN)
              <span className="text-[9px] font-normal px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-900 animate-pulse">
                UKRAINE DELTA + SVOD HOMOLOGATED
              </span>
            </h2>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">
              Cross-domain synchronization of Branch C2 nodes into a single, comprehensive common operational picture (COP)
            </p>
          </div>
        </div>

        {/* Global Hub Telemetry */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 bg-slate-950 border border-slate-800 rounded font-mono text-[9px] text-slate-400 leading-none">
            <div className="text-slate-600 font-bold mb-1">TOTAL SYSTEMS COHERED</div>
            <div className="text-xs text-white font-black">{integratedCount} / {totalSystems} <span className="text-emerald-400 text-[9px] font-normal">Active</span></div>
          </div>
          <div className="p-2 bg-slate-950 border border-slate-800 rounded font-mono text-[9px] text-slate-400 leading-none">
            <div className="text-slate-600 font-bold mb-1">COP GIS OVERLAYS ACTIVE</div>
            <div className="text-xs text-cyan-400 font-black">{overlayCount} Layers</div>
          </div>
        </div>
      </div>

      {/* Domain/Branch Navigation Tab Bar */}
      <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800/80">
        {(Object.keys(branchLabels) as Array<CommandSystem["branch"] | "ALL">).map((tab) => {
          const config = branchLabels[tab];
          const isActive = activeBranchTab === tab;
          const count = tab === "ALL" ? systems.length : systems.filter(s => s.branch === tab).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveBranchTab(tab)}
              className={`px-2.5 py-1.5 text-[9px] font-mono font-bold rounded transition-all uppercase flex items-center gap-1.5 border ${
                isActive
                  ? "bg-indigo-950 border-indigo-700 text-white shadow-inner"
                  : "bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/60"
              }`}
            >
              <span>{config.label}</span>
              <span className={`px-1 rounded-sm text-[8px] font-normal ${isActive ? "bg-indigo-900 text-indigo-300" : "bg-slate-900 text-slate-600"}`}>
                {count}
              </span>
            </button>
          )}
        )}
      </div>

      {/* Description info on current view */}
      <div className="bg-slate-950 p-2.5 rounded border border-slate-800/60 flex items-start gap-2.5 font-mono text-[10px] text-slate-400 leading-relaxed justify-between">
        <div className="flex items-start gap-2">
          <Info className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <span className="text-white font-bold block uppercase">{branchLabels[activeBranchTab].label} — ARCHITECTURE SUMMARY</span>
            <span>{branchLabels[activeBranchTab].desc}. Activate system-line overlays to render real-time telemetry ranges, missile corridors, acoustic nets, or orbital paths on our Common Operational Picture grid map above!</span>
          </div>
        </div>
        <button
          onClick={handleBulkIntegrate}
          className="shrink-0 text-[8.5px] font-bold uppercase bg-indigo-950 border border-indigo-800 hover:border-indigo-600 text-indigo-400 px-2 py-1 rounded transition-all flex items-center gap-1 hover:text-white"
        >
          <RefreshCw className="h-3 w-3" />
          Bulk Sync Branch
        </button>
      </div>

      {/* Grid of system items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1">
        {filteredSystems.map((sys) => {
          const isOverlay = sys.activeOverlay;
          const statusColors = {
            INTEGRATED: "text-emerald-400 bg-emerald-950/40 border-emerald-900",
            STANDBY: "text-slate-400 bg-slate-950 border-slate-800",
            COGNITIVE_DEGRADED: "text-amber-500 bg-amber-950/40 border-amber-900 animate-pulse",
            OFFLINE: "text-red-500 bg-red-950/40 border-red-900"
          };

          const isThisDrillRunning = drillRunning === sys.id;

          return (
            <div
              key={sys.id}
              className={`p-3 bg-slate-950/70 border rounded-lg font-mono text-[10.5px] flex flex-col justify-between gap-2.5 transition-all hover:bg-slate-950 hover:border-slate-800 ${
                isOverlay
                  ? "border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.06)]"
                  : "border-slate-800/80"
              }`}
            >
              {/* Card Title & Status indicator */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-bold uppercase leading-tight tracking-wide flex items-center gap-1.5 flex-wrap">
                    {sys.acronym}
                    <span className="text-[8px] font-normal text-slate-500 lowercase">({sys.branch.replace("_", " ")})</span>
                  </h3>
                  <div className="text-[8px] text-slate-500 mt-1 uppercase line-clamp-1 truncate w-full" title={sys.name}>
                    {sys.name}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-[8.5px] px-1.5 py-0.5 rounded border uppercase font-bold leading-none select-none ${statusColors[sys.status]}`}>
                    {sys.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Brief details description */}
              <p className="text-[9.5px] text-slate-400 leading-normal line-clamp-2 h-7 overflow-hidden" title={sys.description}>
                {sys.description}
              </p>

              {/* Interactive buttons */}
              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-900 font-mono">
                {/* Overlay Toggle button */}
                <button
                  onClick={() => onToggleOverlay(sys.id)}
                  className={`py-1 text-[9px] font-bold rounded border uppercase transition-all flex items-center justify-center gap-1 ${
                    isOverlay
                      ? "bg-indigo-950 text-indigo-300 border-indigo-700"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <Globe className={`h-3 w-3 ${isOverlay ? "animate-pulse text-indigo-400" : ""}`} />
                  {isOverlay ? "LAYER DEPLOYED" : "INTEGRATE COP"}
                </button>

                {/* Local Action Diagnostic drill */}
                <button
                  disabled={isThisDrillRunning}
                  onClick={() => handleTriggerDrill(sys)}
                  className="py-1 text-[9px] bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-800 rounded transition-all uppercase flex items-center justify-center gap-1"
                >
                  <RefreshCw className={`h-3 w-3 ${isThisDrillRunning ? "animate-spin text-cyan-400" : ""}`} />
                  {isThisDrillRunning ? "SYNCING..." : "TEST PATH"}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Tactical integration drill prompt alert */}
      <div className="text-[9.5px] font-mono text-slate-500 flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-900 select-none">
        <span className="flex items-center gap-1 leading-none uppercase">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          All cryptographic communications mapped to DCN & ASCON static networks. No clear-text packet leakage.
        </span>
        <span className="text-slate-600">LATENCY JITTER: 0.15ms</span>
      </div>

    </div>
  );
}

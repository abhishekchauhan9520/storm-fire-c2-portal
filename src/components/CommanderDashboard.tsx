import React, { useState } from "react";
import { Role, TacticalNode, TacticalTrack, CombatPowerIndex, TacticalLog, KillChainState } from "../types";
import { ShieldCheck, Server, AlertTriangle, Battery, Snowflake, Wind, Activity, Zap, RefreshCw, Send, Radio } from "lucide-react";

interface CommanderDashboardProps {
  currentRole: Role;
  onChangeRole: (role: Role) => void;
  nodes: TacticalNode[];
  onToggleNodeStatus: (nodeId: string) => void;
  combatUnits: CombatPowerIndex[];
  onRestoreReadyStatus: (unitId: string) => void;
  logs: TacticalLog[];
  himalayanOps: boolean;
  onToggleHimalayanOps: () => void;
}

export default function CommanderDashboard({
  currentRole,
  onChangeRole,
  nodes,
  onToggleNodeStatus,
  combatUnits,
  onRestoreReadyStatus,
  logs,
  himalayanOps,
  onToggleHimalayanOps,
}: CommanderDashboardProps) {
  const [airspaceSector, setAirspaceSector] = useState("Alpha-Air-Safe");
  
  // Calculate aggregate connectivity
  const onlineCount = nodes.filter(n => n.status === "ONLINE").length;
  const jammedCount = nodes.filter(n => n.status === "JAMMED").length;

  return (
    <div className="flex flex-col gap-4">
      
      {/* Zero Trust IAM Status & Roles Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-xl select-none flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">SOVEREIGN ZERO-TRUST PROTOCOL</div>
            <div className="text-xs text-white font-mono font-bold flex items-center gap-1">
              IAM SECURITY ENVELOPE: <span className="text-emerald-400">ACTIVE CHIP LOCK</span>
            </div>
          </div>
        </div>

        {/* Change Role Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-slate-500 uppercase">ACCESS AUTHORITY:</span>
          <div className="flex gap-1">
            {(Object.values(Role) as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => onChangeRole(r)}
                className={`px-2 py-1 text-[9px] font-mono font-bold rounded border uppercase transition-all ${
                  currentRole === r
                    ? "bg-emerald-950 border-emerald-500 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                {r === Role.COMMANDER ? "Theatre Commander" : r === Role.INTELLIGENCE_OFFICER ? "Intelligence" : "Frontline Lieutenant"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Nodes (Spinal Fabric) + Combat power index */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Left Column: Digital Spine Network Backbone Status */}
        <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-md flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Server className="h-4 w-4 text-cyan-400" />
              DIGITAL SPINE BACKBONE NODES
            </span>
            <span className="text-[8px] font-mono text-slate-500">
              OK: {onlineCount}/{nodes.length}
            </span>
          </div>

          <p className="text-[10px] font-mono text-slate-400 leading-normal">
            Sovereign communications nodes bridging high-altitude edge tactical signals. Click a node to simulate interference/jamming to test cognitive recovery.
          </p>

          <div className="flex flex-col gap-2">
            {nodes.map((node) => {
              const isOnline = node.status === "ONLINE";
              const isJammed = node.status === "JAMMED";
              
              return (
                <div
                  key={node.id}
                  onClick={() => onToggleNodeStatus(node.id)}
                  className={`p-2.5 rounded border font-mono text-xs flex items-center justify-between cursor-pointer transition-all ${
                    isOnline 
                      ? "bg-slate-950/80 border-slate-800 hover:border-slate-700" 
                      : isJammed 
                        ? "bg-red-950/20 border-red-900/60 hover:border-red-800 text-red-400 animate-pulse" 
                        : "bg-slate-950/40 border-slate-900 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-cyan-500 animate-pulse" : isJammed ? "bg-red-500" : "bg-slate-700"}`}></span>
                    <div>
                      <div className="font-bold text-slate-300">{node.name}</div>
                      <div className="text-[8px] text-slate-500">TYPE: {node.type} | CELL: {node.location}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] font-bold px-1 rounded border uppercase ${
                      isOnline 
                        ? "bg-cyan-950/50 border-cyan-800 text-cyan-400"
                        : isJammed 
                          ? "bg-red-950/50 border-red-900 text-red-500"
                          : "bg-slate-950 border-slate-800 text-slate-500"
                    }`}>
                      {node.status}
                    </span>
                    {isJammed && (
                      <div className="text-[7px] text-red-400 mt-1 uppercase font-semibold">
                        Cognitive EW Swapping...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Combat Power Index & Logistics ERP */}
        <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-md flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-emerald-400" />
              COMBAT READY & LOGISTICS INDEX (ERP)
            </span>
            <span className="text-[8px] font-mono text-slate-500">REAL-TIME TELEMETRICS</span>
          </div>

          <p className="text-[10px] font-mono text-slate-400 leading-normal">
            Readiness index of combat mountain divisions. Under combat or fuel supply interruptions, click resupply to authorize strategic logistics.
          </p>

          <div className="flex flex-col gap-2.5">
            {combatUnits.map((unit) => {
              const isCritical = unit.health < 60 || unit.fuel < 60;
              const isWarning = unit.health < 80 && !isCritical;
              
              return (
                <div key={unit.id} className="bg-slate-950 p-2 rounded border border-slate-800/80 font-mono text-[10px]">
                  <div className="flex items-center justify-between font-bold text-slate-300 mb-1.5">
                    <span className="uppercase">{unit.name} <span className="text-slate-600">({unit.unit})</span></span>
                    <span className={`text-[9px] font-bold ${isCritical ? "text-red-500 animate-pulse" : isWarning ? "text-amber-400" : "text-emerald-400"}`}>
                      {isCritical ? "⚠️ CRITICAL LEVEL" : isWarning ? "⚠️ LOW LEVEL" : "READY"}
                    </span>
                  </div>

                  {/* Meter indicators */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="text-[8px] text-slate-500">COMBAT STRENGTH</div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            unit.health < 60 ? "bg-red-500" : unit.health < 80 ? "bg-amber-400" : "bg-emerald-500"
                          }`}
                          style={{ width: `${unit.health}%` }}
                        ></div>
                      </div>
                      <div className="text-[8px] text-right text-slate-400 mt-0.5">{unit.health}%</div>
                    </div>

                    <div>
                      <div className="text-[8px] text-slate-500">AMMUNITION LOG</div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                          style={{ width: `${unit.ammo}%` }}
                        ></div>
                      </div>
                      <div className="text-[8px] text-right text-slate-400 mt-0.5">{unit.ammo}%</div>
                    </div>

                    <div>
                      <div className="text-[8px] text-slate-500">FUEL STORES</div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            unit.fuel < 60 ? "bg-orange-500" : "bg-cyan-500"
                          }`}
                          style={{ width: `${unit.fuel}%` }}
                        ></div>
                      </div>
                      <div className="text-[8px] text-right text-slate-400 mt-0.5">{unit.fuel}%</div>
                    </div>
                  </div>

                  {/* Resupply Trigger */}
                  {(isCritical || isWarning) && (
                    <div className="flex justify-end mt-1">
                      <button
                        onClick={() => onRestoreReadyStatus(unit.id)}
                        className="bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 text-[8px] font-bold px-2 py-0.5 rounded uppercase font-mono transition-all flex items-center gap-1"
                      >
                        <RefreshCw className="h-2 w-2 animate-spin" />
                        Authorize Tactical Resupply Route
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Strategic Parameters HUD Block */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-md font-mono text-xs text-slate-300">
        <span className="text-white font-mono font-bold block mb-2 text-xs uppercase tracking-wider">
          SOVEREIGN REGIONAL STRATEGIC CONTROLS
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
          
          {/* Section 1: Himalayan Ops Spec */}
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex flex-col gap-1.5 justify-between">
            <div>
              <div className="font-bold flex items-center gap-1 text-slate-200">
                <Snowflake className="h-4 w-4 text-cyan-400 animate-spin" style={{ animationDuration: "14s" }} />
                HIMALAYAN OPERATIONS CONFIG
              </div>
              <p className="text-[9px] text-slate-500 mt-1">
                Calibrates high-altitude drone battery cold degradation and troop physical oxygen indexes. Toggle for low temp calibration.
              </p>
            </div>

            <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-900">
              <span className="text-[9px] text-slate-400">CALIBRATE COLD RANGES:</span>
              <button
                onClick={onToggleHimalayanOps}
                className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase transition-all ${
                  himalayanOps
                    ? "bg-amber-950 border-amber-500 text-amber-400"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}
              >
                {himalayanOps ? "ALTITUDE HIGH RISK" : "NORMAL TEMP ROUTING"}
              </button>
            </div>
          </div>

          {/* Section 2: Air space control router */}
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex flex-col gap-1.5 justify-between">
            <div>
              <div className="font-bold flex items-center gap-1 text-slate-200">
                <Radio className="h-4 w-4 text-purple-400" />
                AKASHTEER AIR-LAND COORDINATION
              </div>
              <p className="text-[9px] text-slate-500 mt-1">
                Ensures missile flight vectors do not conflict with friendly strike routes.
              </p>
            </div>

            <div className="flex flex-col gap-1 text-[9px] mt-2 pt-1 border-t border-slate-900 text-right">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">AIRSPACE STATUS:</span>
                <span className="text-emerald-400 font-bold uppercase">{airspaceSector}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end mt-1">
                <button
                  onClick={() => {
                    setAirspaceSector("Air-Zone-Red-Armed");
                  }}
                  className="px-1 bg-red-950 border border-red-800 hover:border-red-600 text-red-400 rounded-sm scale-90"
                >
                  ARM ZONE
                </button>
                <button
                  onClick={() => {
                    setAirspaceSector("Alpha-Air-Safe");
                  }}
                  className="px-1 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 rounded-sm scale-90"
                >
                  CLEAR ZONE
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: EW Spectrum Shield */}
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex flex-col gap-1.5 justify-between">
            <div>
              <div className="font-bold flex items-center gap-1 text-slate-200">
                <Zap className="h-4 w-4 text-emerald-400 animate-pulse" />
                COGNITIVE EW SPECTRAM SHIELD
              </div>
              <p className="text-[9px] text-slate-500 mt-1">
                Continuously tracks radio interference envelopes from opposing jamming towers to reroute communications grid.
              </p>
            </div>

            <div className="flex items-center justify-between text-[9px] mt-2 pt-1 border-t border-slate-900">
              <span className="text-slate-400">SPECTRUM PATROL:</span>
              <span className="text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900 px-1 rounded uppercase">
                AUTOMATIC TUNING
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

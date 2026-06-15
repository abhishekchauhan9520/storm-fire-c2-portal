import React, { useState } from "react";
import { KillChainState, TacticalTrack, TacticalLog } from "../types";
import { Flame, ShieldAlert, Crosshair, Cpu, CheckSquare, RefreshCw, Send, Radio, Compass } from "lucide-react";

interface KillChainModuleProps {
  selectedTrack: TacticalTrack | null;
  onAdvanceKillChain: (nextState: KillChainState) => void;
  killChainState: KillChainState;
  onTriggerStrike: (pinakaOption: string) => void;
  onAddLog: (log: Omit<TacticalLog, "id" | "timestamp">) => void;
}

const STAGES = [
  { key: KillChainState.FIND, label: "F1 - FIND", desc: "Sensor Discovery", icon: Radio },
  { key: KillChainState.FIX, label: "F2 - FIX", desc: "Drone Confirmation", icon: Compass },
  { key: KillChainState.TRACK, label: "F3 - TRACK", desc: "Continuous Lock", icon: Crosshair },
  { key: KillChainState.TARGET, label: "F4 - TARGET", desc: "Tactical Prioritization", icon: Cpu },
  { key: KillChainState.ENGAGE, label: "F5 - ENGAGE", desc: "Fire Action Authorization", icon: Flame },
  { key: KillChainState.ASSESS, label: "F6 - ASSESS", desc: "Damage Assessment BDA", icon: CheckSquare },
];

export default function KillChainModule({
  selectedTrack,
  onAdvanceKillChain,
  killChainState,
  onTriggerStrike,
  onAddLog,
}: KillChainModuleProps) {
  const [selectedWeapon, setSelectedWeapon] = useState<"PINAKA" | "BRAHMOS" | "FPV_SWARM">("PINAKA");
  const [bdaProcessing, setBdaProcessing] = useState(false);

  const getStageIndex = (state: KillChainState) => {
    return STAGES.findIndex((s) => s.key === state);
  };

  const handleWeaponSelection = (type: "PINAKA" | "BRAHMOS" | "FPV_SWARM") => {
    setSelectedWeapon(type);
    onAddLog({
      source: "WEAPONEERING AI",
      type: "INFO",
      message: `Simulated weaponry switched to ${type === "PINAKA" ? "Pinaka Multi-Barrel Rocket Launcher" : type === "BRAHMOS" ? "BrahMos Block III Cruise Missile" : "Tactical FPV Swarm"}.`
    });
  };

  const currentStageIndex = getStageIndex(killChainState);

  // Auto recommend weapons depending on priority
  const getAirDefenseThreat = () => {
    // If nearby S-400 exists, air support is dangerous, recommend Pinaka artillery
    return "HIGH (Avoid Air Assets / Prefer Guided Ground Rocket Artillery)";
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col gap-4 shadow-xl select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-500 animate-pulse" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
            SENSOR-TO-SHOOTER KILL-CHAIN ORCHESTRATOR
          </h2>
        </div>
        <div className="bg-red-950/50 text-red-400 border border-red-900/60 text-[9px] font-mono px-2 py-0.5 rounded uppercase tracking-wider">
          {selectedTrack ? `Target Identified: ${selectedTrack.name}` : "No Active Target Nominated"}
        </div>
      </div>

      {/* Timeline Steps Indicator */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 border-b border-slate-800/60 pb-3">
        {STAGES.map((stage, idx) => {
          const StageIcon = stage.icon;
          const isPassed = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          
          return (
            <button
              key={stage.key}
              disabled={!selectedTrack || (idx > currentStageIndex + 1 && killChainState !== KillChainState.ASSESS)}
              onClick={() => onAdvanceKillChain(stage.key)}
              className={`flex flex-col items-center p-2 rounded border text-center transition-all ${
                isCurrent 
                  ? "bg-red-950/40 border-red-500 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.2)]" 
                  : isPassed 
                    ? "bg-slate-950 border-emerald-900 text-emerald-500 font-semibold opacity-95" 
                    : "bg-slate-950/40 border-slate-800 text-slate-500 disabled:opacity-40"
              }`}
            >
              <StageIcon className={`h-4.5 w-4.5 mb-1 ${isCurrent ? "animate-pulse text-red-400" : isPassed ? "text-emerald-500" : ""}`} />
              <div className="text-[10px] font-mono font-bold truncate w-full">{stage.label}</div>
              <div className="text-[7px] text-slate-500 font-mono truncate w-full mt-0.5">{stage.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Target and Context Details */}
      {!selectedTrack ? (
        <div className="bg-slate-950/60 border border-dashed border-slate-800 py-8 text-center rounded-md">
          <Crosshair className="h-8 w-8 text-slate-600 mx-auto mb-2 animate-spin" style={{ animationDuration: '10s' }} />
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            Awaiting Threat Nomination. Click any RED track on the map grid to initiate kill-chain.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Main Action Config Left */}
          <div className="md:col-span-12 lg:col-span-7 bg-slate-950 p-3 rounded-md border border-slate-800/80">
            {killChainState === KillChainState.FIND && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-red-500 font-mono font-semibold uppercase block">
                  STAGE F1: SENSOR ACQUISITION INVOLVED
                </span>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  Seismic acoustic sensors and thermal sat-relays detected raw footprint trends in high resolution matching thermal heat signatures of <strong className="text-red-400">{selectedTrack.name}</strong>.
                </p>
                <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 text-[10px] font-mono text-slate-400">
                  ⚡ INITIAL GRID STAMP: <span className="text-cyan-400">{selectedTrack.coordinates}</span> | CONFIDENCE: 92%
                </div>
                <button
                  onClick={() => onAdvanceKillChain(KillChainState.FIX)}
                  className="mt-4 bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 hover:border-red-600 text-xs py-2 font-mono font-bold rounded uppercase flex items-center justify-center gap-1.5 transition-all"
                >
                  Confirm Signals & Dispatch Drone Tracking (F2 - FIX)
                </button>
              </div>
            )}

            {killChainState === KillChainState.FIX && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-amber-500 font-mono font-semibold uppercase block">
                  STAGE F2: TELEMETRY FIX CONFIRMATION
                </span>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  TACTICAL HERON recon UAV redirected to coordinate <strong className="text-cyan-400">{selectedTrack.coordinates}</strong> to stream high-density zoom optical data. Target profile visual confirmation.
                </p>
                <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 text-[10px] font-mono text-slate-400 flex flex-col gap-1">
                  <div>✨ SENSOR FUSION ENGINE FEEDBACK:</div>
                  <div className="text-amber-400">Target Type: {selectedTrack.type} spotted | Heat Profile: 420°C</div>
                </div>
                <button
                  onClick={() => onAdvanceKillChain(KillChainState.TRACK)}
                  className="mt-4 bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 hover:border-red-600 text-xs py-2 font-mono font-bold rounded uppercase flex items-center justify-center gap-1.5 transition-all"
                >
                  Execute Constant LOCK (F3 - TRACK)
                </button>
              </div>
            )}

            {killChainState === KillChainState.TRACK && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-yellow-500 font-mono font-semibold uppercase block">
                  STAGE F3: CONTINUOUS lock lock LOCK
                </span>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  Continuous laser telemetry designation locked. Red track tracked continuously despite rough weather and mountain slope dead angles.
                </p>
                <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <span>VELOCITY MATCHING: <strong className="text-cyan-400">{selectedTrack.speed}</strong></span>
                  <span className="flex items-center gap-1 h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                </div>
                <button
                  onClick={() => onAdvanceKillChain(KillChainState.TARGET)}
                  className="mt-4 bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 hover:border-red-600 text-xs py-2 font-mono font-bold rounded uppercase flex items-center justify-center gap-1.5 transition-all"
                >
                  Calculate Weaponeering Assessment (F4 - TARGET)
                </button>
              </div>
            )}

            {killChainState === KillChainState.TARGET && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-cyan-400 font-mono font-semibold uppercase block">
                  STAGE F4: COMBAT WEAPONEERING OPTIMIZER
                </span>
                <p className="text-xs text-slate-400 font-mono">
                  Nominate firearm trajectory based on local risk and collateral rules:
                </p>

                {/* Weapon Options Cards */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    onClick={() => handleWeaponSelection("PINAKA")}
                    className={`p-2 rounded border text-left font-mono ${
                      selectedWeapon === "PINAKA"
                        ? "bg-cyan-950 border-cyan-500 text-cyan-400"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-[9px] font-bold">PINAKA MLRS</div>
                    <div className="text-[8px] text-slate-500 mt-1">Guided Rocket</div>
                    <div className="text-[8px] text-emerald-400 mt-0.5">Success: 94%</div>
                  </button>
                  <button
                    onClick={() => handleWeaponSelection("BRAHMOS")}
                    className={`p-2 rounded border text-left font-mono ${
                      selectedWeapon === "BRAHMOS"
                        ? "bg-cyan-950 border-cyan-500 text-cyan-400"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-[9px] font-bold">BrahMos Supersonic</div>
                    <div className="text-[8px] text-slate-500 mt-1">Cruise Missile</div>
                    <div className="text-[8px] text-emerald-400 mt-0.5">Success: 99%</div>
                  </button>
                  <button
                    onClick={() => handleWeaponSelection("FPV_SWARM")}
                    className={`p-2 rounded border text-left font-mono ${
                      selectedWeapon === "FPV_SWARM"
                        ? "bg-cyan-950 border-cyan-500 text-cyan-400"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-[9px] font-bold">FPV SWARM</div>
                    <div className="text-[8px] text-slate-500 mt-1">Autonomous micro-UAV</div>
                    <div className="text-[8px] text-emerald-400 mt-0.5">Success: 82%</div>
                  </button>
                </div>

                <div className="mt-2 text-[9px] font-mono text-slate-500">
                  *AI ADVISOR NOTE: FPV drones may show degraded motor speed at high winds. Pinaka Rocket Artillery recommended first.
                </div>

                <button
                  onClick={() => onAdvanceKillChain(KillChainState.ENGAGE)}
                  className="mt-4 bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 hover:border-red-600 text-xs py-2 font-mono font-bold rounded uppercase flex items-center justify-center gap-1.5 transition-all"
                >
                  Allocate Weapon & Transition to Lock Release (F5 - ENGAGE)
                </button>
              </div>
            )}

            {killChainState === KillChainState.ENGAGE && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-red-500 font-mono font-semibold uppercase block animate-pulse">
                  CRITICAL AUTH: F5 - ENGAGE MISSION LOCK RELEASE
                </span>
                <p className="text-xs text-slate-300 font-mono">
                  Sovereign authority requested. Target: <strong className="text-red-400 font-bold">{selectedTrack.name}</strong>. Firing channel established with: <strong className="text-white">{selectedWeapon === "PINAKA" ? "Pinaka battery" : selectedWeapon === "BRAHMOS" ? "BrahMos command unit" : "Kamikaze FPV launcher"}</strong>.
                </p>

                <div className="mt-2 p-2 bg-slate-900 rounded border border-red-900 text-[10px] font-mono text-red-400">
                  💥 DANGER: AUTHORIZATION OPENS LAUNCH CORRIDOR. AIRSPACE SHIELD RE-ROUTED TO PREVENT CORRIDOR FRATRICIDE.
                </div>

                <button
                  onClick={() => onTriggerStrike(selectedWeapon)}
                  className="mt-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-mono text-sm py-3 font-bold rounded uppercase flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse"
                >
                  <Flame className="h-5 w-5" />
                  AUTHORIZE & RELEASE FIRE STRIKE
                </button>
              </div>
            )}

            {killChainState === KillChainState.ASSESS && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-emerald-400 font-mono font-semibold uppercase block">
                  STAGE F6: SECURE BATTLE DAMAGE ASSESSMENT
                </span>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  UAV radar imagery confirming structural layout state of target coordinate.
                </p>

                <div className="mt-2 p-3 bg-emerald-950/20 rounded border border-emerald-900/60 flex items-center justify-between font-mono text-xs text-emerald-400 gap-4">
                  <div>
                    <div className="font-bold underline uppercase">BDA REPORT: TARGET RECOGNITION</div>
                    <div className="text-[10px] text-slate-400 mt-1">100% impact precision. No movement registered of hostiles. Target categorized as NEUTRALIZED.</div>
                  </div>
                  <div className="border border-emerald-800 p-1 font-bold text-center bg-emerald-900/40 shrink-0 text-[10px]">
                    STATUS:<br/>K.I.A
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    onClick={() => {
                      onAdvanceKillChain(KillChainState.FIND);
                      onAddLog({
                        source: "KILL CHAIN MANAGER",
                        type: "INFO",
                        message: "Tactical target loop cycled. Monitoring sector for new hostile nominations."
                      });
                    }}
                    className="p-2 border border-slate-700 hover:border-slate-500 bg-slate-900 text-slate-300 text-[10px] font-mono font-bold rounded uppercase transition-all"
                  >
                    Nominate Next Target Loop
                  </button>
                  <button
                    onClick={() => {
                      setBdaProcessing(true);
                      setTimeout(() => {
                        setBdaProcessing(false);
                        onAddLog({
                          source: "SAR ANALYST",
                          type: "SUCCESS",
                          message: "Post-strike debris change assessment finalized. Satellite imagery locked."
                        });
                      }, 1200);
                    }}
                    disabled={bdaProcessing}
                    className="p-2 border border-emerald-900 hover:bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold rounded uppercase flex items-center justify-center gap-1.5 transition-all"
                  >
                    <RefreshCw className={`h-3 w-3 ${bdaProcessing ? "animate-spin" : ""}`} />
                    {bdaProcessing ? "Generating..." : "Recapture SAR Debris Map"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats Panel Right */}
          <div className="md:col-span-12 lg:col-span-5 flex flex-col gap-3">
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-md font-mono text-[10px] text-slate-400 flex flex-col gap-2">
              <div className="text-white font-bold border-b border-slate-800 pb-1 flex items-center justify-between">
                <span>NOMINATED THREAT VETTING</span>
                <span className="text-red-500">HOSTILE</span>
              </div>
              <div>
                <span className="text-slate-600 block">TACTICAL CLASS</span>
                <span className="text-slate-300 font-semibold">{selectedTrack.type} ({selectedTrack.name})</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <span className="text-slate-600 block">ALT/ALTITUDE</span>
                  <span className="text-slate-300">{selectedTrack.altitude || "N/A Ground"}</span>
                </div>
                <div>
                  <span className="text-slate-600 block">GRID COORDINATES</span>
                  <span className="text-slate-300">{selectedTrack.coordinates}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-600 block">LOCAL AIR DEFENSE EMBYONIC BUCKET</span>
                <span className="text-amber-500 font-semibold">{getAirDefenseThreat()}</span>
              </div>
              {selectedTrack.weapons && (
                <div>
                  <span className="text-slate-600 block">OBSERVED PAYLOAD ARMS</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTrack.weapons.map((w) => (
                      <span key={w} className="bg-slate-900 border border-slate-800 px-1 text-slate-400 font-bold scale-95 uppercase">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Simulated Radar Reticle Status Box */}
            <div className="relative h-[95px] bg-slate-950 border border-slate-800 rounded-md overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500 via-transparent to-transparent animate-pulse"></div>
              <div className="absolute border border-red-500/10 rounded-full w-24 h-24 animate-ping" style={{ animationDuration: '4s' }}></div>
              <div className="absolute border border-red-500/20 rounded-full w-16 h-16 animate-pulse"></div>
              <div className="absolute h-0.5 w-[85%] bg-gradient-to-r from-transparent via-red-500/20 to-transparent top-1/2 -translate-y-1/2"></div>
              <div className="absolute w-0.5 h-[85%] bg-gradient-to-b from-transparent via-red-500/20 to-transparent left-1/2 -translate-x-1/2"></div>

              <div className="z-10 text-center font-mono text-[9px]">
                <div className="text-red-500 uppercase font-bold tracking-wider animate-pulse">LOCK COHERENCY STABLE</div>
                <div className="text-slate-500 mt-1">RECON FLIGHT: HERON_R7 | SECTOR RADAR CORRELATION OK</div>
                <div className="text-slate-400 mt-0.5">LATENCY: 8ms | BANDWIDTH 4.2 Gb/s</div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

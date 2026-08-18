import React from "react";
import { KillChainState } from "../types";
import type { TacticalTrack, TacticalLog } from "../types";
import { CheckSquare, Compass, Database, Eye, FileSearch, GitBranch, ShieldAlert } from "lucide-react";

interface KillChainModuleProps {
  selectedTrack: TacticalTrack | null;
  onAdvanceKillChain: (nextState: KillChainState) => void;
  killChainState: KillChainState;
  onAddLog: (log: Omit<TacticalLog, "id" | "timestamp">) => void;
}

const STAGES: Array<{ key: KillChainState; label: string; description: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: KillChainState.FIND, label: "DISCOVER", description: "Identify relevant information", icon: FileSearch },
  { key: KillChainState.FIX, label: "VALIDATE", description: "Validate source and quality", icon: CheckSquare },
  { key: KillChainState.TRACK, label: "CORRELATE", description: "Connect related information", icon: GitBranch },
  { key: KillChainState.TARGET, label: "PRIORITIZE", description: "Prioritize operational relevance", icon: Database },
  { key: KillChainState.ASSESS, label: "ASSESS", description: "Human assessment and coordination", icon: Eye },
];

function effectiveStage(state: KillChainState): KillChainState {
  return state === KillChainState.ENGAGE ? KillChainState.ASSESS : state;
}

export default function KillChainModule({ selectedTrack, onAdvanceKillChain, killChainState, onAddLog }: KillChainModuleProps) {
  const currentState = effectiveStage(killChainState);
  const currentIndex = Math.max(0, STAGES.findIndex((stage) => stage.key === currentState));

  const advance = (state: KillChainState) => {
    onAdvanceKillChain(state);
    onAddLog({
      source: "STORM FIRE ASSESSMENT",
      type: "INFO",
      message: `Information workflow advanced to ${STAGES.find((stage) => stage.key === state)?.label ?? state}. No autonomous action is initiated by this workflow.`,
    });
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col gap-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">INFORMATION ASSESSMENT WORKFLOW</h2>
            <p className="text-[8px] text-slate-500 font-mono mt-0.5">Discover • Validate • Correlate • Prioritize • Assess</p>
          </div>
        </div>
        <div className="text-[8px] font-mono px-2 py-0.5 rounded uppercase border bg-cyan-950/30 text-cyan-400 border-cyan-900/60">
          {selectedTrack ? `Context: ${selectedTrack.name}` : "No information object selected"}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {STAGES.map((stage, index) => {
          const StageIcon = stage.icon;
          const active = stage.key === currentState;
          const passed = index < currentIndex;
          return (
            <button
              key={stage.key}
              type="button"
              disabled={!selectedTrack}
              onClick={() => advance(stage.key)}
              className={`flex flex-col items-center p-2 rounded border text-center transition-all ${active ? "bg-cyan-950/40 border-cyan-500 text-cyan-400" : passed ? "bg-slate-950 border-emerald-900 text-emerald-500" : "bg-slate-950/40 border-slate-800 text-slate-500 disabled:opacity-40"}`}
            >
              <StageIcon className="h-4 w-4 mb-1" />
              <div className="text-[9px] font-mono font-bold">{stage.label}</div>
              <div className="text-[7px] text-slate-500 font-mono mt-0.5">{stage.description}</div>
            </button>
          );
        })}
      </div>

      {!selectedTrack ? (
        <div className="bg-slate-950/60 border border-dashed border-slate-800 py-8 text-center rounded-md">
          <Compass className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Select an information object to begin assessment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-3 rounded-md border border-slate-800">
            <div className="text-[10px] text-cyan-400 font-mono font-semibold uppercase">Current context</div>
            <div className="mt-2 text-xs text-slate-300 font-mono leading-relaxed">
              <div>Object: <span className="text-white font-semibold">{selectedTrack.name}</span></div>
              <div>Location: <span className="text-cyan-400">{selectedTrack.coordinates}</span></div>
              <div>Status: <span className="text-slate-200">{selectedTrack.status}</span></div>
              <div>Source: <span className="text-emerald-400">{selectedTrack.sensorSource}</span></div>
            </div>
          </div>
          <div className="bg-slate-950 p-3 rounded-md border border-slate-800">
            <div className="text-[10px] text-emerald-400 font-mono font-semibold uppercase">Assessment boundary</div>
            <p className="mt-2 text-xs text-slate-300 font-mono leading-relaxed">
              This workflow supports information validation, correlation, prioritization and human assessment. It does not select weapons, authorize fire, or execute autonomous actions.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { TacticalTrack, CommandSystem } from "../types";
import { projectCopTracks, fetchDynamicCop } from "../platform-client/dynamicCopClient";
import { MapPin, Compass, Target, Activity, AlertTriangle } from "lucide-react";

interface TacticalMapProps {
  // Retained for migration compatibility. Canonical COP data is authoritative.
  tracks: TacticalTrack[];
  onSelectTrack: (track: TacticalTrack | null) => void;
  selectedTrack: TacticalTrack | null;
  activeStrike: { sourceX: number; sourceY: number; targetX: number; targetY: number; stage: string } | null;
  insightMode: "NORMAL" | "DEAD_GROUND" | "TRAFFICABILITY";
  systems?: CommandSystem[];
}

export default function TacticalMap({ onSelectTrack, selectedTrack, insightMode }: TacticalMapProps) {
  const [tracks, setTracks] = useState<TacticalTrack[]>([]);
  const [copStatus, setCopStatus] = useState<"LOADING" | "READY" | "ERROR">("LOADING");
  const [copGeneratedAt, setCopGeneratedAt] = useState<string | null>(null);
  const [hoveredCoord, setHoveredCoord] = useState<{ x: number; y: number; coordinate: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchDynamicCop("operator-command", controller.signal)
      .then((cop) => {
        setTracks(projectCopTracks(cop));
        setCopGeneratedAt(cop.generatedAt);
        setCopStatus("READY");
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setTracks([]);
        setCopStatus("ERROR");
      });

    return () => controller.abort();
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));
    setHoveredCoord({
      x,
      y,
      coordinate: `${(34.00 + (50 - y) / 100).toFixed(4)},${(77.20 + x / 100).toFixed(4)}`,
    });
  };

  const gridCells = 10;

  return (
    <div className="relative flex flex-col bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${copStatus === "READY" ? "bg-emerald-400" : copStatus === "LOADING" ? "bg-amber-400 animate-pulse" : "bg-red-400"}`} />
          <span>STORM FIRE DYNAMIC COP</span>
        </div>
        <div className="flex items-center gap-4">
          <span className={insightMode === "DEAD_GROUND" ? "text-amber-400" : insightMode === "TRAFFICABILITY" ? "text-emerald-400" : "text-cyan-400"}>
            {insightMode}
          </span>
          <span>{copGeneratedAt ? `PROJECTION ${copGeneratedAt}` : "PROJECTION PENDING"}</span>
        </div>
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredCoord(null)}
        className="relative w-full h-[380px] bg-slate-950 cursor-crosshair overflow-hidden select-none"
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,4">
            {Array.from({ length: gridCells }).map((_, index) => {
              const position = `${(index + 1) * (100 / gridCells)}%`;
              return <line key={`x-${index}`} x1={position} y1="0%" x2={position} y2="100%" />;
            })}
            {Array.from({ length: gridCells }).map((_, index) => {
              const position = `${(index + 1) * (100 / gridCells)}%`;
              return <line key={`y-${index}`} x1="0%" y1={position} x2="100%" y2={position} />;
            })}
          </g>

          {insightMode === "DEAD_GROUND" && (
            <g fill="rgba(245,158,11,0.10)" stroke="rgba(245,158,11,0.35)" strokeWidth="1" strokeDasharray="3,3">
              <path d="M 10,40 Q 70,80 130,20 Z" />
              <path d="M 280,130 Q 320,170 380,105 Z" />
              <text x="75" y="45" fill="#f59e0b" fontSize="9">CONTEXTUAL DEAD-GROUND</text>
            </g>
          )}

          {insightMode === "TRAFFICABILITY" && (
            <g>
              <path d="M 30,40 Q 150,180 270,220 T 520,240" fill="none" stroke="rgba(16,185,129,0.55)" strokeWidth="3" strokeDasharray="4,4" />
              <text x="120" y="110" fill="#34d399" fontSize="9">CONTEXTUAL TRAFFICABILITY</text>
            </g>
          )}
        </svg>

        {copStatus === "ERROR" && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/75 z-30">
            <div className="max-w-md text-center p-4 border border-red-900 bg-slate-950 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" />
              <div className="text-xs font-mono font-bold text-red-400 uppercase">Dynamic COP unavailable</div>
              <p className="text-[10px] text-slate-500 mt-2">The map does not fall back to React-owned operational state. Refresh or restore the Storm Fire information service.</p>
            </div>
          </div>
        )}

        {copStatus === "LOADING" && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest animate-pulse">Resolving participant context → policy → Dynamic COP…</div>
          </div>
        )}

        {tracks.map((track) => {
          const selected = selectedTrack?.id === track.id;
          const blue = track.faction === "BLUE";
          const neutral = track.faction === "NEUTRAL";
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => onSelectTrack(track)}
              style={{ left: `${track.x}%`, top: `${track.y}%`, transform: "translate(-50%,-50%)" }}
              className="absolute z-10 p-1 flex flex-col items-center justify-center hover:scale-125 cursor-pointer transition-transform"
              aria-label={`Select ${track.name}`}
            >
              <div className={`relative rounded-full ${selected ? "ring-2 ring-amber-400 p-1" : ""}`}>
                {blue ? (
                  <div className="w-5 h-5 border-2 border-cyan-400 bg-cyan-950/40 rounded-sm" />
                ) : neutral ? (
                  <div className="w-5 h-5 border-2 border-slate-400 bg-slate-900/60 rounded-full" />
                ) : (
                  <div className="w-5 h-5 border-2 border-red-400 bg-red-950/30 rounded-full" />
                )}
                <span className="absolute -top-4 left-5 whitespace-nowrap bg-slate-950/90 border border-slate-800 rounded px-1 text-[7px] text-slate-500 font-mono">
                  {track.sensorSource}
                </span>
              </div>
              <div className="mt-1 bg-slate-950/90 border border-slate-800 px-1 py-0.5 rounded text-[8px] font-mono whitespace-nowrap">
                <span className={blue ? "text-cyan-400" : neutral ? "text-slate-300" : "text-red-400"}>{track.name}</span>
              </div>
            </button>
          );
        })}

        {hoveredCoord && (
          <div className="absolute bottom-3 left-3 bg-slate-950/95 border border-slate-800 px-3 py-1.5 rounded text-[10px] font-mono text-cyan-400 z-20 pointer-events-none shadow-lg flex items-center gap-2">
            <Compass className="h-3.5 w-3.5" />
            <div>
              <div className="text-slate-500 text-[8px]">CURSOR CONTEXT</div>
              <div>{hoveredCoord.coordinate}</div>
            </div>
          </div>
        )}

        <div className="absolute top-3 left-3 bg-slate-950/95 border border-slate-800/80 p-2.5 rounded text-[8px] font-mono text-slate-400 z-20 pointer-events-none shadow-md">
          <div className="font-bold text-slate-300 border-b border-slate-800 pb-1 mb-1 flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-cyan-400" /> AUTHORITATIVE PROJECTION
          </div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 border border-cyan-400 rounded-sm" /> FRIENDLY / BLUE</div>
          <div className="flex items-center gap-1.5 mt-1"><span className="w-3 h-3 border border-red-400 rounded-full" /> HOSTILE / RED</div>
          <div className="flex items-center gap-1.5 mt-1"><span className="w-3 h-3 border border-slate-400 rounded-full" /> UNKNOWN / NEUTRAL</div>
        </div>
      </div>

      <div className="bg-slate-950 border-t border-slate-800 p-3 font-mono text-xs text-slate-300">
        {selectedTrack ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><span className="text-slate-500 block text-[9px]">OBSERVED OBJECT</span><span className="font-bold text-white flex items-center gap-1"><Target className="h-3 w-3 text-cyan-400" />{selectedTrack.name}</span></div>
            <div><span className="text-slate-500 block text-[9px]">SOURCE</span><span>{selectedTrack.sensorSource}</span></div>
            <div><span className="text-slate-500 block text-[9px]">POSITION</span><span className="text-cyan-400">{selectedTrack.coordinates}</span></div>
            <div><span className="text-slate-500 block text-[9px]">FRESHNESS</span><span>{selectedTrack.lastUpdated}</span></div>
          </div>
        ) : (
          <div className="text-slate-500 text-center py-1">SELECT A CANONICAL COP OBJECT FOR ITS PROVENANCE AND OPERATIONAL CONTEXT</div>
        )}
      </div>
    </div>
  );
}

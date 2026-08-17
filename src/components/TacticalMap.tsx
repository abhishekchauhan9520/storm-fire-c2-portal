import React, { useEffect, useMemo, useRef, useState } from "react";
import type { CommandSystem, TacticalTrack } from "../types";
import { Compass, Eye, Target } from "lucide-react";

type CanonicalCopRecord = {
  id: string;
  occurredAt: string;
  informationType: string;
  payload: Record<string, unknown>;
};

type CanonicalCopResponse = {
  data?: {
    participantId: string;
    generatedAt: string;
    information: CanonicalCopRecord[];
  };
  error?: string;
};

interface TacticalMapProps {
  tracks: TacticalTrack[];
  onSelectTrack: (track: TacticalTrack | null) => void;
  selectedTrack: TacticalTrack | null;
  /** Compatibility prop retained while strike-state ownership is removed from the legacy UI. */
  activeStrike?: unknown;
  insightMode: "NORMAL" | "DEAD_GROUND" | "TRAFFICABILITY";
  systems?: CommandSystem[];
  participantId?: string;
}

function valueString(payload: Record<string, unknown>, key: string, fallback = "Unknown"): string {
  const value = payload[key];
  return value === undefined || value === null ? fallback : String(value);
}

function valueNumber(payload: Record<string, unknown>, key: string, fallback: number): number {
  const value = Number(payload[key]);
  return Number.isFinite(value) ? value : fallback;
}

function projectTrack(record: CanonicalCopRecord): TacticalTrack {
  return {
    id: record.id,
    name: valueString(record.payload, "name", record.id),
    faction: "NEUTRAL",
    type: valueString(record.payload, "type", "UNKNOWN") as TacticalTrack["type"],
    x: valueNumber(record.payload, "x", 50),
    y: valueNumber(record.payload, "y", 50),
    status: "ACTIVE",
    speed: valueString(record.payload, "speed", "Not reported"),
    health: 100,
    coordinates: valueString(record.payload, "coordinates", "Not reported"),
    weapons: [],
    sensorSource: valueString(record.payload, "sensorSource", "Canonical Information Fabric"),
    lastUpdated: record.occurredAt,
  };
}

export default function TacticalMap({
  tracks,
  onSelectTrack,
  selectedTrack,
  insightMode,
  systems = [],
  participantId = "operator-command",
}: TacticalMapProps) {
  const [hoveredCoord, setHoveredCoord] = useState<{ x: number; y: number; mgrs: string } | null>(null);
  const [canonicalTracks, setCanonicalTracks] = useState<TacticalTrack[]>([]);
  const [copStatus, setCopStatus] = useState<"LOADING" | "LIVE" | "FALLBACK">("LOADING");
  const [copUpdatedAt, setCopUpdatedAt] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const loadCop = async () => {
      try {
        const response = await fetch(`/api/cop/${encodeURIComponent(participantId)}`);
        const body = (await response.json()) as CanonicalCopResponse;
        if (!response.ok || !body.data) throw new Error(body.error || "Canonical COP unavailable.");
        const nextTracks = body.data.information.filter((record) => record.informationType === "Track").map(projectTrack);
        if (!cancelled) {
          setCanonicalTracks(nextTracks);
          setCopUpdatedAt(body.data.generatedAt);
          setCopStatus("LIVE");
        }
      } catch {
        if (!cancelled) setCopStatus("FALLBACK");
      }
    };

    void loadCop();
    const interval = window.setInterval(loadCop, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [participantId]);

  const displayedTracks = useMemo(() => {
    if (copStatus === "LIVE") return canonicalTracks;
    return tracks;
  }, [canonicalTracks, copStatus, tracks]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));
    const easting = Math.round(50000 + x * 400);
    const northing = Math.round(12000 + y * 450);
    setHoveredCoord({ x, y, mgrs: `43Q LD ${easting} ${northing}` });
  };

  const isAkashteerActive = systems.some((system) => system.acronym === "Akashteer" && system.activeOverlay);
  const isIACCSActive = systems.some((system) => system.acronym === "IACCS" && system.activeOverlay);
  const isLogisticsActive = systems.some((system) => system.branch === "LOGISTICS" && system.activeOverlay);

  return (
    <div className="relative flex flex-col bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>STORM FIRE DYNAMIC COP</span>
        </div>
        <div className="flex items-center gap-3 text-[8px] uppercase">
          <span className={copStatus === "LIVE" ? "text-emerald-400" : copStatus === "LOADING" ? "text-amber-400" : "text-slate-500"}>
            {copStatus === "LIVE" ? "CANONICAL PLATFORM PROJECTION" : copStatus === "LOADING" ? "RESOLVING PARTICIPANT CONTEXT" : "LEGACY COMPATIBILITY VIEW"}
          </span>
          {copUpdatedAt && <span className="text-slate-600">{copUpdatedAt}</span>}
        </div>
      </div>

      <div
        id="tactical-map-canvas"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredCoord(null)}
        className="relative w-full h-[380px] bg-slate-950 cursor-crosshair overflow-hidden select-none"
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,4">
            {Array.from({ length: 10 }).map((_, index) => {
              const x = `${(index + 1) * 10}%`;
              return <line key={`x-${index}`} x1={x} y1="0%" x2={x} y2="100%" />;
            })}
            {Array.from({ length: 10 }).map((_, index) => {
              const y = `${(index + 1) * 10}%`;
              return <line key={`y-${index}`} x1="0%" y1={y} x2="100%" y2={y} />;
            })}
          </g>

          <g stroke="#334155" strokeWidth="0.8" fill="none" opacity="0.35">
            <path d="M0,20 Q80,40 120,0 M0,35 Q90,65 140,0 M0,55 Q110,95 180,0" />
            <path d="M300,120 Q320,160 360,110 M270,140 Q330,190 390,120 M240,165 Q340,230 420,130" />
          </g>

          {(isAkashteerActive || isIACCSActive) && (
            <g>
              <circle cx="35%" cy="55%" r="110" fill="none" stroke="rgba(34,211,238,0.2)" strokeWidth="1.5" strokeDasharray="4,4" />
              <text x="35%" y="27%" className="fill-cyan-400 text-[8px] font-mono font-bold" textAnchor="middle">AIR SITUATION / RADAR SCOPE</text>
            </g>
          )}

          {isLogisticsActive && (
            <g>
              <polyline points="20,290 85,280 180,310 320,340" fill="none" stroke="rgba(236,72,153,0.45)" strokeWidth="2.5" />
              <text x="188" y="306" className="fill-pink-400 text-[8px] font-mono uppercase font-bold">LOGISTICS INFORMATION PATH</text>
            </g>
          )}

          {insightMode === "DEAD_GROUND" && (
            <g fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.4)" strokeWidth="0.8" strokeDasharray="3,3">
              <path d="M10,40 Q70,80 130,20 Z" />
              <path d="M280,130 Q320,170 380,105 Z" />
              <text x="75" y="45" className="fill-amber-400 text-[9px] font-mono">Dead Ground</text>
            </g>
          )}

          {insightMode === "TRAFFICABILITY" && (
            <g>
              <path d="M50,0 Q150,180 250,220 T450,240" fill="none" stroke="rgba(16,185,129,0.6)" strokeWidth="3.5" strokeDasharray="4,4" />
              <text x="110" y="100" className="fill-emerald-400 text-[9px] font-mono uppercase font-bold">Trafficability Assessment</text>
            </g>
          )}
        </svg>

        {displayedTracks.map((track) => {
          const isSelected = selectedTrack?.id === track.id;
          const isBlue = track.faction === "BLUE";
          const isNeutral = track.faction === "NEUTRAL";
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => onSelectTrack(track)}
              style={{ left: `${track.x}%`, top: `${track.y}%`, transform: "translate(-50%, -50%)" }}
              className={`absolute p-1 flex flex-col items-center justify-center hover:scale-125 cursor-pointer z-10 ${isSelected ? "ring-2 ring-yellow-400 rounded-full" : ""}`}
              aria-label={`Select information object ${track.name}`}
            >
              <div className="relative">
                {track.faction === "RED" ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <polygon points="12,2 22,20 2,20" fill="rgba(239,68,68,0.25)" stroke="#ef4444" strokeWidth="2" />
                    <circle cx="12" cy="13" r="2.5" fill="#ef4444" />
                  </svg>
                ) : isBlue ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" fill="rgba(34,211,238,0.25)" stroke="#22d3ee" strokeWidth="2" rx="2" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8" fill="rgba(156,163,175,0.2)" stroke="#9ca3af" strokeWidth="2" />
                    <line x1="12" y1="2" x2="12" y2="22" stroke="#9ca3af" strokeWidth="1" />
                    <line x1="2" y1="12" x2="22" y2="12" stroke="#9ca3af" strokeWidth="1" />
                  </svg>
                )}
                <div className="absolute -top-3 left-6 whitespace-nowrap bg-slate-950/80 px-1 rounded text-[7px] font-mono text-slate-500 border border-slate-800">
                  {track.sensorSource}
                </div>
              </div>
              <div className="mt-1 bg-slate-950/90 text-[8px] font-mono px-1 py-0.5 rounded border border-slate-800/80 leading-none whitespace-nowrap text-slate-300">
                <span className={`mr-1 font-bold ${isBlue ? "text-cyan-400" : isNeutral ? "text-slate-400" : "text-red-400"}`}>
                  {track.faction === "RED" ? "H-" : isBlue ? "F-" : "I-"}
                </span>
                {track.name}
              </div>
            </button>
          );
        })}

        {hoveredCoord && (
          <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded text-[10px] font-mono text-cyan-400 z-20 pointer-events-none shadow-lg">
            <div className="flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-cyan-500" />
              <div><div className="text-slate-500 text-[8px]">GRID COORDINATES</div><div>{hoveredCoord.mgrs}</div></div>
            </div>
          </div>
        )}

        <div className="absolute top-3 left-3 bg-slate-950/95 border border-slate-800/80 p-2.5 rounded text-[8px] font-mono text-slate-400 z-20 pointer-events-none shadow-md flex flex-col gap-1.5">
          <div className="font-bold text-slate-300 border-b border-slate-800 pb-1 mb-1 flex items-center gap-1"><Eye className="h-3 w-3" /> INFORMATION PROJECTION</div>
          <div>OBJECTS: <span className="text-white">{displayedTracks.length}</span></div>
          <div>SOURCE: <span className={copStatus === "LIVE" ? "text-emerald-400" : "text-amber-400"}>{copStatus === "LIVE" ? "CANONICAL" : "COMPATIBILITY"}</span></div>
        </div>
      </div>

      <div className="bg-slate-950 border-t border-slate-800 p-3 font-mono text-xs text-slate-300">
        {selectedTrack ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><span className="text-slate-500 block text-[9px]">INFORMATION OBJECT</span><span className="font-bold text-white uppercase flex items-center gap-1"><Target className="h-3 w-3 text-cyan-400" />{selectedTrack.name}</span></div>
            <div><span className="text-slate-500 block text-[9px]">LOCATION</span><span className="text-cyan-400 font-semibold">{selectedTrack.coordinates}</span></div>
            <div><span className="text-slate-500 block text-[9px]">STATUS / TELEMETRY</span><span>{selectedTrack.status} | {selectedTrack.speed}</span></div>
            <div><span className="text-slate-500 block text-[9px]">PROVENANCE</span><span className="text-emerald-400 text-[10px]">{selectedTrack.sensorSource}</span></div>
          </div>
        ) : (
          <div className="text-slate-500 text-center py-1">SELECT AN INFORMATION OBJECT FROM THE DYNAMIC COP</div>
        )}
      </div>
    </div>
  );
}

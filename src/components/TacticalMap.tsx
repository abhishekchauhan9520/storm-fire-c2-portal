import React, { useState, useRef, useEffect } from "react";
import { TacticalTrack, CommandSystem } from "../types";
import { MapPin, Target, Shield, Compass, Eye, Activity, Sliders, AlertTriangle } from "lucide-react";

interface TacticalMapProps {
  tracks: TacticalTrack[];
  onSelectTrack: (track: TacticalTrack | null) => void;
  selectedTrack: TacticalTrack | null;
  activeStrike: { sourceX: number; sourceY: number; targetX: number; targetY: number; stage: string } | null;
  insightMode: "NORMAL" | "DEAD_GROUND" | "TRAFFICABILITY";
  systems?: CommandSystem[];
}

export default function TacticalMap({
  tracks,
  onSelectTrack,
  selectedTrack,
  activeStrike,
  insightMode,
  systems = [],
}: TacticalMapProps) {
  const [hoveredCoord, setHoveredCoord] = useState<{ x: number; y: number; mgrs: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert client cursor coords to fake MGRS military coordinates
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));

    // Fake MGRS calculation
    const easting = Math.round(50000 + x * 400);
    const northing = Math.round(12000 + y * 450);
    const mgrs = `43Q LD ${easting} ${northing}`;

    setHoveredCoord({ x, y, mgrs });
  };

  const handleMouseLeave = () => {
    setHoveredCoord(null);
  };

  // SVG grid lines spacing
  const gridCells = 10;

  // Track dynamic branch overlays
  const isAkashteerActive = systems.some(s => s.acronym === "Akashteer" && s.activeOverlay);
  const isShaktiActive = systems.some(s => s.acronym === "ACCCS Shakti" && s.activeOverlay);
  const isIACCSActive = systems.some(s => s.acronym === "IACCS" && s.activeOverlay);
  const isNC3IActive = systems.some(s => s.acronym === "NC3I" && s.activeOverlay);
  const isDSAActive = systems.some(s => s.branch === "SPACE_ISR" && s.activeOverlay);
  const isCyberActive = systems.some(s => s.branch === "CYBER_EW" && s.activeOverlay);
  const isCommsActive = systems.some(s => (s.acronym === "ASCON" || s.acronym === "DCN" || s.acronym === "TCS") && s.activeOverlay);
  const isLogisticsActive = systems.some(s => s.branch === "LOGISTICS" && s.activeOverlay);

  return (
    <div className="relative flex flex-col bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>LADAKH SECTOR COP (COMMON OPERATIONAL PICTURE)</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-slate-500">INSIGHT MODE:</span>
            <span className={`font-semibold ${
              insightMode === "DEAD_GROUND" ? "text-amber-400" : insightMode === "TRAFFICABILITY" ? "text-emerald-400" : "text-cyan-400"
            }`}>
              {insightMode}
            </span>
          </div>
          <span>GRID SCALE: 1:50,000</span>
        </div>
      </div>

      {/* Main Map Container */}
      <div
        id="tactical-map-canvas"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-[380px] bg-slate-950 cursor-crosshair overflow-hidden select-none"
      >
        {/* Terrain Background Elements via SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle Grid System */}
          <g stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2, 4">
            {Array.from({ length: gridCells }).map((_, i) => {
              const xPos = `${(i + 1) * (100 / gridCells)}%`;
              return <line key={`x-${i}`} x1={xPos} y1="0%" x2={xPos} y2="100%" />;
            })}
            {Array.from({ length: gridCells }).map((_, i) => {
              const yPos = `${(i + 1) * (100 / gridCells)}%`;
              return <line key={`y-${i}`} x1="0%" y1={yPos} x2="100%" y2={yPos} />;
            })}
          </g>

          {/* Grid Label coordinates */}
          {Array.from({ length: 5 }).map((_, i) => {
            const labelX = (i + 1) * 20;
            return (
              <text
                key={`lbl-x-${i}`}
                x={`${labelX}%`}
                y="98%"
                className="fill-slate-700 text-[9px] font-mono"
                textAnchor="middle"
              >
                {300 + labelX}E
              </text>
            );
          })}
          {Array.from({ length: 5 }).map((_, i) => {
            const labelY = (i + 1) * 20;
            return (
              <text
                key={`lbl-y-${i}`}
                x="1%"
                y={`${labelY}%`}
                className="fill-slate-700 text-[9px] font-mono"
                dominantBaseline="middle"
              >
                {800 - labelY}N
              </text>
            );
          })}

          {/* Contour Lines to simulate high altitude valleys */}
          <g stroke="#334155" strokeWidth="0.8" fill="none" opacity="0.35">
            {/* Mountain Range A - Karakoram Pass */}
            <path d="M 0,20 Q 80,40 120,0 M 0,35 Q 90,65 140,0 M 0,55 Q 110,95 180,0" />
            <text x="50" y="30" className="fill-slate-600 text-[9px] font-mono uppercase tracking-widest">Karakoram Range</text>

            {/* Mountain Range B - Shyok Valley Delta */}
            <path d="M 300,120 Q 320,160 360,110 M 270,140 Q 330,190 390,120 M 240,165 Q 340,230 420,130" />
            <text x="320" y="150" className="fill-slate-600 text-[9px] font-mono uppercase tracking-widest">Shyok Valley</text>

            {/* Mountain Range C - Pangong Tso Lake Ridge */}
            <path d="M 120,380 Q 200,280 340,380 M 150,380 Q 210,310 310,380" />
            <text x="180" y="340" className="fill-slate-600 text-[9px] font-mono uppercase tracking-widest">Pangong Ridge</text>
          </g>

          {/* DYNAMIC BRANCH C2 Overlays integration */}
          {(isAkashteerActive || isIACCSActive) && (
            <g>
              <circle cx="35%" cy="55%" r="110" fill="none" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1.5" strokeDasharray="4, 4" />
              <circle cx="35%" cy="55%" r="110" fill="rgba(34, 211, 238, 0.02)" />
              <circle cx="78%" cy="42%" r="80" fill="none" stroke="rgba(239, 68, 68, 0.15)" strokeWidth="1.2" strokeDasharray="3, 5" />
              <text x="35%" y="27%" className="fill-cyan-400 text-[8px] font-mono font-bold uppercase tracking-wider text-center" textAnchor="middle">📡 AKASHTEER AIR SHIELD CORE</text>
              <text x="78%" y="22%" className="fill-red-400 text-[8px] font-mono font-bold uppercase tracking-wider text-center" textAnchor="middle">IACCS SECTOR RADAR ENVELOPE</text>
            </g>
          )}

          {isShaktiActive && (
            <g>
              <path d="M 22%,65% L 45%,40% A 120,120 0 0,1 62%,45% Z" fill="rgba(234, 179, 8, 0.05)" stroke="rgba(234, 179, 8, 0.35)" strokeWidth="1.2" strokeDasharray="5,3" />
              <text x="38%" y="48%" className="fill-yellow-400 text-[8.5px] font-mono font-bold uppercase tracking-widest">🚀 ACCCS Shakti Fire Sector</text>
            </g>
          )}

          {isNC3IActive && (
            <g>
              <path d="M 40,300 C 130,240 220,320 300,340" fill="none" stroke="rgba(6, 182, 212, 0.6)" strokeWidth="2.5" strokeDasharray="6, 6" />
              <text x="75" y="285" className="fill-cyan-400 text-[8.5px] font-mono font-bold uppercase tracking-widest animate-pulse">⚓ NC3I/IMAC MARITIME Domain Corridor</text>
            </g>
          )}

          {isDSAActive && (
            <g>
              <path d="M 0,20 Q 180,95 450,30" fill="none" stroke="rgba(168, 85, 247, 0.45)" strokeWidth="1.5" strokeDasharray="3, 3" />
              <circle cx="210" cy="51" r="5" fill="#a855f7" className="animate-pulse" />
              <text x="210" y="42" className="fill-purple-400 text-[8px] font-mono font-bold">🛰️ DSA SSA GSAT-7A ORBIT PASS [STABLE LINK]</text>
            </g>
          )}

          {isCommsActive && (
            <g stroke="rgba(16, 185, 129, 0.55)" strokeWidth="1.5">
              <line x1="35%" y1="55%" x2="22%" y2="65%" strokeDasharray="3,3" />
              <line x1="35%" y1="55%" x2="48%" y2="28%" strokeDasharray="3,3" />
              <text x="34%" y="60%" className="fill-emerald-400 text-[8px] font-mono font-bold uppercase" stroke="none">ASCON KEY-TRUNK-1</text>
            </g>
          )}

          {isCyberActive && (
            <g>
              <circle cx="62%" cy="35%" r="65" fill="none" stroke="rgba(239, 68, 68, 0.35)" strokeWidth="1" strokeDasharray="2, 6" className="animate-[spin_12s_linear_infinite]" />
              <circle cx="62%" cy="32%" r="10" fill="none" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="3" className="animate-ping" />
              <text x="62%" y="18%" className="fill-red-400 text-[7.5px] font-mono uppercase text-center" textAnchor="middle">💻 DCA spectrum surveillance shield</text>
            </g>
          )}

          {isLogisticsActive && (
            <g>
              <polyline points="20,290 85,280 180,310 320,340" fill="none" stroke="rgba(236, 72, 153, 0.45)" strokeWidth="2.5" />
              <circle cx="180" cy="310" r="3.5" fill="#ec4899" />
              <text x="188" y="306" className="fill-pink-400 text-[8.5px] font-mono uppercase font-bold">📦 MIL-ERP Logistics Route HQ-LADAKH</text>
            </g>
          )}

          {/* Insight Overlay Layer */}
          {insightMode === "DEAD_GROUND" && (
            <g fill="rgba(245, 158, 11, 0.12)" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="0.8" strokeDasharray="3,3">
              {/* Cover/dead ground areas behind ridges */}
              <path d="M 10,40 Q 70,80 130,20 Z" />
              <path d="M 280,130 Q 320,170 380,105 Z" />
              <path d="M 160,330 Q 210,290 280,330 Z" />
              <text x="75" y="45" className="fill-amber-400 text-[9px] font-mono opacity-80">Dead Ground [A-Cover]</text>
              <text x="210" y="315" className="fill-amber-400 text-[9px] font-mono opacity-80">Dead Ground [B-Cover]</text>
            </g>
          )}

          {insightMode === "TRAFFICABILITY" && (
            <g>
              {/* Recommended high-mobility tracks (Green) */}
              <path
                d="M 50,0 Q 150,180 250,220 T 450,240 h 300"
                fill="none"
                stroke="rgba(16, 185, 129, 0.6)"
                strokeWidth="3.5"
                strokeDasharray="4, 4"
                className="animate-[dash_15s_linear_infinite]"
              />
              <text x="110" y="100" className="fill-emerald-400 text-[9px] font-mono uppercase tracking-widest font-bold">Class-40 Traffic Route (Active)</text>

              {/* Impassable marsh/rock blocks (Red highlighted areas) */}
              <circle cx="280" cy="80" r="30" fill="rgba(239, 68, 68, 0.12)" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="1" />
              <text x="250" y="82" className="fill-red-400 text-[8px] font-mono">BOG / MUD HAZARD</text>

              <polygon points="50,290 90,260 120,300 70,320" fill="rgba(239, 68, 68, 0.12)" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="1" />
              <text x="60" y="285" className="fill-red-400 text-[8px] font-mono">ROCKSLIDE SLOPE</text>
            </g>
          )}

          {/* Active Weapon/Strike Firing Arc & Launch Path */}
          {activeStrike && (
            <g>
              {/* Pulse at Target Location */}
              <circle
                cx={`${activeStrike.targetX}%`}
                cy={`${activeStrike.targetY}%`}
                r="18"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                className="animate-ping"
              />
              <circle
                cx={`${activeStrike.targetX}%`}
                cy={`${activeStrike.targetY}%`}
                r="6"
                fill="#ef4444"
                className="animate-pulse"
              />

              {/* Dynamic tracer missile line */}
              <path
                d={`M ${(activeStrike.sourceX / 100) * 100}%,${(activeStrike.sourceY / 100) * 100}% Q ${((activeStrike.sourceX + activeStrike.targetX) / 2)}%,${(Math.min(activeStrike.sourceY, activeStrike.targetY) - 25)}% ${(activeStrike.targetX / 100) * 100}%,${(activeStrike.targetY / 100) * 100}%`}
                fill="none"
                stroke="#ff4500"
                strokeWidth="2.5"
                strokeDasharray="5, 3"
                className="animate-[dash_2s_linear_infinite]"
              />

              {/* Projectile dot */}
              <circle cx={hoveredCoord ? `${(activeStrike.sourceX + (activeStrike.targetX - activeStrike.sourceX) * 0.5)}%` : "50%"} cy="30%" r="5" fill="#eab308" />

              <text
                x={`${activeStrike.targetX}%`}
                y={`${activeStrike.targetY - 5}%`}
                className="fill-red-400 text-[10px] font-mono font-bold"
                textAnchor="middle"
              >
                STRIKE IMPACT ENVELOPE
              </text>
            </g>
          )}
        </svg>

        {/* Interactive Tactical Marks / Tracks */}
        {tracks.map((track) => {
          const isSelected = selectedTrack?.id === track.id;
          const isBlue = track.faction === "BLUE";
          const isNeutral = track.faction === "NEUTRAL";
          const isDestroyed = track.status === "DESTRUCTED";

          if (isDestroyed) return null;

          return (
            <div
              key={track.id}
              onClick={() => onSelectTrack(track)}
              style={{
                left: `${track.x}%`,
                top: `${track.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              className={`absolute transition-all duration-300 p-1 flex flex-col items-center justify-center hover:scale-125 cursor-pointer z-10 ${
                isSelected ? "ring-2 ring-yellow-400 rounded-full" : ""
              }`}
            >
              {/* Tactical Icon Bracket depending on RED (hostile triangle) / BLUE (friendly square) */}
              <div className="relative">
                {/* Active Tracking Reticle */}
                {isSelected && (
                  <div className="absolute -inset-3 border border-yellow-400 opacity-80 animate-spin" style={{ animationDuration: "12s" }}></div>
                )}

                {/* Tactical Indicator Shapes */}
                {track.faction === "RED" ? (
                  <svg className="w-5 h-5 filter drop-shadow-[0_0_4px_rgba(239,68,68,0.7)]" viewBox="0 0 24 24">
                    <polygon points="12,2 22,20 2,20" fill="rgba(239,68,68,0.25)" stroke="#ef4444" strokeWidth="2" />
                    <circle cx="12" cy="13" r="2.5" fill="#ef4444" />
                  </svg>
                ) : isBlue ? (
                  <svg className="w-5 h-5 filter drop-shadow-[0_0_4px_rgba(34,211,238,0.7)]" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" fill="rgba(34,211,238,0.25)" stroke="#22d3ee" strokeWidth="2" rx="2" />
                    <line x1="3" y1="3" x2="21" y2="21" stroke="#22d3ee" strokeWidth="1" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 filter drop-shadow-[0_0_4px_rgba(156,163,175,0.7)]" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8" fill="rgba(156,163,175,0.2)" stroke="#9ca3af" strokeWidth="2" />
                    <line x1="12" y1="2" x2="12" y2="22" stroke="#9ca3af" strokeWidth="1" />
                    <line x1="2" y1="12" x2="22" y2="12" stroke="#9ca3af" strokeWidth="1" />
                  </svg>
                )}

                {/* Sensor-Source Tag */}
                <div className="absolute -top-3 left-6 whitespace-nowrap bg-slate-950/80 px-1 rounded text-[7px] font-mono text-slate-500 scale-90 border border-slate-800">
                  {track.sensorSource}
                </div>
              </div>

              {/* Track Name */}
              <div className="mt-1 bg-slate-950/90 text-[8px] font-mono px-1 py-0.5 rounded border border-slate-800/80 leading-none whitespace-nowrap text-slate-300">
                <span className={`mr-1 font-bold ${isBlue ? "text-cyan-400" : isNeutral ? "text-slate-400" : "text-red-400"}`}>
                  {track.faction === "RED" ? "H-" : isBlue ? "F-" : "N-"}
                </span>
                {track.name}
              </div>
            </div>
          );
        })}

        {/* Cursor HUD Coordinates overlay */}
        {hoveredCoord && (
          <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded text-[10px] font-mono text-cyan-400 z-20 pointer-events-none shadow-lg">
            <div className="flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-cyan-500 animate-spin" style={{ animationDuration: "6s" }} />
              <div>
                <div className="text-slate-500 text-[8px]">MGRS GRID COORDINATES</div>
                <div>{hoveredCoord.mgrs}</div>
              </div>
            </div>
          </div>
        )}

        {/* Map legend */}
        <div className="absolute top-3 left-3 bg-slate-950/95 border border-slate-800/80 p-2.5 rounded text-[8px] font-mono text-slate-400 z-20 pointer-events-none shadow-md flex flex-col gap-1.5">
          <div className="font-bold text-slate-300 border-b border-slate-800 pb-1 mb-1">LEGEND</div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-cyan-950 border border-cyan-400 rounded-sm"></span>
            <span>BLUE FORCE (FRIENDLY)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-red-950 border border-red-500 transform rotate-45"></span>
            <span>RED FORCE (HOSTILE)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-slate-900 border border-slate-400 rounded-full"></span>
            <span>NEUTRAL / MISC TRACK</span>
          </div>
        </div>
      </div>

      {/* Selected Track Detail HUD Footer */}
      <div className="bg-slate-950 border-t border-slate-800 p-3 font-mono text-xs text-slate-300">
        {selectedTrack ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-500 block text-[9px]">TARGET CODENAME</span>
              <span className="font-bold text-white uppercase flex items-center gap-1">
                <Target className={`h-3 w-3 ${selectedTrack.faction === "RED" ? "text-red-500" : "text-cyan-400"}`} />
                {selectedTrack.name}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">GRID COORDINATES</span>
              <span className="text-cyan-400 font-semibold">{selectedTrack.coordinates}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">SPEED & TELEMETRY</span>
              <span>{selectedTrack.speed} {selectedTrack.altitude ? `| ALT: ${selectedTrack.altitude}` : ""}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">SENSOR RECON SHIELD</span>
              <span className="text-emerald-400 text-[10px] bg-emerald-950/40 border border-emerald-900 px-1 rounded">
                Validated: {selectedTrack.sensorSource}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-slate-500 text-center py-1">
            SELECT ANY TACTICAL TRACK FROM THE COMMON OPERATIONAL PICTURE FOR HUD ANALYTICS
          </div>
        )}
      </div>

      {/* Tailwind keyframes styles trick for dash animations */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -40;
          }
        }
      `}</style>
    </div>
  );
}


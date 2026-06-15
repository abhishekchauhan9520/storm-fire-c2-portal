import React, { useState, useEffect, useRef } from "react";
import { Eye, Shield, RefreshCw, Layers, Layout, Target, Cpu, Camera, Crosshair } from "lucide-react";
import { TacticalLog } from "../types";

interface IntelligenceBrainProps {
  onAddLog: (log: Omit<TacticalLog, "id" | "timestamp">) => void;
  onNominateTarget: (name: string, type: string, coordinates: string) => void;
}

export default function IntelligenceBrain({ onAddLog, onNominateTarget }: IntelligenceBrainProps) {
  const [sensorBand, setSensorBand] = useState<"EO" | "IR" | "SAR">("EO");
  const [zoomLevel, setZoomLevel] = useState<"1X" | "4X" | "16X">("4X");
  const [sarComparisonActive, setSarComparisonActive] = useState(false);
  const [anomalySpotted, setAnomalySpotted] = useState(false);
  const [processingSar, setProcessingSar] = useState(false);
  
  // Drone Canvas animation logic
  const droneCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = droneCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let scanY = 0;
    let targetX = 140;
    let targetY = 110;
    let targetSpeedX = 0.5;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create noise and background colors depending on sensorBand
      if (sensorBand === "EO") {
        // Electro-Optical: Dark green camouflage military ground tones
        ctx.fillStyle = "#1e293b"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Mountain draw
        ctx.fillStyle = "#334155";
        ctx.beginPath();
        ctx.moveTo(0, 160);
        ctx.lineTo(80, 80);
        ctx.lineTo(160, 130);
        ctx.lineTo(240, 50);
        ctx.lineTo(320, 160);
        ctx.fill();
      } else if (sensorBand === "IR") {
        // Infrared: Hot-White/Amber Thermal tones
        ctx.fillStyle = "#0c0a09"; // Charcoal background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Mountain contours (warm gray)
        ctx.strokeStyle = "#292524";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 160);
        ctx.quadraticCurveTo(120, 40, 320, 160);
        ctx.stroke();

        // Hot rocks background dots
        ctx.fillStyle = "#eb5e28";
        ctx.globalAlpha = 0.15;
        ctx.fillRect(40, 90, 10, 10);
        ctx.fillRect(200, 110, 8, 8);
        ctx.globalAlpha = 1.0;
      } else if (sensorBand === "SAR") {
        // SAR: Green technical glowing sweep
        ctx.fillStyle = "#020617"; // Blue-black deep space
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Circular sweep circles
        ctx.strokeStyle = "#064e3b";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(160, 100, 80, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(160, 100, 40, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Scanlines noise
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.height; i += 4) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw active tracked target box sliding across drone screen
      targetX += targetSpeedX;
      if (targetX > canvas.width - 40 || targetX < 40) {
        targetSpeedX = -targetSpeedX;
      }

      // Render Box Target Indicator
      const boxSize = 24;
      ctx.lineWidth = 1.5;
      if (sensorBand === "IR") {
        ctx.strokeStyle = "#f97316"; // Hot amber
        ctx.fillStyle = "rgba(249, 115, 22, 0.3)"; // Hot amber filling
      } else if (sensorBand === "SAR") {
        ctx.strokeStyle = "#22c55e"; // Radar neon green
        ctx.fillStyle = "rgba(34, 197, 94, 0.15)";
      } else {
        ctx.strokeStyle = "#06b6d4"; // Cyan EO lock
        ctx.fillStyle = "rgba(6, 182, 212, 0.1)";
      }

      // Target vehicle rectangle
      ctx.fillRect(targetX - boxSize/2, targetY - boxSize/2, boxSize, boxSize);
      ctx.strokeRect(targetX - boxSize/2, targetY - boxSize/2, boxSize, boxSize);

      // Target Corner Brackets
      ctx.beginPath();
      // Upper Left
      ctx.moveTo(targetX - boxSize/2 - 4, targetY - boxSize/2);
      ctx.lineTo(targetX - boxSize/2 - 4, targetY - boxSize/2 - 4);
      ctx.lineTo(targetX - boxSize/2, targetY - boxSize/2 - 4);
      // Upper Right
      ctx.moveTo(targetX + boxSize/2, targetY - boxSize/2 - 4);
      ctx.lineTo(targetX + boxSize/2 + 4, targetY - boxSize/2 - 4);
      ctx.lineTo(targetX + boxSize/2 + 4, targetY - boxSize/2);
      ctx.stroke();

      // Text status above box
      ctx.fillStyle = sensorBand === "IR" ? "#f97316" : sensorBand === "SAR" ? "#22c55e" : "#06b6d4";
      ctx.font = "8px monospace";
      ctx.fillText("TARGET [T-90 HOSTILE]", targetX - 35, targetY - 18);
      ctx.fillText("CONF: 96% | LOCK", targetX - 35, targetY - 26);

      // Reticle center hairs
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      ctx.strokeStyle = "rgba(255, 0, 0, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy); ctx.lineTo(cx - 10, cy);
      ctx.moveTo(cx + 10, cy); ctx.lineTo(cx + 40, cy);
      ctx.moveTo(cx, cy - 40); ctx.lineTo(cx, cy - 10);
      ctx.moveTo(cx, cy + 10); ctx.lineTo(cx, cy + 40);
      ctx.stroke();

      // Moving scanning horizontal bar
      scanY += 1.5;
      if (scanY > canvas.height) scanY = 0;
      ctx.strokeStyle = "rgba(34, 197, 94, 0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();

      // Telemetry statistics
      ctx.fillStyle = "#22c55e";
      ctx.font = "9px monospace";
      ctx.fillText(`UAV ALT: 18,400 FT | AZIMUTH: 284°`, 8, canvas.height - 18);
      ctx.fillText(`SENSOR: ${sensorBand} | ZOOM: ${zoomLevel}`, 8, canvas.height - 6);
      ctx.fillText(`FPS: 60 | LAT: 12ms`, canvas.width - 110, canvas.height - 6);

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [sensorBand, zoomLevel]);

  const handleProcessSarChange = () => {
    setProcessingSar(true);
    onAddLog({
      source: "SAR DIGITAL LABS",
      type: "INFO",
      message: "Syncing multi-orbit satellite tiles. Measuring changes in high-altitude terrain."
    });

    setTimeout(() => {
      setProcessingSar(false);
      setSarComparisonActive(true);
      setAnomalySpotted(true);
      onAddLog({
        source: "AI MULTI-INT ANALYST",
        type: "WARNING",
        message: "ANOMALY DETECTED: New armored platoon found at Ladakh Valley Delta grid: 43Q LD 58319 14983."
      });
    }, 1800);
  };

  const handleNominateDiscoveredTarget = () => {
    onNominateTarget("Red Heavy Artillery Battery", "ARTILLERY", "43Q LD 58319 14983");
    onAddLog({
      source: "SOVEREIGN C2 CORRELATOR",
      type: "SUCCESS",
      message: "Red Heavy Artillery nominated from SAR Change Detector. Integrated directly into the sensor-to-shooter orchestrator queue."
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-xl select-none flex flex-col gap-4">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-cyan-400" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
            INTELLIGENCE ISR RECON & CHANGE DETECTOR
          </h2>
        </div>
        <span className="text-slate-500 font-mono text-[10px]">INTEGRATED SOVEREIGN RADAR RECON</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left Screen: Live UAV Video Streaming Feed */}
        <div className="flex flex-col gap-2 p-3 bg-slate-950 rounded-md border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 animate-pulse" />
              LIVE STREAM: HERON-UAV #47 FEED
            </span>
            <span className="text-[8px] bg-red-950/60 text-red-500 border border-red-900 font-mono px-1 rounded animate-pulse">
              ● STREAMING TRANSMISSION SECURE
            </span>
          </div>

          <div className="relative aspect-[4/3] bg-black rounded border border-slate-800 overflow-hidden flex items-center justify-center">
            <canvas
              ref={droneCanvasRef}
              width={350}
              height={260}
              className="w-full h-full block"
            />
            
            {/* Compass HUD decoration */}
            <div className="absolute top-2 right-2 border border-green-500/30 text-[8px] font-mono p-1 text-green-500 bg-black/40 scale-90">
              N: 34.1524° | E: 77.5778°
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-2 mt-1 z-10">
            <div>
              <span className="text-[8px] text-slate-500 block font-mono uppercase">SENSOR SPECTRAL BAND</span>
              <div className="grid grid-cols-3 gap-1 mt-1">
                {(["EO", "IR", "SAR"] as const).map((band) => (
                  <button
                    key={band}
                    onClick={() => {
                      setSensorBand(band);
                      onAddLog({
                        source: "UAV INTEGRATION",
                        type: "INFO",
                        message: `Heron-47 video band telemetry updated to ${band === "EO" ? "Optical color spectrum" : band === "IR" ? "Thermal IR radiation sensor" : "Synthetic Aperture Radar scan"}.`
                      });
                    }}
                    className={`text-[9px] font-mono font-bold py-1 rounded border uppercase ${
                      sensorBand === band
                        ? "bg-cyan-950 border-cyan-500 text-cyan-400"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {band}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[8px] text-slate-500 block font-mono uppercase">ZOOM MULTIPLIER</span>
              <div className="grid grid-cols-3 gap-1 mt-1">
                {(["1X", "4X", "16X"] as const).map((zoom) => (
                  <button
                    key={zoom}
                    onClick={() => {
                      setZoomLevel(zoom);
                      onAddLog({
                        source: "OP-LENS SYSTEM",
                        type: "INFO",
                        message: `Optic zoom level matched to ${zoom} on active target tracker.`
                      });
                    }}
                    className={`text-[9px] font-mono py-1 rounded border uppercase ${
                      zoomLevel === zoom
                        ? "bg-cyan-950 border-cyan-500 text-cyan-400 animate-pulse"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {zoom}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Screen: SAR Change Detection Analysis */}
        <div className="flex flex-col gap-2 p-3 bg-slate-950 rounded-md border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-green-400 font-semibold uppercase flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              SAR ORBIT IMAGE COMPARE (CHANGE DETECTION)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            {/* Yesterday Card */}
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-mono text-slate-500 uppercase">ORBIT OVERPASS T-24H</span>
              <div className="aspect-[4/3] bg-slate-900 border border-slate-800 rounded relative overflow-hidden flex flex-col justify-between p-2">
                {/* SVG Mountain Grid A */}
                <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 100 75">
                  <path d="M 0,60 Q 40,20 100,60" fill="none" stroke="#475569" strokeWidth="1.5" />
                  <path d="M 10,70 Q 50,45 90,70" fill="none" stroke="#475569" strokeWidth="1" />
                </svg>
                <span className="text-[8px] font-mono text-slate-500">SECTOR GRID 43Q: CLEAR</span>
              </div>
            </div>

            {/* Today Card */}
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-mono text-red-400 uppercase">ORBIT OVERPASS CURRENT</span>
              <div className="aspect-[4/3] bg-slate-900 border border-slate-800 rounded relative overflow-hidden flex flex-col justify-between p-2">
                {/* SVG Mountain Grid B */}
                <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 100 75">
                  <path d="M 0,60 Q 40,20 100,60" fill="none" stroke="#475569" strokeWidth="1.5" />
                  <path d="M 10,70 Q 50,45 90,70" fill="none" stroke="#475569" strokeWidth="1" />
                </svg>

                {/* Anomaly circle indicators if processed */}
                {sarComparisonActive && (
                  <div className="absolute top-[45%] left-[55%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <span className="absolute animate-ping h-8 w-8 rounded-full bg-red-500/40 border border-red-500"></span>
                    <span className="absolute h-3 w-3 rounded-full bg-red-600 animate-pulse"></span>
                  </div>
                )}
                
                <span className="text-[8px] font-mono text-slate-500">
                  {sarComparisonActive ? "🚨 NEW ANOMALOUS VEHICLE GROUP" : "AWAITING PROCESS COMPARATIVE"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleProcessSarChange}
            disabled={processingSar}
            className={`mt-2 font-mono text-xs py-2 px-3 rounded uppercase font-bold border transition-all flex items-center justify-center gap-1.5 ${
              processingSar
                ? "bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-green-950/60 border-green-800 hover:border-green-600 text-green-400 hover:bg-green-900"
            }`}
          >
            <RefreshCw className={`h-4.5 w-4.5 ${processingSar ? "animate-spin" : ""}`} />
            {processingSar ? "Processing Satellite SAR Waves..." : "PROCESS DIFFERENCE OVERLAYS"}
          </button>

          {/* Show target nominate if spotted */}
          {anomalySpotted && (
            <div className="mt-2 bg-red-950/20 border border-red-900/60 p-2 rounded-md animate-fade-in flex flex-col gap-1">
              <span className="text-[9px] font-mono text-red-400 font-bold uppercase flex items-center gap-1">
                <Target className="h-3 w-3 animate-pulse" />
                SATELLITE INTEL EXPOSURE: NEW RED ARTILLERY UNIT
              </span>
              <p className="text-[9px] font-mono text-slate-400 leading-normal">
                Comparative pixel change confirms 4x heavy tracked weapon platforms deployed in hidden dead-slope. Nominate immediately into tactical queue.
              </p>
              <button
                onClick={handleNominateDiscoveredTarget}
                className="mt-1.5 bg-red-950 hover:bg-red-900 border border-red-700 text-red-400 py-1 px-2 rounded font-mono text-[9px] uppercase font-bold transition-all text-center"
              >
                Nominate Discovered Battery as Kill Target
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

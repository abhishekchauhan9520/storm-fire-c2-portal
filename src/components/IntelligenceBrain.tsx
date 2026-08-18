import React, { useEffect, useRef, useState } from "react";
import { Eye, Layers, RefreshCw, ShieldCheck } from "lucide-react";
import type { TacticalLog } from "../types";

interface IntelligenceBrainProps {
  participantId: string;
  onAddLog: (log: Omit<TacticalLog, "id" | "timestamp">) => void;
}

interface DiscoveryResult {
  name: string;
  type: "ARTILLERY" | "ARMOR" | "INFANTRY" | "AIR";
  coordinates: string;
  confidence: number;
}

export default function IntelligenceBrain({ participantId, onAddLog }: IntelligenceBrainProps) {
  const [sensorBand, setSensorBand] = useState<"EO" | "IR" | "SAR">("EO");
  const [zoomLevel, setZoomLevel] = useState<"1X" | "4X" | "16X">("4X");
  const [processing, setProcessing] = useState(false);
  const [discovery, setDiscovery] = useState<DiscoveryResult | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let scanY = 0;
    let targetX = 140;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = sensorBand === "IR" ? "#0c0a09" : sensorBand === "SAR" ? "#020617" : "#1e293b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = sensorBand === "SAR" ? "#065f46" : "#334155";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      targetX += 0.45;
      if (targetX > canvas.width - 40) targetX = 40;
      const targetY = 112;
      ctx.strokeStyle = sensorBand === "IR" ? "#f97316" : sensorBand === "SAR" ? "#22c55e" : "#06b6d4";
      ctx.strokeRect(targetX - 14, targetY - 14, 28, 28);
      ctx.font = "8px monospace";
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fillText("OBSERVATION CANDIDATE", targetX - 45, targetY - 20);
      ctx.fillText(`CONFIDENCE: ${discovery ? Math.round(discovery.confidence * 100) : 96}%`, targetX - 45, targetY - 30);

      scanY = (scanY + 1.5) % canvas.height;
      ctx.strokeStyle = "rgba(34,197,94,0.18)";
      ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(canvas.width, scanY); ctx.stroke();

      ctx.fillStyle = "#22c55e";
      ctx.fillText(`SENSOR: ${sensorBand} | ZOOM: ${zoomLevel}`, 8, canvas.height - 8);
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [sensorBand, zoomLevel, discovery]);

  const publishDiscovery = async () => {
    const result: DiscoveryResult = {
      name: "Observed Heavy Artillery Candidate",
      type: "ARTILLERY",
      coordinates: "43Q LD 58319 14983",
      confidence: 0.96,
    };

    setProcessing(true);
    onAddLog({ source: "ISR COLLECTION", type: "INFO", message: "Publishing a sensor-derived observation to the canonical Information Fabric." });

    try {
      const now = new Date().toISOString();
      const response = await fetch("/api/objects", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          id: `obs-${Date.now()}`,
          kind: "Observation",
          version: 1,
          timestamp: now,
          sourceParticipantId: participantId,
          domains: ["JOINT", "LAND"],
          classification: "CONTROLLED",
          confidence: result.confidence,
          attributes: {
            name: result.name,
            type: result.type,
            coordinates: result.coordinates,
            sensorBand,
            assessmentState: "UNASSESSED",
          },
        }),
      });
      if (!response.ok) throw new Error(await response.text() || `Observation ingestion failed (${response.status}).`);

      setDiscovery(result);
      onAddLog({ source: "INFORMATION FABRIC", type: "SUCCESS", message: `Observation ${result.name} published with ${(result.confidence * 100).toFixed(0)}% source confidence. It is not an autonomous target nomination.` });
    } catch (error) {
      onAddLog({ source: "INFORMATION FABRIC", type: "WARNING", message: `Observation publication failed: ${error instanceof Error ? error.message : "unknown error"}` });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">ISR INFORMATION COLLECTION</h2>
            <p className="text-[8px] text-slate-500 font-mono uppercase">Observation • provenance • human assessment</p>
          </div>
        </div>
        <span className="text-[8px] font-mono px-2 py-1 rounded border border-emerald-900 bg-emerald-950/20 text-emerald-400 flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" /> NO AUTONOMOUS ACTION
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
          <canvas ref={canvasRef} width={640} height={220} className="w-full h-[220px]" />
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-1">
            {(["EO", "IR", "SAR"] as const).map((band) => (
              <button key={band} type="button" onClick={() => setSensorBand(band)} className={`py-1.5 text-[9px] font-mono border rounded ${sensorBand === band ? "border-cyan-700 bg-cyan-950/30 text-cyan-400" : "border-slate-800 bg-slate-950 text-slate-500"}`}>{band}</button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-1">
            {(["1X", "4X", "16X"] as const).map((zoom) => (
              <button key={zoom} type="button" onClick={() => setZoomLevel(zoom)} className={`py-1.5 text-[9px] font-mono border rounded ${zoomLevel === zoom ? "border-emerald-700 bg-emerald-950/30 text-emerald-400" : "border-slate-800 bg-slate-950 text-slate-500"}`}>{zoom}</button>
            ))}
          </div>

          <button type="button" disabled={processing} onClick={() => void publishDiscovery()} className="py-2 rounded border border-cyan-800 bg-cyan-950/30 text-cyan-400 hover:bg-cyan-900/30 disabled:opacity-50 text-[9px] font-mono font-bold uppercase flex items-center justify-center gap-2">
            <RefreshCw className={`h-3.5 w-3.5 ${processing ? "animate-spin" : ""}`} />
            {processing ? "PUBLISHING OBSERVATION…" : "PUBLISH OBSERVATION"}
          </button>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 font-mono text-[9px] text-slate-400 leading-relaxed">
            <div className="flex items-center gap-1 text-slate-200 font-bold uppercase"><Eye className="h-3 w-3 text-cyan-400" /> Current result</div>
            {discovery ? (
              <div className="mt-2 space-y-1">
                <div>Name: <span className="text-white">{discovery.name}</span></div>
                <div>Type: <span className="text-cyan-400">{discovery.type}</span></div>
                <div>Position: <span className="text-cyan-400">{discovery.coordinates}</span></div>
                <div>Confidence: <span className="text-emerald-400">{Math.round(discovery.confidence * 100)}%</span></div>
                <div>State: <span className="text-amber-400">UNASSESSED</span></div>
              </div>
            ) : (
              <div className="mt-2 text-slate-600">No observation published yet.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

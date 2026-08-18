import React, { useEffect, useMemo, useState } from "react";
import type { Service } from "../types";
import { Activity, Boxes, CheckCircle2, CircleAlert, RefreshCw, Radio, ShieldCheck } from "lucide-react";

interface UnifiedSectorHubProps {
  onAddLog?: (log: { source: string; type: "ALERT" | "INFO" | "SUCCESS" | "WARNING"; message: string }) => void;
}

export default function UnifiedSectorHub({ onAddLog }: UnifiedSectorHubProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [status, setStatus] = useState<"LOADING" | "READY" | "ERROR">("LOADING");

  const loadServices = async () => {
    setStatus("LOADING");
    try {
      const response = await fetch("/api/services");
      if (!response.ok) throw new Error(`Service Fabric returned HTTP ${response.status}.`);
      const payload = await response.json() as Service[];
      setServices(payload);
      setStatus("READY");
      onAddLog?.({ source: "SERVICE FABRIC", type: "SUCCESS", message: `Loaded ${payload.length} canonical service definitions from the authoritative Service Fabric.` });
    } catch (error) {
      setServices([]);
      setStatus("ERROR");
      onAddLog?.({ source: "SERVICE FABRIC", type: "WARNING", message: `Canonical service discovery failed: ${error instanceof Error ? error.message : "unknown error"}` });
    }
  };

  useEffect(() => {
    void loadServices();
  }, []);

  const activeCount = useMemo(() => services.filter((service) => service.status === "ACTIVE").length, [services]);
  const degradedCount = useMemo(() => services.filter((service) => service.status === "DEGRADED").length, [services]);
  const informationTypes = useMemo(() => new Set(services.flatMap((service) => service.informationTypesProduced)), [services]);

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-xl select-none flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-950/60 border border-indigo-500/50 p-2 rounded"><Boxes className="h-5 w-5 text-indigo-400" /></div>
          <div>
            <h2 className="text-sm font-mono font-black uppercase text-white tracking-widest">SERVICE FABRIC CAPABILITY HUB</h2>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">Canonical services, capabilities and information contracts</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[8px] font-mono uppercase">
          <span className={`px-2 py-1 rounded border ${status === "READY" ? "bg-emerald-950/30 border-emerald-900 text-emerald-400" : status === "LOADING" ? "bg-amber-950/30 border-amber-900 text-amber-400" : "bg-red-950/30 border-red-900 text-red-400"}`}>
            {status === "READY" ? "CANONICAL FABRIC READY" : status === "LOADING" ? "RESOLVING FABRIC" : "FABRIC UNAVAILABLE"}
          </span>
          <button type="button" onClick={() => void loadServices()} className="p-1.5 rounded border border-slate-800 bg-slate-950 text-slate-400 hover:text-cyan-400 hover:border-cyan-800">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-slate-950 border border-slate-800 rounded p-2"><div className="text-[8px] text-slate-600 font-mono">REGISTERED SERVICES</div><div className="text-lg text-white font-black font-mono">{services.length}</div></div>
        <div className="bg-slate-950 border border-slate-800 rounded p-2"><div className="text-[8px] text-slate-600 font-mono">ACTIVE</div><div className="text-lg text-emerald-400 font-black font-mono">{activeCount}</div></div>
        <div className="bg-slate-950 border border-slate-800 rounded p-2"><div className="text-[8px] text-slate-600 font-mono">DEGRADED</div><div className="text-lg text-amber-400 font-black font-mono">{degradedCount}</div></div>
        <div className="bg-slate-950 border border-slate-800 rounded p-2"><div className="text-[8px] text-slate-600 font-mono">PRODUCED INFO TYPES</div><div className="text-lg text-cyan-400 font-black font-mono">{informationTypes.size}</div></div>
      </div>

      {status === "ERROR" ? (
        <div className="bg-red-950/15 border border-red-900/70 rounded-lg p-4 flex items-center gap-3 text-sm text-red-300 font-mono">
          <CircleAlert className="h-5 w-5 shrink-0" />
          <div><div className="font-bold uppercase">Canonical Service Fabric unavailable</div><div className="text-[10px] text-red-400/70 mt-1">The frontend does not fall back to the legacy service list.</div></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
          {services.map((service) => (
            <article key={service.id} className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-white font-bold text-xs font-mono uppercase">{service.name}</h3>
                  <div className="text-[8px] text-slate-600 font-mono mt-0.5">{service.id} • v{service.version}</div>
                </div>
                <span className={`px-1.5 py-0.5 rounded border text-[8px] font-mono uppercase ${service.status === "ACTIVE" ? "border-emerald-900 bg-emerald-950/30 text-emerald-400" : service.status === "DEGRADED" ? "border-amber-900 bg-amber-950/30 text-amber-400" : "border-slate-800 bg-slate-900 text-slate-500"}`}>
                  {service.status}
                </span>
              </div>

              <p className="text-[9px] text-slate-400 leading-relaxed min-h-8">{service.description || "No service description published."}</p>

              <div className="grid grid-cols-2 gap-2 text-[8px] font-mono">
                <div className="bg-slate-900 border border-slate-800 rounded p-2">
                  <div className="text-slate-600 mb-1">CAPABILITIES</div>
                  <div className="flex flex-wrap gap-1">{service.capabilities.map((capability) => <span key={capability.id} className="px-1 border border-indigo-900 bg-indigo-950/30 text-indigo-300 rounded">{capability.name}</span>)}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded p-2">
                  <div className="text-slate-600 mb-1">INFORMATION PRODUCED</div>
                  <div className="text-slate-300 leading-relaxed">{service.informationTypesProduced.join(", ") || "None declared"}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[8px] font-mono">
                <span className="flex items-center gap-1 text-slate-600"><ShieldCheck className="h-3 w-3 text-emerald-500" /> Canonical contract</span>
                <span className="flex items-center gap-1 text-slate-600"><Radio className="h-3 w-3 text-cyan-500" /> {service.informationTypesConsumed.length} consumed</span>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="text-[9px] font-mono text-slate-500 flex items-center gap-2 bg-slate-950 p-2 rounded border border-slate-900 uppercase">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Service Fabric is the authoritative service source; this workspace renders its projection.
        <span className="ml-auto flex items-center gap-1"><Activity className="h-3 w-3" /> no legacy service mutation</span>
      </div>
    </section>
  );
}

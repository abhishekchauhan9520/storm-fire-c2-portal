import React, { useEffect, useState } from "react";
import type { Service } from "../contracts/stormFireContracts";
import { fetchLogisticsResources, fetchServices, type LogisticsResource } from "../platform-client/operationsClient";
import { Activity, Boxes, RefreshCw, ShieldCheck, Truck } from "lucide-react";

type LoadState = "LOADING" | "READY" | "ERROR";

interface CommanderDashboardProps {
  currentRole?: string;
}

export default function CommanderDashboard({ currentRole = "COMMANDER" }: CommanderDashboardProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [resources, setResources] = useState<LogisticsResource[]>([]);
  const [status, setStatus] = useState<LoadState>("LOADING");
  const [error, setError] = useState<string | null>(null);

  const loadProjection = async () => {
    setStatus("LOADING");
    setError(null);
    try {
      const [serviceProjection, logisticsProjection] = await Promise.all([
        fetchServices(),
        fetchLogisticsResources(),
      ]);
      setServices(serviceProjection);
      setResources(logisticsProjection);
      setStatus("READY");
    } catch (reason) {
      setStatus("ERROR");
      setError(reason instanceof Error ? reason.message : "Canonical operational projection unavailable.");
    }
  };

  useEffect(() => {
    void loadProjection();
  }, []);

  const activeServices = services.filter((service) => service.status === "ACTIVE");
  const otherServices = services.length - activeServices.length;
  const readyResources = resources.filter((resource) => resource.readiness === "READY").length;
  const constrainedResources = resources.filter((resource) => resource.readiness === "LIMITED" || resource.readiness === "UNAVAILABLE").length;

  return (
    <section className="flex flex-col gap-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">PARTICIPANT OPERATIONAL CONTEXT</div>
            <div className="text-xs text-white font-mono font-bold uppercase">Current role: {currentRole.replaceAll("_", " ")}</div>
          </div>
        </div>
        <div className="text-[8px] text-slate-500 font-mono uppercase">Canonical projections only • no local operational store</div>
      </div>

      {status === "ERROR" ? (
        <div className="bg-red-950/20 border border-red-900 rounded-lg p-4 text-red-300 font-mono text-xs flex items-center justify-between gap-4">
          <div>
            <div className="font-bold uppercase">Operational projection unavailable</div>
            <div className="text-[10px] text-red-400/70 mt-1">{error}</div>
          </div>
          <button type="button" onClick={() => void loadProjection()} className="px-2 py-1 rounded border border-red-800 bg-slate-950 text-red-300 hover:text-white">Retry</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Metric label="REGISTERED SERVICES" value={services.length} icon={Boxes} />
            <Metric label="ACTIVE SERVICES" value={activeServices.length} icon={Activity} />
            <Metric label="READY RESOURCES" value={readyResources} icon={Truck} />
            <Metric label="CONSTRAINED RESOURCES" value={constrainedResources} icon={RefreshCw} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><Boxes className="h-4 w-4 text-indigo-400" />SERVICE FABRIC</span>
                <button type="button" onClick={() => void loadProjection()} className="p-1.5 rounded border border-slate-800 bg-slate-950 text-slate-400 hover:text-cyan-400"><RefreshCw className="h-3 w-3" /></button>
              </div>
              <div className="mt-3 flex flex-col gap-2 max-h-72 overflow-y-auto">
                {services.map((service) => (
                  <div key={service.id} className="bg-slate-950 border border-slate-800 rounded p-2 font-mono">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] text-white font-bold uppercase">{service.name}</div>
                        <div className="text-[8px] text-slate-600">{service.id} • v{service.version}</div>
                      </div>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded border uppercase ${service.status === "ACTIVE" ? "border-emerald-900 text-emerald-400 bg-emerald-950/30" : "border-slate-800 text-slate-500"}`}>{service.status}</span>
                    </div>
                    <div className="text-[8px] text-slate-500 mt-1.5">Produces: {service.informationTypesProduced.join(", ") || "none declared"}</div>
                  </div>
                ))}
              </div>
              <div className="text-[8px] text-slate-600 font-mono mt-2 uppercase">Active: {activeServices.length} • Other lifecycle states: {otherServices}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><Truck className="h-4 w-4 text-emerald-400" />LOGISTICS PROJECTION</span>
                <span className="text-[8px] font-mono text-slate-500 uppercase">Read-only readiness</span>
              </div>
              <div className="mt-3 flex flex-col gap-2 max-h-72 overflow-y-auto">
                {resources.map((resource) => (
                  <div key={resource.id} className="bg-slate-950 border border-slate-800 rounded p-2 font-mono">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] text-white font-bold uppercase">{resource.name}</div>
                        <div className="text-[8px] text-slate-600">{resource.kind}{resource.locationId ? ` • ${resource.locationId}` : ""}</div>
                      </div>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded border uppercase ${resource.readiness === "READY" ? "border-emerald-900 text-emerald-400 bg-emerald-950/30" : resource.readiness === "LIMITED" ? "border-amber-900 text-amber-400 bg-amber-950/30" : "border-slate-800 text-slate-500"}`}>{resource.readiness ?? "UNSPECIFIED"}</span>
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1.5">Quantity: <span className="text-white">{resource.quantity} {resource.unit}</span></div>
                  </div>
                ))}
                {resources.length === 0 && <div className="text-[9px] text-slate-600 text-center py-6 font-mono uppercase">No logistics resources published in the canonical projection.</div>}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="bg-slate-950 border border-slate-900 rounded p-2 text-[9px] font-mono text-slate-600 uppercase flex items-center gap-2"><Activity className="h-3 w-3 text-cyan-500" />This workspace renders Service Fabric and Logistics projections; legacy App-owned nodes/combat-unit state is not used as an authority.</div>
    </section>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
  return <div className="bg-slate-950 border border-slate-800 rounded p-2"><div className="text-[8px] text-slate-600 font-mono flex items-center gap-1"><Icon className="h-3 w-3" />{label}</div><div className="text-lg text-white font-black font-mono mt-1">{value}</div></div>;
}

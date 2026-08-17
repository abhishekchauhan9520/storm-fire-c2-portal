import React, { useMemo, useState } from "react";
import type { StormFireServiceManifest } from "./serviceRegistry";
import { stormFireServiceLifecycle } from "./serviceLifecycle";
import { stormFireServiceDiscovery } from "./serviceDiscovery";
import { stormFireServiceObservability } from "./serviceObservability";

interface Props { services: StormFireServiceManifest[] }

export default function ServiceFabricObservabilityPanel({ services }: Props) {
  const [selected, setSelected] = useState(services[0]?.id ?? "");
  const record = useMemo(() => stormFireServiceLifecycle.get(selected), [selected]);
  const discovery = useMemo(() => stormFireServiceDiscovery.get(selected), [selected]);
  const health = useMemo(() => stormFireServiceObservability.health(selected, record?.state, discovery?.compatibility.compatible ?? false), [selected, record, discovery]);
  const events = useMemo(() => stormFireServiceObservability.list(selected, 50), [selected]);
  const [tick, setTick] = useState(0);
  void tick;

  return (
    <section className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] tracking-widest text-cyan-400">SERVICE FABRIC OBSERVABILITY</div>
          <div className="text-[8px] text-slate-500 mt-1">Lifecycle • Compatibility • Authorization • Adapter • Information • Relationships • Alerts</div>
        </div>
        <button onClick={() => setTick((value) => value + 1)} className="text-[8px] border border-slate-700 px-2 py-1 rounded text-slate-400">REFRESH</button>
      </div>

      <div className="mt-4 flex gap-2 flex-wrap">
        {services.map((service) => (
          <button key={service.id} onClick={() => setSelected(service.id)} className={`px-2 py-1 text-[9px] border rounded ${selected === service.id ? "border-cyan-500 text-cyan-300" : "border-slate-800 text-slate-500"}`}>
            {service.name}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
        <Metric label="STATE" value={health.state ?? "UNKNOWN"} />
        <Metric label="COMPATIBILITY" value={health.compatible ? "PASS" : "FAIL"} />
        <Metric label="EVENTS" value={String(health.eventCount)} />
        <Metric label="LAST EVENT" value={health.lastEventAt ? new Date(health.lastEventAt).toLocaleTimeString() : "—"} />
        <Metric label="HEALTH" value={health.healthy ? "HEALTHY" : "ATTENTION"} />
      </div>

      <div className="mt-4 border border-slate-800 rounded overflow-hidden">
        <div className="px-3 py-2 text-[9px] text-slate-400 border-b border-slate-800">AUDIT STREAM</div>
        <div className="max-h-64 overflow-y-auto">
          {events.length === 0 ? <div className="p-3 text-[8px] text-slate-600">No service audit events recorded.</div> : events.map((event) => (
            <div key={event.id} className="grid grid-cols-[90px_90px_100px_1fr] gap-2 px-3 py-2 border-b border-slate-900 text-[8px]">
              <span className="text-slate-600">{new Date(event.timestamp).toLocaleTimeString()}</span>
              <span className="text-cyan-400">{event.type}</span>
              <span className={event.success ? "text-emerald-400" : "text-red-400"}>{event.success ? "SUCCESS" : "FAILED"}</span>
              <span className="text-slate-400">{event.action}{event.message ? ` — ${event.message}` : ""}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="border border-slate-800 rounded p-2 bg-slate-900"><div className="text-[7px] text-slate-600">{label}</div><div className="mt-1 text-[10px] text-white">{value}</div></div>;
}

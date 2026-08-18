import React, { useMemo, useState } from "react";
import type { StormFireServiceManifest } from "./serviceManifestAdapter";
import { stormFireServiceLifecycle, type ServiceLifecycleState } from "./serviceLifecycle";
import type { ServiceIdentity } from "./servicePolicy";

interface Props { services: StormFireServiceManifest[] }

const order: ServiceLifecycleState[] = ["DISCOVERED", "REGISTERED", "VALIDATED", "AUTHORIZED", "ENABLED", "MONITORED"];

export default function ServiceLifecyclePanel({ services }: Props) {
  const [selected, setSelected] = useState(services[0]?.id ?? "");
  const [, refresh] = useState(0);
  const record = useMemo(() => stormFireServiceLifecycle.get(selected), [selected]);
  const currentIndex = record ? order.indexOf(record.state) : -1;
  const bump = () => refresh((value) => value + 1);

  const discover = () => {
    const service = services.find((item) => item.id === selected);
    if (!service) return;
    if (!stormFireServiceLifecycle.get(selected)) stormFireServiceLifecycle.discover(service);
    bump();
  };

  const advance = () => {
    try {
      const state = stormFireServiceLifecycle.get(selected)?.state;
      if (!state) return discover();
      if (state === "DISCOVERED") stormFireServiceLifecycle.register(selected);
      else if (state === "REGISTERED") stormFireLifecycleValidate(selected);
      else if (state === "VALIDATED") stormFireLifecycleAuthorize(selected);
      else if (state === "AUTHORIZED") stormFireServiceLifecycle.enable(selected);
      else if (state === "ENABLED") stormFireServiceLifecycle.monitor(selected);
      bump();
    } catch (error) { console.warn(error); }
  };

  const quarantine = () => { try { stormFireServiceLifecycle.quarantine(selected); bump(); } catch (error) { console.warn(error); } };
  const disable = () => { try { stormFireServiceLifecycle.disable(selected); bump(); } catch (error) { console.warn(error); } };

  return (
    <section className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono">
      <div className="text-[10px] tracking-widest text-cyan-400">SERVICE LIFECYCLE CONTROL</div>
      <div className="text-[8px] text-slate-500 mt-1">Discover → Register → Validate → Authorize → Enable → Monitor</div>
      <div className="mt-4 flex gap-2 flex-wrap">
        {services.map((service) => (
          <button key={service.id} onClick={() => setSelected(service.id)} className={`px-2 py-1 text-[9px] border rounded ${selected === service.id ? "border-cyan-500 text-cyan-300" : "border-slate-800 text-slate-500"}`}>
            {service.name}
          </button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-2">
        {order.map((state, index) => <div key={state} className={`p-2 border rounded text-[8px] ${index <= currentIndex ? "border-emerald-700 text-emerald-300" : "border-slate-800 text-slate-600"}`}>{index + 1}. {state}</div>)}
      </div>
      <div className="mt-3 text-[9px] text-slate-400">Current state: <b className="text-white">{record?.state ?? "NOT DISCOVERED"}</b></div>
      {record?.reason && <div className="mt-1 text-[8px] text-amber-400">Reason: {record.reason}</div>}
      <div className="mt-3 flex gap-2 flex-wrap">
        <button onClick={discover} className="px-2 py-1 text-[8px] border border-cyan-800 text-cyan-300 rounded">DISCOVER</button>
        <button onClick={advance} className="px-2 py-1 text-[8px] border border-emerald-800 text-emerald-300 rounded">ADVANCE</button>
        <button onClick={quarantine} className="px-2 py-1 text-[8px] border border-amber-800 text-amber-300 rounded">QUARANTINE</button>
        <button onClick={disable} className="px-2 py-1 text-[8px] border border-red-900 text-red-300 rounded">DISABLE</button>
      </div>
    </section>
  );
}

function stormFireLifecycleValidate(serviceId: string) {
  return stormFireServiceLifecycle.validate(serviceId);
}

function stormFireLifecycleAuthorize(serviceId: string) {
  const record = stormFireServiceLifecycle.get(serviceId);
  if (!record) throw new Error(`Service not found: ${serviceId}`);
  const identity: ServiceIdentity = {
    serviceId,
    principal: `service:${serviceId}`,
    roles: ["SERVICE_OPERATOR"],
    trustLevel: "TRUSTED",
    issuedAt: new Date().toISOString(),
  };
  return stormFireServiceLifecycle.authorize(serviceId, identity);
}

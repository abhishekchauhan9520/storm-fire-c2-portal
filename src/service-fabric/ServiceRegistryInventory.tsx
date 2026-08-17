import React, { useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, RefreshCw } from "lucide-react";
import { stormFireServiceRegistryRuntime, type ServiceInventoryEntry } from "./serviceRegistryRuntime";

export default function ServiceRegistryInventory() {
  const [inventory, setInventory] = useState<ServiceInventoryEntry[]>(() => stormFireServiceRegistryRuntime.bootstrap());
  const [selected, setSelected] = useState<string>(inventory[0]?.service.id ?? "");
  const refresh = () => setInventory(stormFireServiceRegistryRuntime.inventory());
  const service = useMemo(() => inventory.find((entry) => entry.service.id === selected), [inventory, selected]);

  return (
    <section className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] tracking-widest text-cyan-400">SERVICE REGISTRY INVENTORY</div>
          <div className="text-[8px] text-slate-500 mt-1">Contract validation • Lifecycle state • Runtime inventory</div>
        </div>
        <button onClick={refresh} className="p-1 border border-slate-800 rounded text-slate-400" title="Refresh inventory"><RefreshCw className="h-3.5 w-3.5" /></button>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="space-y-1">
          {inventory.map((entry) => (
            <button key={entry.service.id} onClick={() => setSelected(entry.service.id)} className={`w-full text-left p-2 border rounded ${selected === entry.service.id ? "border-cyan-600 bg-cyan-950/20" : "border-slate-800"}`}>
              <div className="flex items-center justify-between text-[9px] text-white"><span>{entry.service.name}</span><span className={entry.contractValid ? "text-emerald-400" : "text-red-400"}>{entry.state}</span></div>
              <div className="text-[8px] text-slate-500">{entry.service.version} • {entry.contractValid ? "CONTRACT OK" : "CONTRACT INVALID"}</div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 border border-slate-800 rounded p-3">
          {service ? <>
            <div className="flex items-center gap-2 text-[10px] text-white font-bold">{service.contractValid ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <CircleAlert className="h-4 w-4 text-red-400" />}{service.service.name}</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[8px] text-slate-400">
              <div>Lifecycle: <b className="text-cyan-300">{service.state}</b></div>
              <div>Enabled: <b className="text-white">{String(service.service.enabled)}</b></div>
              <div>Consumes: <b className="text-white">{service.service.consumes.length}</b></div>
              <div>Produces: <b className="text-white">{service.service.produces.length}</b></div>
            </div>
            <div className="mt-3 text-[8px] text-slate-500">Capabilities: {service.service.capabilities.join(" • ")}</div>
            {service.contractErrors.length > 0 && <div className="mt-3 text-[8px] text-red-300">{service.contractErrors.join(" | ")}</div>}
            <div className="mt-3 text-[8px] text-slate-500">Last lifecycle update: {service.updatedAt}</div>
          </> : <div className="text-[9px] text-slate-600">No service selected.</div>}
        </div>
      </div>
    </section>
  );
}

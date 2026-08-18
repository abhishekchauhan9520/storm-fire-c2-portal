import React, { useMemo, useState } from "react";
import { ShieldCheck, Network, Bell, Activity, Lock, Users } from "lucide-react";
import type { StormFireServiceManifest } from "./serviceManifestAdapter";
import { stormFirePolicyEngine, type ServiceIdentity, type ServicePolicy } from "./servicePolicy";
import { stormFireRelationshipEngine } from "./relationshipEngine";
import { parallelAlertFabric, type ParallelAlertPolicy } from "./parallelAlertFabric";

interface Props {
  services: StormFireServiceManifest[];
}

export default function ServiceFabricControlPlane({ services }: Props) {
  const [selected, setSelected] = useState(services[0]?.id ?? "");
  const [audit, setAudit] = useState<string[]>([]);

  const service = useMemo(() => services.find((item) => item.id === selected), [services, selected]);
  const relationships = stormFireRelationshipEngine.query({ participantId: selected, activeOnly: true });
  const policies = parallelAlertFabric.listPolicies().filter((policy: ParallelAlertPolicy) => policy.source === selected);

  const record = (message: string) => setAudit((items) => [`${new Date().toLocaleTimeString()} ${message}`, ...items].slice(0, 20));

  const provisionDemoPolicy = () => {
    if (!service) return;
    const identity: ServiceIdentity = {
      serviceId: service.id,
      principal: `service:${service.id}`,
      roles: ["SERVICE_OPERATOR"],
      trustLevel: "TRUSTED",
      issuedAt: new Date().toISOString(),
    };
    const policy: ServicePolicy = {
      serviceId: service.id,
      allowedActions: service.capabilities as ServicePolicy["allowedActions"],
      allowedKinds: ["TACTICAL_TRACK", "TACTICAL_NODE", "COMMAND_SYSTEM", "SERVICE_EVENT"],
      allowedRecipients: ["COP", "INFORMATION_FABRIC", "SERVICE_FABRIC"],
      allowedAlertPriorities: ["INFO", "WARNING", "CRITICAL"],
    };
    stormFirePolicyEngine.registerPolicy(policy);
    const alertPolicy: ParallelAlertPolicy = {
      id: `policy-${service.id}`,
      source: service.id,
      priority: "WARNING",
      recipients: ["COP", "SERVICE_FABRIC"],
      relationshipAxes: ["VERTICAL", "HORIZONTAL", "DIAGONAL"],
      enabled: true,
    };
    parallelAlertFabric.registerPolicy(alertPolicy);
    record(`Provisioned ${service.id}: ${identity.trustLevel} identity + policy + alert policy`);
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <div className="text-xs text-cyan-400 tracking-widest">SERVICE FABRIC CONTROL PLANE</div>
          <div className="text-[10px] text-slate-500 mt-1">Identity • Policy • Relationships • Parallel Alerts • Audit</div>
        </div>
        <ShieldCheck className="h-5 w-5 text-emerald-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3 space-y-2">
          {services.map((item) => (
            <button key={item.id} onClick={() => setSelected(item.id)} className={`w-full text-left p-2 border rounded ${selected === item.id ? "border-cyan-500 bg-cyan-950/30" : "border-slate-800 bg-slate-950"}`}>
              <div className="text-[10px] font-bold text-white">{item.name}</div>
              <div className="text-[8px] text-slate-500">{item.id} • {item.enabled ? "ENABLED" : "DISABLED"}</div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="border border-slate-800 bg-slate-950 rounded p-3">
            <div className="flex gap-2 items-center text-[10px] text-cyan-400 font-bold"><Lock className="h-3.5 w-3.5" />IDENTITY & POLICY</div>
            <div className="mt-3 text-[9px] text-slate-400">Trust model: <b className="text-emerald-400">POLICY CONTROLLED</b></div>
            <div className="mt-2 text-[9px] text-slate-400">Capabilities: {service?.capabilities.join(" • ") || "—"}</div>
            <button onClick={provisionDemoPolicy} className="mt-3 px-2 py-1 text-[9px] border border-emerald-700 text-emerald-300 rounded">PROVISION POLICY</button>
          </div>

          <div className="border border-slate-800 bg-slate-950 rounded p-3">
            <div className="flex gap-2 items-center text-[10px] text-violet-400 font-bold"><Network className="h-3.5 w-3.5" />RELATIONSHIPS</div>
            <div className="mt-3 text-[9px] text-slate-400">Active relationships: <b className="text-white">{relationships.length}</b></div>
            <div className="mt-2 text-[8px] text-slate-500">{relationships.map((r) => `${r.axis}: ${r.from} → ${r.to}`).join(" | ") || "No active relationships"}</div>
          </div>

          <div className="border border-slate-800 bg-slate-950 rounded p-3">
            <div className="flex gap-2 items-center text-[10px] text-amber-400 font-bold"><Bell className="h-3.5 w-3.5" />PARALLEL ALERT POLICY</div>
            <div className="mt-3 text-[9px] text-slate-400">Policies: <b className="text-white">{policies.length}</b></div>
            <div className="mt-2 text-[8px] text-slate-500">Recipients and relationship expansion are policy controlled.</div>
          </div>

          <div className="border border-slate-800 bg-slate-950 rounded p-3">
            <div className="flex gap-2 items-center text-[10px] text-emerald-400 font-bold"><Activity className="h-3.5 w-3.5" />AUDIT / OPERATIONS</div>
            <div className="mt-2 max-h-24 overflow-y-auto text-[8px] text-slate-500 space-y-1">{audit.map((entry, index) => <div key={`${entry}-${index}`}>{entry}</div>)}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-800 pt-3 flex items-center gap-2 text-[8px] text-slate-500"><Users className="h-3 w-3" />Source/consumer participation remains subject to identity, service capability, relationship, and policy authorization.</div>
    </section>
  );
}

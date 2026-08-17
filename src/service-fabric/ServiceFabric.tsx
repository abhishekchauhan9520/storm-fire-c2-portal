import React, { useMemo, useState } from "react";
import { Blocks, CheckCircle2, ChevronRight, CircleAlert, Network, Radio, Users } from "lucide-react";
import { stormFireEventBus } from "./serviceEventBus";
import { stormFireServices } from "./serviceRegistry";

export default function ServiceFabric() {
  const [selectedId, setSelectedId] = useState(stormFireServices[0].id);
  const [enabled, setEnabled] = useState<Record<string, boolean>>(Object.fromEntries(stormFireServices.map((s) => [s.id, s.enabled])));
  const selected = useMemo(() => stormFireServices.find((s) => s.id === selectedId) ?? stormFireServices[0], [selectedId]);

  const emit = (type: "SERVICE_EVENT" | "ALERT", message: string) => {
    stormFireEventBus.publish({ type, sourceService: selected.name, payload: { message }, recipients: ["information-fabric", "authorized-participants", "activity-log"] });
  };

  const toggle = () => {
    const value = !enabled[selected.id];
    setEnabled((s) => ({ ...s, [selected.id]: value }));
    emit("SERVICE_EVENT", `${selected.name} ${value ? "enabled" : "disabled"} through Service Fabric policy.`);
  };

  return <section className="bg-slate-950 text-slate-100 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
    <div className="px-4 py-3 border-b border-slate-800 bg-slate-900 flex items-center justify-between"><div className="flex items-center gap-2"><Blocks className="h-4 w-4 text-cyan-400"/><div><div className="text-[9px] text-cyan-400 tracking-widest">PLATFORM CAPABILITY</div><h2 className="text-sm font-black tracking-wider">STORM FIRE SERVICE FABRIC</h2></div></div><span className="text-[9px] text-slate-500">DISCOVERY • CONTRACT • POLICY • EVENTS</span></div>
    <div className="p-4 grid grid-cols-1 xl:grid-cols-12 gap-4">
      <div className="xl:col-span-4 space-y-2"><div className="text-[9px] uppercase tracking-widest text-slate-500">Registered Services</div>{stormFireServices.map((s)=><button key={s.id} onClick={()=>setSelectedId(s.id)} className={`w-full text-left p-3 rounded-lg border ${selected.id===s.id?"bg-cyan-950/40 border-cyan-700":"bg-slate-900 border-slate-800"}`}><div className="flex justify-between"><span className="text-xs font-bold">{s.name}</span>{enabled[s.id]?<CheckCircle2 className="h-3.5 w-3.5 text-emerald-400"/>:<CircleAlert className="h-3.5 w-3.5 text-slate-600"/>}</div><div className="text-[9px] text-slate-500">v{s.version} • {s.capabilities.length} contract capabilities</div></button>)}</div>
      <div className="xl:col-span-8 rounded-lg border border-slate-800 bg-slate-900/60 p-4"><div className="flex justify-between gap-3"><div><div className="text-[9px] text-cyan-400 uppercase tracking-widest">Service Contract</div><h3 className="text-lg font-black">{selected.name}</h3><p className="text-xs text-slate-400 mt-1">{selected.description}</p></div><button onClick={toggle} className="h-fit px-3 py-1.5 text-[9px] font-bold uppercase rounded border border-slate-700">{enabled[selected.id]?"Disable":"Enable"}</button></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4"><Tile icon={<Users/>} title="Source + Consumer" value="REQUIRED"/><Tile icon={<Network/>} title="Relationships" value="VERTICAL / HORIZONTAL / DIAGONAL"/><Tile icon={<Radio/>} title="Parallel Alerts" value="SUPPORTED"/></div>
        <div className="grid md:grid-cols-2 gap-3 mt-4"><List title="Consumes" items={selected.consumes}/><List title="Produces" items={selected.produces}/></div>
        <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800"><div className="text-[9px] uppercase tracking-widest text-slate-500 mb-2">Shared Platform Path</div><div className="flex flex-wrap items-center gap-1.5">{["Service Catalog","Identity + Policy","Canonical Model","Information Fabric","Event Spine","Context + Alerts"].map((x,i)=><React.Fragment key={x}><span className="px-2 py-1 rounded border border-slate-700 text-[9px]">{x}</span>{i<5&&<ChevronRight className="h-3 w-3 text-slate-600"/>}</React.Fragment>)}</div></div>
        <button disabled={!enabled[selected.id]} onClick={()=>emit("ALERT",`${selected.name} published an alert to multiple authorized consumers through the Storm Fire Event Spine.`)} className="mt-4 w-full py-2 rounded border border-cyan-800 bg-cyan-950/40 disabled:opacity-40 text-[10px] font-bold tracking-wider">SIMULATE PARALLEL ALERT DISTRIBUTION</button>
      </div>
    </div>
  </section>;
}
function Tile({icon,title,value}:{icon:React.ReactNode;title:string;value:string}){return <div className="p-3 rounded-lg bg-slate-950 border border-slate-800"><div className="flex items-center gap-2 text-slate-400">{React.cloneElement(icon as React.ReactElement,{className:"h-3.5 w-3.5"})}<span className="text-[9px] uppercase">{title}</span></div><div className="text-[9px] font-bold text-emerald-400 mt-2">{value}</div></div>}
function List({title,items}:{title:string;items:string[]}){return <div className="p-3 rounded-lg bg-slate-950 border border-slate-800"><div className="text-[9px] uppercase tracking-widest text-slate-500 mb-2">{title}</div><div className="flex flex-wrap gap-1.5">{items.map(x=><span key={x} className="px-2 py-1 rounded-full border border-slate-700 text-[9px] text-slate-300">{x}</span>)}</div></div>}

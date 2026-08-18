import React, { useEffect, useState } from "react";
import { Activity, Bell, Brain, Database, Menu, Shield, Users, X } from "lucide-react";
import TacticalMap from "./components/TacticalMap";
import KillChainModule from "./components/KillChainModule";
import IntelligenceBrain from "./components/IntelligenceBrain";
import StrixAdvisor from "./components/StrixAdvisor";
import UnifiedSectorHub from "./components/UnifiedSectorHub";
import { fetchPlatformProjection, subscribePlatformProjectionInvalidation, type OperationalAlertProjection, type OperationalEventProjection, type ParticipantContextProjection } from "./platform-client/platformProjectionClient";
import { getStormFireClientParticipantId } from "./platform-client/participantIdentity";
import type { KillChainState, TacticalLog, TacticalTrack } from "./types";

type Workspace = "MONITOR" | "SERVICES" | "ASSESS" | "ISR" | "STRIX";

export default function App() {
  const [workspace, setWorkspace] = useState<Workspace>("MONITOR");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<TacticalTrack | null>(null);
  const [assessmentState, setAssessmentState] = useState<KillChainState>("FIND" as KillChainState);
  const [context, setContext] = useState<ParticipantContextProjection | null>(null);
  const [events, setEvents] = useState<OperationalEventProjection[]>([]);
  const [alerts, setAlerts] = useState<OperationalAlertProjection[]>([]);
  const [contextStatus, setContextStatus] = useState<"LOADING" | "READY" | "ERROR">("LOADING");
  const [notices, setNotices] = useState<TacticalLog[]>([]);
  const participantId = getStormFireClientParticipantId();

  useEffect(() => {
    let disposed = false;
    let refreshController: AbortController | undefined;

    const refreshProjection = async () => {
      refreshController?.abort();
      const controller = new AbortController();
      refreshController = controller;
      if (!disposed) setContextStatus("LOADING");

      try {
        const projection = await fetchPlatformProjection(participantId, controller.signal);
        if (disposed || controller.signal.aborted) return;
        setContext(projection.context);
        setEvents(projection.events);
        setAlerts(projection.alerts);
        setContextStatus("READY");
      } catch (error) {
        if (disposed || controller.signal.aborted) return;
        setContext(null);
        setEvents([]);
        setAlerts([]);
        setContextStatus("ERROR");
      }
    };

    void refreshProjection();
    const unsubscribe = subscribePlatformProjectionInvalidation(participantId, () => {
      void refreshProjection();
    });

    return () => {
      disposed = true;
      refreshController?.abort();
      unsubscribe();
    };
  }, [participantId]);

  const addUiNotice = (notice: Omit<TacticalLog, "id" | "timestamp">) => {
    setNotices((current) => [{ ...notice, id: `${Date.now()}-${Math.random()}`, timestamp: new Date().toISOString() }, ...current].slice(0, 20));
  };

  const navigation: Array<{ id: Workspace; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "MONITOR", label: "Dynamic COP", icon: Activity },
    { id: "SERVICES", label: "Service Fabric", icon: Database },
    { id: "ASSESS", label: "Information Assessment", icon: Shield },
    { id: "ISR", label: "ISR Information Collection", icon: Users },
    { id: "STRIX", label: "STRIX Decision Support", icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="p-2 rounded border border-slate-800 bg-slate-950 text-slate-300 hover:text-cyan-400 hover:border-cyan-800" aria-label="Open Storm Fire workspace menu">{menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
          <div className="bg-red-950 p-2 border border-red-700 rounded"><Shield className="h-5 w-5 text-red-400" /></div>
          <div className="min-w-0"><div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Storm Fire OS</div><h1 className="text-sm font-black font-mono tracking-widest uppercase truncate">Participant-Centric Information Environment</h1></div>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[9px] font-mono uppercase"><span className={`px-2 py-1 rounded border ${contextStatus === "READY" ? "bg-emerald-950/30 border-emerald-900 text-emerald-400" : contextStatus === "LOADING" ? "bg-amber-950/30 border-amber-900 text-amber-400" : "bg-red-950/30 border-red-900 text-red-400"}`}>Participant Context: {contextStatus}</span><span className="px-2 py-1 rounded border border-slate-800 bg-slate-950 text-slate-400">{participantId}</span></div>
      </header>

      {menuOpen && <aside className="fixed inset-y-0 left-0 z-50 w-80 bg-slate-900 border-r border-slate-800 p-4 shadow-2xl pt-20"><div className="text-[9px] text-slate-500 uppercase font-mono tracking-widest mb-3">Workspace projection</div><div className="flex flex-col gap-2">{navigation.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => { setWorkspace(id); setMenuOpen(false); }} className={`flex items-center gap-3 px-3 py-2 rounded border text-left text-xs font-mono uppercase transition-colors ${workspace === id ? "bg-cyan-950/40 border-cyan-800 text-cyan-400" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"}`}><Icon className="h-4 w-4" />{label}</button>)}</div><div className="mt-6 bg-slate-950 border border-slate-800 rounded p-3 text-[9px] font-mono text-slate-500"><div className="text-slate-300 font-bold uppercase mb-2">Authoritative context</div><div>Organizations: {context?.organizationIds.length ?? 0}</div><div>Roles: {context?.roleIds.length ?? 0}</div><div>Services: {context?.serviceIds.length ?? 0}</div><div>Relationships: {context?.informationRelationshipIds.length ?? 0}</div><div>Geographic scopes: {context?.geographicScopeIds.length ?? 0}</div><div>Policies: {context?.policyIds.length ?? 0}</div></div></aside>}

      <main className="flex-1 p-4 space-y-4">
        {workspace === "MONITOR" && <><TacticalMap onSelectTrack={setSelectedTrack} selectedTrack={selectedTrack} insightMode="NORMAL" /><div className="grid grid-cols-1 xl:grid-cols-2 gap-4"><UnifiedSectorHub /><section className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-xl"><div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3"><div className="flex items-center gap-2"><Bell className="h-4 w-4 text-amber-400" /><h2 className="text-xs font-mono font-bold uppercase text-white">Parallel Alert Projection</h2></div><span className="text-[8px] font-mono text-slate-500">{alerts.length} visible</span></div>{alerts.length === 0 ? <div className="text-[10px] font-mono text-slate-600 text-center py-8">No canonical alerts in this participant projection.</div> : <div className="space-y-2 max-h-[300px] overflow-y-auto">{alerts.map((alert) => <div key={alert.id} className="bg-slate-950 border border-slate-800 rounded p-2.5 font-mono text-[9px]"><div className="flex items-center justify-between"><span className="text-slate-300">{alert.id}</span><span className="text-amber-400 uppercase">{alert.severity}</span></div><div className="text-slate-500 mt-1">{alert.state} • updated {alert.updatedAt}</div></div>)}</div>}</section></div></>}
        {workspace === "SERVICES" && <UnifiedSectorHub />}
        {workspace === "ASSESS" && <><TacticalMap onSelectTrack={setSelectedTrack} selectedTrack={selectedTrack} insightMode="NORMAL" /><KillChainModule selectedTrack={selectedTrack} killChainState={assessmentState} onAdvanceKillChain={setAssessmentState} onAddLog={addUiNotice} /></>}
        {workspace === "ISR" && <IntelligenceBrain participantId={participantId} onAddLog={addUiNotice} />}
        {workspace === "STRIX" && <StrixAdvisor participantId={participantId} />}

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4"><div className="bg-slate-900 border border-slate-800 rounded-lg p-4"><div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3"><h2 className="text-xs font-mono font-bold uppercase text-white">Canonical Event Projection</h2><span className="text-[8px] font-mono text-slate-500">{events.length} events</span></div><div className="space-y-1.5 max-h-48 overflow-y-auto">{events.length === 0 ? <div className="text-[10px] text-slate-600 font-mono text-center py-4">No canonical events in the projection.</div> : events.map((event) => <div key={event.id} className="text-[9px] font-mono bg-slate-950 border border-slate-800 rounded px-2 py-1.5"><span className="text-cyan-400">{event.type}</span><span className="text-slate-600 ml-2">{event.occurredAt}</span><span className="text-slate-500 ml-2">{event.participantId}</span></div>)}</div></div><div className="bg-slate-900 border border-slate-800 rounded-lg p-4"><div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3"><h2 className="text-xs font-mono font-bold uppercase text-white">UI Notices</h2><span className="text-[8px] font-mono text-slate-600">Presentation-only</span></div><div className="space-y-1.5 max-h-48 overflow-y-auto">{notices.length === 0 ? <div className="text-[10px] text-slate-600 font-mono text-center py-4">No local UI notices.</div> : notices.map((notice) => <div key={notice.id} className="text-[9px] font-mono bg-slate-950 border border-slate-800 rounded px-2 py-1.5"><span className="text-slate-400">{notice.source}</span><span className="text-slate-600 ml-2">{notice.timestamp}</span><div className="text-slate-300 mt-0.5">{notice.message}</div></div>)}</div></div></section>
      </main>
      <footer className="bg-slate-950 border-t border-slate-900 px-4 py-2 text-[8px] font-mono text-slate-600 text-center uppercase">Storm Fire OS • Canonical information environment • Participant context driven • Dynamic COP projection • Human decision authority</footer>
    </div>
  );
}

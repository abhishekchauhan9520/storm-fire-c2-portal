import React, { useCallback, useEffect, useMemo, useState } from "react";

interface LogisticsResource { id: string; name: string; type: string; status: string; quantity?: number; unit?: string; }
interface LogisticsRequest { id: string; requesterId: string; description: string; priority: string; status: string; createdAt: string; }

export function LogisticsWorkspace() {
  const [resources, setResources] = useState<LogisticsResource[]>([]);
  const [requests, setRequests] = useState<LogisticsRequest[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [resourcesResponse, requestsResponse] = await Promise.all([fetch("/api/logistics/resources"), fetch("/api/logistics/requests")]);
      if (!resourcesResponse.ok || !requestsResponse.ok) throw new Error("Logistics service unavailable.");
      setResources((await resourcesResponse.json()).data ?? []); setRequests((await requestsResponse.json()).data ?? []);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load logistics data."); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const visibleRequests = useMemo(() => filter === "ALL" ? requests : requests.filter(request => request.status === filter), [filter, requests]);
  const openRequests = requests.filter(request => request.status !== "FULFILLED" && request.status !== "CANCELLED").length;
  const availableResources = resources.filter(resource => resource.status === "AVAILABLE" || resource.status === "READY").length;
  return <section aria-label="Logistics workspace" style={{ display: "grid", gap: 16, padding: 20 }}>
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontSize: 12, letterSpacing: 2, opacity: .65 }}>STORM FIRE SERVICE FABRIC</div><h1 style={{ margin: "4px 0", fontSize: 24 }}>Logistics Workspace</h1><div style={{ opacity: .65, fontSize: 13 }}>Participant-scoped sustainment environment</div></div><button onClick={() => void load()} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button></header>
    {error && <div role="alert" style={{ padding: 12, border: "1px solid #8b3a3a", borderRadius: 8 }}>Unable to load logistics data: {error}</div>}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}><article><strong>Open requests</strong><div style={{ fontSize: 28 }}>{openRequests}</div></article><article><strong>Available resources</strong><div style={{ fontSize: 28 }}>{availableResources}</div></article><article><strong>Total requests</strong><div style={{ fontSize: 28 }}>{requests.length}</div></article></div>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}><strong>Requests</strong><select value={filter} onChange={event => setFilter(event.target.value)}><option>ALL</option><option>OPEN</option><option>PRIORITIZED</option><option>IN_PROGRESS</option><option>FULFILLED</option><option>CANCELLED</option></select></div>
    <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th>ID</th><th>Description</th><th>Priority</th><th>Status</th><th>Requester</th></tr></thead><tbody>{visibleRequests.map(request => <tr key={request.id}><td>{request.id}</td><td>{request.description}</td><td>{request.priority}</td><td>{request.status}</td><td>{request.requesterId}</td></tr>)}{visibleRequests.length === 0 && <tr><td colSpan={5}>No requests in this context.</td></tr>}</tbody></table></div>
    <div><h2 style={{ fontSize: 16 }}>Resource picture</h2><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>{resources.map(resource => <article key={resource.id}><strong>{resource.name}</strong><div>{resource.type}</div><div>{resource.quantity ?? "—"} {resource.unit ?? ""}</div><small>{resource.status}</small></article>)}{resources.length === 0 && <div>No resources reported.</div>}</div></div>
  </section>;
}
export default LogisticsWorkspace;

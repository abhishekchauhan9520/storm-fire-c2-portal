import React, { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

interface LogisticsResource { id: string; name: string; kind: string; quantity: number; unit: string; locationId?: string; readiness?: "READY" | "LIMITED" | "UNAVAILABLE"; }
interface LogisticsRequest { id: string; requesterParticipantId: string; resourceId: string; quantity: number; priority: "LOW" | "NORMAL" | "HIGH" | "CRITICAL"; status: "OPEN" | "PRIORITIZED" | "IN_PROGRESS" | "FULFILLED" | "CANCELLED"; createdAt: string; updatedAt: string; }

async function readData<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.error ?? "Logistics service unavailable.");
  return ((await response.json()) as { data: T }).data;
}

export function LogisticsWorkspace() {
  const [resources, setResources] = useState<LogisticsResource[]>([]);
  const [requests, setRequests] = useState<LogisticsRequest[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [resourceId, setResourceId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [priority, setPriority] = useState<LogisticsRequest["priority"]>("NORMAL");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resourcesResponse, requestsResponse] = await Promise.all([
        fetch("/api/logistics/resources", { cache: "no-store" }),
        fetch("/api/logistics/requests", { cache: "no-store" }),
      ]);
      setResources(await readData<LogisticsResource[]>(resourcesResponse));
      setRequests(await readData<LogisticsRequest[]>(requestsResponse));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load logistics data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const visibleRequests = useMemo(
    () => filter === "ALL" ? requests : requests.filter(request => request.status === filter),
    [filter, requests],
  );
  const openRequests = requests.filter(request => !["FULFILLED", "CANCELLED"].includes(request.status)).length;
  const availableResources = resources.filter(resource => resource.readiness === "READY").length;

  const createRequest = async (event: FormEvent) => {
    event.preventDefault();
    if (!resourceId) return;
    setCreating(true);
    setError(null);
    try {
      const response = await fetch("/api/logistics/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `log-${crypto.randomUUID()}`,
          resourceId,
          quantity: Number(quantity),
          priority,
        }),
      });
      await readData<LogisticsRequest>(response);
      setResourceId("");
      setQuantity("1");
      setPriority("NORMAL");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create logistics request.");
    } finally {
      setCreating(false);
    }
  };

  return <section aria-label="Logistics workspace" style={{ display: "grid", gap: 16, padding: 20 }}>
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 12, letterSpacing: 2, opacity: .65 }}>STORM FIRE SERVICE FABRIC</div>
        <h1 style={{ margin: "4px 0", fontSize: 24 }}>Logistics Workspace</h1>
        <div style={{ opacity: .65, fontSize: 13 }}>Authenticated participant sustainment environment</div>
      </div>
      <button onClick={() => void load()} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button>
    </header>

    {error && <div role="alert" style={{ padding: 12, border: "1px solid #8b3a3a", borderRadius: 8 }}>{error}</div>}

    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
      <article><strong>Open requests</strong><div style={{ fontSize: 28 }}>{openRequests}</div></article>
      <article><strong>Ready resources</strong><div style={{ fontSize: 28 }}>{availableResources}</div></article>
      <article><strong>Total requests</strong><div style={{ fontSize: 28 }}>{requests.length}</div></article>
    </div>

    <form onSubmit={createRequest} style={{ display: "grid", gap: 10, padding: 14, border: "1px solid rgba(255,255,255,.1)", borderRadius: 10 }}>
      <strong>Create logistics requirement</strong>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 8 }}>
        <select aria-label="Resource" value={resourceId} onChange={event => setResourceId(event.target.value)} required>
          <option value="">Select resource</option>
          {resources.map(resource => <option key={resource.id} value={resource.id}>{resource.name} · {resource.quantity} {resource.unit}</option>)}
        </select>
        <input aria-label="Quantity" type="number" min="1" value={quantity} onChange={event => setQuantity(event.target.value)} required />
        <select aria-label="Priority" value={priority} onChange={event => setPriority(event.target.value as LogisticsRequest["priority"])}>
          <option>LOW</option><option>NORMAL</option><option>HIGH</option><option>CRITICAL</option>
        </select>
        <button type="submit" disabled={creating || !resourceId}>{creating ? "Submitting…" : "Submit"}</button>
      </div>
    </form>

    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <strong>Requests</strong>
      <select value={filter} onChange={event => setFilter(event.target.value)}>
        <option>ALL</option><option>OPEN</option><option>PRIORITIZED</option><option>IN_PROGRESS</option><option>FULFILLED</option><option>CANCELLED</option>
      </select>
    </div>

    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><th>ID</th><th>Resource</th><th>Quantity</th><th>Priority</th><th>Status</th><th>Requester</th></tr></thead>
        <tbody>
          {visibleRequests.map(request => <tr key={request.id}>
            <td>{request.id}</td><td>{request.resourceId}</td><td>{request.quantity}</td><td>{request.priority}</td><td>{request.status}</td><td>{request.requesterParticipantId}</td>
          </tr>)}
          {visibleRequests.length === 0 && <tr><td colSpan={6}>No requests in this context.</td></tr>}
        </tbody>
      </table>
    </div>

    <div>
      <h2 style={{ fontSize: 16 }}>Resource picture</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
        {resources.map(resource => <article key={resource.id}>
          <strong>{resource.name}</strong>
          <div>{resource.kind}</div>
          <div>{resource.quantity} {resource.unit}</div>
          <small>{resource.readiness ?? "UNKNOWN"}</small>
        </article>)}
        {resources.length === 0 && <div>No resources reported.</div>}
      </div>
    </div>
  </section>;
}

export default LogisticsWorkspace;

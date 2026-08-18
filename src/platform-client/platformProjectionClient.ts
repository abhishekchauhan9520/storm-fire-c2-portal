export interface ParticipantContextProjection {
  participantId: string;
  organizationIds: string[];
  roleIds: string[];
  serviceIds: string[];
  geographicScopeIds: string[];
  informationRelationshipIds: string[];
  subscriptionIds: string[];
  workspaceIds: string[];
  policyIds: string[];
  classification?: string;
  resolvedAt: string;
}

export interface OperationalEventProjection {
  id: string;
  type: string;
  occurredAt: string;
  participantId: string;
}

export interface OperationalAlertProjection {
  id: string;
  severity: string;
  state: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformProjectionSnapshot {
  context: ParticipantContextProjection;
  events: OperationalEventProjection[];
  alerts: OperationalAlertProjection[];
}

async function readJson<T>(response: Response, label: string): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `${label} request failed with HTTP ${response.status}.`);
  }
  return response.json() as Promise<T>;
}

export async function fetchPlatformProjection(
  participantId: string,
  signal?: AbortSignal,
): Promise<PlatformProjectionSnapshot> {
  if (!participantId.trim()) throw new Error("Participant ID is required.");

  const request = { signal, cache: "no-store", headers: { Accept: "application/json" } } as const;
  const [contextResponse, eventsResponse, alertsResponse] = await Promise.all([
    fetch(`/api/participant-context/${encodeURIComponent(participantId)}`, request),
    fetch("/api/events", request),
    fetch("/api/alerts", request),
  ]);

  const contextBody = await readJson<{ data?: ParticipantContextProjection }>(contextResponse, "Participant context");
  const eventsBody = await readJson<OperationalEventProjection[]>(eventsResponse, "Event projection");
  const alertsBody = await readJson<OperationalAlertProjection[]>(alertsResponse, "Alert projection");

  if (!contextBody.data || contextBody.data.participantId !== participantId) {
    throw new Error("Participant context projection is missing or belongs to a different participant.");
  }
  if (!Array.isArray(eventsBody) || !Array.isArray(alertsBody)) {
    throw new Error("Platform projection response shape is invalid.");
  }

  return {
    context: contextBody.data,
    events: eventsBody,
    alerts: alertsBody,
  };
}

export function subscribePlatformProjectionInvalidation(
  participantId: string,
  onInvalidate: () => void,
  onError?: (error: Event) => void,
): () => void {
  if (!participantId.trim()) throw new Error("Participant ID is required.");
  const source = new EventSource(`/api/events/stream?participantId=${encodeURIComponent(participantId)}`);
  source.addEventListener("cop.invalidate", onInvalidate);
  if (onError) source.addEventListener("error", onError);
  return () => {
    source.removeEventListener("cop.invalidate", onInvalidate);
    if (onError) source.removeEventListener("error", onError);
    source.close();
  };
}

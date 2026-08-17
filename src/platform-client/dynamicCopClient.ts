import type { TacticalTrack } from "../types";

export interface DynamicCopInformation<T = unknown> {
  id: string;
  occurredAt: string;
  informationType: string;
  organizationId: string;
  producerParticipantId?: string;
  geographicScopeId?: string;
  informationPoint?: { latitude: number; longitude: number };
  relationshipId?: string;
  classification?: string;
  payload: T;
}

export interface DynamicCopResponse<T = unknown> {
  participantId: string;
  organizationIds: string[];
  roleIds: string[];
  organizationId: string;
  roleId: string;
  geographicScopeIds: string[];
  serviceIds: string[];
  information: DynamicCopInformation<T>[];
  generatedAt: string;
}

export async function fetchDynamicCop(participantId: string, signal?: AbortSignal): Promise<DynamicCopResponse> {
  const response = await fetch(`/api/cop/${encodeURIComponent(participantId)}`, { signal });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Dynamic COP request failed with HTTP ${response.status}.`);
  }
  const body = await response.json() as { data?: DynamicCopResponse };
  if (!body.data) throw new Error("Dynamic COP response did not contain data.");
  return body.data;
}

function isFaction(value: unknown): value is TacticalTrack["faction"] {
  return value === "BLUE" || value === "RED" || value === "NEUTRAL";
}

function isTrackType(value: unknown): value is TacticalTrack["type"] {
  return value === "INFANTRY" || value === "ARMOR" || value === "ARTILLERY" || value === "AIR" || value === "SATELLITE" || value === "AIR_DEFENSE" || value === "NAVAL" || value === "CYBER_ANOMALY" || value === "COMMS_HUB";
}

function numberOrUndefined(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/** Convert authoritative COP information into a presentation-only map projection. */
export function projectCopTracks(cop: DynamicCopResponse): TacticalTrack[] {
  return cop.information
    .filter((item) => item.informationType === "Track")
    .map((item): TacticalTrack | undefined => {
      const payload = item.payload as Record<string, unknown>;
      const x = numberOrUndefined(payload.x);
      const y = numberOrUndefined(payload.y);
      if (x === undefined || y === undefined) return undefined;

      const faction = isFaction(payload.faction) ? payload.faction : "NEUTRAL";
      const type = isTrackType(payload.type) ? payload.type : "AIR";
      const name = typeof payload.name === "string" && payload.name.trim() ? payload.name : item.id;
      const speed = typeof payload.speed === "string" ? payload.speed : "UNKNOWN";
      const coordinates = typeof payload.coordinates === "string"
        ? payload.coordinates
        : item.informationPoint
          ? `${item.informationPoint.latitude.toFixed(5)},${item.informationPoint.longitude.toFixed(5)}`
          : "UNSPECIFIED";
      const status = payload.status === "RETREAT" || payload.status === "ENGAGED" || payload.status === "DESTRUCTED"
        ? payload.status
        : "ACTIVE";
      const health = numberOrUndefined(payload.health) ?? 100;

      return {
        id: item.id,
        name,
        faction,
        type,
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
        status,
        speed,
        health: Math.max(0, Math.min(100, health)),
        coordinates,
        lastUpdated: item.occurredAt,
        sensorSource: typeof payload.sensorSource === "string" ? payload.sensorSource : item.producerParticipantId ?? "UNKNOWN SOURCE",
      };
    })
    .filter((track): track is TacticalTrack => Boolean(track));
}

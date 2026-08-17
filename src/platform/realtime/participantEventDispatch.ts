import type { Event } from "../../contracts/stormFireContracts";
import { stormFireAuthorization } from "../../domain/authorizationPolicy";
import { resolveParticipantOperationalContext } from "../../domain/participantOperationalContext";
import { stormFireInformationRelationships } from "../../domain/informationRelationshipEngine";
import { stormFireParticipantEventStream } from "./participantEventStream";

const informationTypeForEvent = (eventType: string): string | null => {
  if (eventType.startsWith("LogisticsRequest")) return "LogisticsRequest";
  if (eventType === "LogisticsResourceRegistered") return "ResourceStatus";
  return null;
};

const sourceParticipantForEvent = (event: Event<unknown>): string | null => {
  const producer = event.metadata.producer;
  if (producer && producer !== "logistics-service" && producer !== "logistics") return producer;
  const payload = event.payload as { requesterParticipantId?: unknown } | null;
  return typeof payload?.requesterParticipantId === "string" ? payload.requesterParticipantId : null;
};

/**
 * Converts canonical Event Spine lifecycle events into participant-scoped
 * realtime delivery. Relationship paths establish possible recipients; the
 * canonical authorization engine then decides whether each recipient may
 * receive the information in its current participant context.
 */
export function dispatchParticipantEvent(event: Event<unknown>): string[] {
  const informationType = informationTypeForEvent(event.metadata.eventType);
  const sourceParticipantId = sourceParticipantForEvent(event);
  if (!informationType || !sourceParticipantId) return [];

  const candidates = new Set<string>([sourceParticipantId]);
  for (const path of stormFireInformationRelationships.pathsFrom(sourceParticipantId, informationType)) {
    const recipient = path.participantIds[path.participantIds.length - 1];
    if (recipient) candidates.add(recipient);
  }

  const recipients: string[] = [];
  for (const participantId of candidates) {
    try {
      const context = resolveParticipantOperationalContext(participantId);
      const decision = stormFireAuthorization.decide({
        requestId: `realtime:${event.metadata.eventId}:${participantId}`,
        participantId,
        informationType,
        serviceId: "logistics",
        organizationIds: context.organizationIds,
        roleIds: context.roleIds,
        relationshipIds: context.relationshipIds,
        geographicScopeIds: context.geographicScopeIds,
        classification: event.metadata.classification,
      });
      if (!decision.allowed) continue;
      recipients.push(participantId);
      stormFireParticipantEventStream.publish({
        type: event.metadata.eventType,
        eventId: event.metadata.eventId,
        participantId,
        correlationId: event.metadata.correlationId,
        payload: event.payload,
      });
    } catch {
      // A stale/unknown participant cannot receive a realtime projection.
    }
  }

  return recipients;
}

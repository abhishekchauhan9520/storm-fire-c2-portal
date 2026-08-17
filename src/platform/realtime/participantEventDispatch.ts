import type { Event } from "../../contracts/stormFireContracts";
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
 * realtime delivery. Relationship paths are evaluated from the producer so
 * the same event can be delivered to many authorized participant contexts in
 * parallel without creating another operational state store.
 */
export function dispatchParticipantEvent(event: Event<unknown>): string[] {
  const informationType = informationTypeForEvent(event.metadata.eventType);
  const sourceParticipantId = sourceParticipantForEvent(event);
  if (!informationType || !sourceParticipantId) return [];

  const recipients = new Set<string>([sourceParticipantId]);
  for (const path of stormFireInformationRelationships.pathsFrom(sourceParticipantId, informationType)) {
    const recipient = path.participantIds[path.participantIds.length - 1];
    if (recipient) recipients.add(recipient);
  }

  for (const participantId of recipients) {
    stormFireParticipantEventStream.publish({
      type: event.metadata.eventType,
      eventId: event.metadata.eventId,
      participantId,
      correlationId: event.metadata.correlationId,
      payload: event.payload,
    });
  }

  return [...recipients];
}

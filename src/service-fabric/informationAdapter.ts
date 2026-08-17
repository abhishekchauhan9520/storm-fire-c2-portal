import type { CommandSystem, TacticalNode, TacticalTrack } from "../types";
import { stormFireEventBus, type StormFireEvent } from "./serviceEventBus";

export type CanonicalInformationKind = "TRACK" | "NODE" | "COMMAND_SYSTEM" | "SERVICE_EVENT";

export interface CanonicalInformationRecord<T = unknown> {
  id: string;
  kind: CanonicalInformationKind;
  source: string;
  observedAt: string;
  payload: T;
  relationships: Array<{ targetId: string; relation: string }>;
}

export function trackToCanonical(track: TacticalTrack): CanonicalInformationRecord<TacticalTrack> {
  return {
    id: track.id,
    kind: "TRACK",
    source: track.sensorSource,
    observedAt: track.lastUpdated,
    payload: track,
    relationships: [],
  };
}

export function nodeToCanonical(node: TacticalNode): CanonicalInformationRecord<TacticalNode> {
  return {
    id: node.id,
    kind: "NODE",
    source: "Storm Fire Node Registry",
    observedAt: new Date().toISOString(),
    payload: node,
    relationships: [],
  };
}

export function commandSystemToCanonical(system: CommandSystem): CanonicalInformationRecord<CommandSystem> {
  return {
    id: system.id,
    kind: "COMMAND_SYSTEM",
    source: system.acronym,
    observedAt: new Date().toISOString(),
    payload: system,
    relationships: [],
  };
}

/**
 * Converts a Service Fabric event into the same canonical information boundary.
 * This keeps services from creating their own incompatible operational object model.
 */
export function serviceEventToCanonical(event: StormFireEvent): CanonicalInformationRecord {
  return {
    id: event.id,
    kind: "SERVICE_EVENT",
    source: event.sourceService,
    observedAt: event.timestamp,
    payload: event,
    relationships: event.recipients.map((recipient) => ({
      targetId: recipient,
      relation: "AUTHORIZED_CONSUMER",
    })),
  };
}

export function publishCanonicalServiceEvent(
  sourceService: string,
  message: string,
  recipients: string[]
): CanonicalInformationRecord {
  const event = stormFireEventBus.publish({
    type: "SERVICE_EVENT",
    sourceService,
    payload: { message },
    recipients,
  });

  return serviceEventToCanonical(event);
}

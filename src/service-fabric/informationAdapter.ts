import type { InformationObject } from "../contracts/stormFireContracts";
import type { CommandSystem, TacticalNode, TacticalTrack } from "../types";
import { stormFireEventBus, type StormFireEvent } from "./serviceEventBus";

export type CanonicalInformationKind = "TRACK" | "NODE" | "COMMAND_SYSTEM" | "SERVICE_EVENT" | "OBSERVATION" | "ASSESSMENT" | "REQUIREMENT" | "RESOURCE" | "ALERT";
export type InformationConfidence = "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH";
export type InformationClassification = "UNCLASSIFIED" | "RESTRICTED" | "CONTROLLED";

export interface InformationProvenance {
  sourceId: string;
  sourceType?: string;
  observedAt: string;
  ingestedAt: string;
  confidence: InformationConfidence;
  classification: InformationClassification;
  lineage: string[];
}

export interface CanonicalInformationRecord<T = unknown> {
  id: string;
  kind: CanonicalInformationKind;
  source: string;
  observedAt: string;
  payload: T;
  relationships: Array<{ targetId: string; relation: string }>;
  provenance: InformationProvenance;
  version: number;
  expiresAt?: string;
}

const provenance = (sourceId: string, observedAt: string, overrides: Partial<InformationProvenance> = {}): InformationProvenance => ({
  sourceId,
  observedAt,
  ingestedAt: new Date().toISOString(),
  confidence: "UNKNOWN",
  classification: "UNCLASSIFIED",
  lineage: [sourceId],
  ...overrides,
});

export function trackToCanonical(track: TacticalTrack): CanonicalInformationRecord<TacticalTrack> {
  return {
    id: track.id, kind: "TRACK", source: track.sensorSource, observedAt: track.lastUpdated,
    payload: track, relationships: [], version: 1,
    provenance: provenance(track.sensorSource, track.lastUpdated),
  };
}

export function nodeToCanonical(node: TacticalNode): CanonicalInformationRecord<TacticalNode> {
  const observedAt = new Date().toISOString();
  return {
    id: node.id, kind: "NODE", source: "Storm Fire Node Registry", observedAt,
    payload: node, relationships: [], version: 1,
    provenance: provenance("Storm Fire Node Registry", observedAt),
  };
}

export function commandSystemToCanonical(system: CommandSystem): CanonicalInformationRecord<CommandSystem> {
  const observedAt = new Date().toISOString();
  return {
    id: system.id, kind: "COMMAND_SYSTEM", source: system.acronym, observedAt,
    payload: system, relationships: [], version: 1,
    provenance: provenance(system.acronym, observedAt),
  };
}

export function serviceEventToCanonical(event: StormFireEvent): CanonicalInformationRecord {
  return {
    id: event.id, kind: event.type === "ALERT" ? "ALERT" : "SERVICE_EVENT", source: event.sourceService,
    observedAt: event.timestamp, payload: event,
    relationships: event.recipients.map((recipient) => ({ targetId: recipient, relation: "AUTHORIZED_CONSUMER" })),
    version: 1,
    provenance: provenance(event.sourceService, event.timestamp),
  };
}

export function canonicalEnvelopeToRecord(envelope: InformationObject): CanonicalInformationRecord {
  const kind = envelope.type as CanonicalInformationKind;
  return {
    id: envelope.id,
    kind,
    source: envelope.producerServiceId ?? envelope.provenance.sourceId,
    observedAt: envelope.occurredAt,
    payload: envelope.payload,
    relationships: (envelope.tags ?? [])
      .filter((tag) => tag.startsWith("rel:"))
      .map((tag) => {
        const [, targetId, ...relationParts] = tag.split(":");
        return { targetId, relation: relationParts.join(":") || "RELATED" };
      }),
    provenance: {
      sourceId: envelope.provenance.sourceId,
      observedAt: envelope.provenance.observedAt,
      ingestedAt: envelope.provenance.receivedAt,
      confidence: envelope.provenance.quality ?? "UNKNOWN",
      classification: envelope.classification === "CONTROLLED" ? "CONTROLLED" : envelope.classification === "RESTRICTED" ? "RESTRICTED" : "UNCLASSIFIED",
      lineage: [...(envelope.provenance.lineageIds ?? [envelope.provenance.sourceId])],
    },
    version: envelope.version,
  };
}

export function publishCanonicalServiceEvent(sourceService: string, message: string, recipients: string[]): CanonicalInformationRecord {
  const event = stormFireEventBus.publish({ type: "SERVICE_EVENT", sourceService, payload: { message }, recipients });
  return serviceEventToCanonical(event);
}

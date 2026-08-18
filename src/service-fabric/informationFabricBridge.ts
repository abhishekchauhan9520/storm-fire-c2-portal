import type { CommandSystem, TacticalNode, TacticalTrack } from "../types";
import { commandSystemToCanonical, nodeToCanonical, serviceEventToCanonical, trackToCanonical, type CanonicalInformationKind, type CanonicalInformationRecord } from "./informationAdapter";
import { stormFireEventBus, type StormFireEvent } from "./serviceEventBus";
import { stormFireRelationshipFabric } from "./relationshipFabric";
import { stormFireParticipants } from "./participantModel";
import { stormFireInformationPersistence } from "./informationPersistence";
import { stormFireInformationFabric as canonicalInformationFabric } from "../domain/informationFabric";
import type { InformationClassification, InformationObject } from "../contracts/stormFireContracts";

export type { CanonicalInformationRecord } from "./informationAdapter";
export type InformationListener = (records: CanonicalInformationRecord[]) => void;
export type InformationDeliveryListener = (record: CanonicalInformationRecord) => void;
export type DeliveryStatus = "DELIVERED" | "ACKNOWLEDGED" | "EXPIRED";
export interface InformationQuery { kind?: CanonicalInformationRecord["kind"]; source?: string; consumerId?: string; includeStale?: boolean; }
export interface InformationDeliveryRecord { id: string; informationId: string; version: number; participantId: string; deliveredAt: string; acknowledgedAt?: string; status: DeliveryStatus; }

interface InformationSubscription { participantId: string; informationTypes: Set<string>; unsubscribe: () => void; }

function mapClassification(classification: CanonicalInformationRecord["provenance"]["classification"]): InformationClassification {
  if (classification === "CONTROLLED") return "CONTROLLED";
  if (classification === "RESTRICTED") return "RESTRICTED";
  return "PUBLIC";
}

function toCanonicalEnvelope(record: CanonicalInformationRecord): InformationObject {
  const kind = record.kind === "SERVICE_EVENT" || record.kind === "ALERT" ? "EVENT" : "OBJECT";
  const envelope: InformationObject = {
    id: record.id,
    kind,
    type: record.kind,
    schemaVersion: 1,
    version: Math.max(1, record.version),
    occurredAt: record.observedAt,
    producerServiceId: record.source,
    producerParticipantId: undefined,
    classification: mapClassification(record.provenance.classification),
    geographicScopeIds: [],
    provenance: {
      sourceId: record.provenance.sourceId,
      producerId: record.provenance.sourceId,
      observedAt: record.provenance.observedAt,
      receivedAt: record.provenance.ingestedAt,
      confidence: undefined,
      quality: record.provenance.confidence,
      lineageIds: [...record.provenance.lineage],
    },
    payload: record.payload,
    tags: record.relationships.flatMap((relationship) => [`rel:${relationship.targetId}:${relationship.relation}`]),
  };
  return envelope;
}

function fromCanonicalEnvelope(envelope: InformationObject): CanonicalInformationRecord {
  const relationships = (envelope.tags ?? [])
    .filter((tag) => tag.startsWith("rel:"))
    .map((tag) => {
      const [, targetId, ...relationParts] = tag.split(":");
      return { targetId, relation: relationParts.join(":") || "RELATED" };
    });

  const kind = envelope.type as CanonicalInformationKind;
  return {
    id: envelope.id,
    kind,
    source: envelope.producerServiceId ?? envelope.provenance.sourceId,
    observedAt: envelope.occurredAt,
    payload: envelope.payload,
    relationships,
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

/**
 * Transitional compatibility facade. The canonical Information Fabric owns
 * operational information state; this layer only translates legacy callers
 * and records delivery metadata needed by the existing service/workspace APIs.
 */
class InformationFabricBridge {
  private listeners = new Set<InformationListener>();
  private subscriptions = new Map<string, InformationSubscription>();
  private deliveries = new Map<string, InformationDeliveryRecord>();

  constructor() {
    canonicalInformationFabric.subscribe({
      id: "service-fabric-bridge-listener",
      participantId: "system",
      informationTypes: ["*"],
      enabled: true,
      handler: (message) => this.handleCanonicalMessage(message),
    });
  }

  subscribe(listener: InformationListener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  subscribeParticipant(participantId: string, informationTypes: string[], listener: InformationDeliveryListener): () => void {
    if (!stormFireParticipants.get(participantId)) throw new Error(`Participant ${participantId} is not registered.`);
    if (!informationTypes.length) throw new Error("Information subscription requires at least one information type.");
    this.unsubscribeParticipant(participantId);

    const subscriptionId = `legacy-${participantId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    canonicalInformationFabric.subscribe({
      id: subscriptionId,
      participantId,
      informationTypes: [...informationTypes],
      enabled: true,
      handler: (message) => {
        const record = fromCanonicalEnvelope(message);
        if (!this.isAuthorizedConsumer(record, participantId) || this.isStale(record)) return;
        const delivery = this.createDelivery(record, participantId);
        if (delivery) listener(record);
      },
    });
    const unsubscribe = () => canonicalInformationFabric.unsubscribe(subscriptionId);
    this.subscriptions.set(participantId, { participantId, informationTypes: new Set(informationTypes), unsubscribe });
    return () => this.unsubscribeParticipant(participantId);
  }

  private unsubscribeParticipant(participantId: string): void {
    const subscription = this.subscriptions.get(participantId);
    if (!subscription) return;
    subscription.unsubscribe();
    this.subscriptions.delete(participantId);
  }

  snapshot(): CanonicalInformationRecord[] {
    return canonicalInformationFabric.historyFor().map(fromCanonicalEnvelope).sort((a, b) => b.observedAt.localeCompare(a.observedAt));
  }

  query(query: InformationQuery = {}): CanonicalInformationRecord[] {
    return this.snapshot().filter((record) =>
      (!query.kind || record.kind === query.kind) &&
      (!query.source || record.source === query.source) &&
      (!query.consumerId || this.isAuthorizedConsumer(record, query.consumerId)) &&
      (query.includeStale || !this.isStale(record)),
    );
  }

  history(informationId?: string) {
    return stormFireInformationPersistence.history(informationId);
  }

  deliveriesFor(participantId?: string) {
    return stormFireInformationPersistence.deliveries(participantId);
  }

  acknowledgeDelivery(deliveryId: string, acknowledgedAt = new Date().toISOString()): InformationDeliveryRecord {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery) throw new Error(`Information delivery ${deliveryId} was not found.`);
    const updated = { ...delivery, acknowledgedAt, status: "ACKNOWLEDGED" as const };
    this.deliveries.set(deliveryId, updated);
    stormFireInformationPersistence.appendDelivery(updated);
    return updated;
  }

  isStale(record: CanonicalInformationRecord, now = Date.now()): boolean {
    return Boolean(record.expiresAt && new Date(record.expiresAt).getTime() <= now);
  }

  isAuthorizedConsumer(record: CanonicalInformationRecord, participantId: string): boolean {
    return Boolean(
      stormFireParticipants.get(participantId)?.enabled &&
      (
        record.relationships.some((relationship) => relationship.targetId === participantId && relationship.relation === "AUTHORIZED_CONSUMER") ||
        stormFireRelationshipFabric.forParticipant(participantId).some((relationship) => relationship.enabled && relationship.informationTypes.includes(record.kind))
      ),
    );
  }

  private createDelivery(record: CanonicalInformationRecord, participantId: string): InformationDeliveryRecord {
    const delivery: InformationDeliveryRecord = {
      id: `delivery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      informationId: record.id,
      version: record.version,
      participantId,
      deliveredAt: new Date().toISOString(),
      status: "DELIVERED",
    };
    this.deliveries.set(delivery.id, delivery);
    stormFireInformationPersistence.appendDelivery(delivery);
    return delivery;
  }

  private handleCanonicalMessage(message: InformationObject): void {
    const record = fromCanonicalEnvelope(message);
    if (this.isStale(record)) return;
    this.listeners.forEach((listener) => listener(this.snapshot()));
  }

  ingest(record: CanonicalInformationRecord): CanonicalInformationRecord {
    const current = canonicalInformationFabric.historyFor(record.kind).filter((entry) => entry.id === record.id).at(-1);
    const nextVersion = Math.max(record.version, (current?.version ?? 0) + (current ? 1 : 0));
    canonicalInformationFabric.publish(toCanonicalEnvelope({ ...record, version: nextVersion }));
    return { ...record, version: nextVersion };
  }

  ingestServiceRecord(serviceId: string, kind: string, payload: Record<string, unknown>, relationships: string[]): CanonicalInformationRecord {
    const observedAt = new Date().toISOString();
    const canonicalKind: CanonicalInformationKind = ["TRACK", "NODE", "COMMAND_SYSTEM", "SERVICE_EVENT", "OBSERVATION", "ASSESSMENT", "REQUIREMENT", "RESOURCE", "ALERT"].includes(kind) ? kind as CanonicalInformationKind : "OBSERVATION";
    return this.ingest({
      id: `${serviceId}:${canonicalKind}:${Date.now()}`,
      kind: canonicalKind,
      source: serviceId,
      observedAt,
      payload,
      relationships: relationships.map((targetId) => ({ targetId, relation: "RELATED" })),
      version: 1,
      provenance: { sourceId: serviceId, observedAt, ingestedAt: observedAt, confidence: "UNKNOWN", classification: "UNCLASSIFIED", lineage: [serviceId] },
    });
  }

  ingestTrack(track: TacticalTrack) { return this.ingest(trackToCanonical(track)); }
  ingestNode(node: TacticalNode) { return this.ingest(nodeToCanonical(node)); }
  ingestCommandSystem(system: CommandSystem) { return this.ingest(commandSystemToCanonical(system)); }
  ingestEvent(event: StormFireEvent) { return this.ingest(serviceEventToCanonical(event)); }

  clear(): void {
    for (const participantId of [...this.subscriptions.keys()]) this.unsubscribeParticipant(participantId);
    this.deliveries.clear();
    canonicalInformationFabric.clear();
    stormFireInformationPersistence.clear();
    this.listeners.forEach((listener) => listener(this.snapshot()));
  }
}

export const stormFireInformationFabric = new InformationFabricBridge();
export const informationFabricBridge = stormFireInformationFabric;
stormFireEventBus.subscribe((event) => stormFireInformationFabric.ingestEvent(event));

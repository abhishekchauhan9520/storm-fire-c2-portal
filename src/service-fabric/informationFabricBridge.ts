import type { CommandSystem, TacticalNode, TacticalTrack } from "../types";
import { commandSystemToCanonical, nodeToCanonical, serviceEventToCanonical, trackToCanonical, type CanonicalInformationRecord } from "./informationAdapter";
import { stormFireEventBus, type StormFireEvent } from "./serviceEventBus";
import { stormFireRelationshipFabric } from "./relationshipFabric";

export type InformationListener = (records: CanonicalInformationRecord[]) => void;
export type InformationDeliveryListener = (record: CanonicalInformationRecord) => void;

export interface InformationQuery {
  kind?: CanonicalInformationRecord["kind"];
  source?: string;
  consumerId?: string;
  includeStale?: boolean;
}

interface InformationSubscription {
  participantId: string;
  informationTypes: Set<string>;
  listener: InformationDeliveryListener;
}

class InformationFabricBridge {
  private records = new Map<string, CanonicalInformationRecord>();
  private listeners = new Set<InformationListener>();
  private subscriptions = new Map<string, Set<InformationSubscription>>();

  subscribe(listener: InformationListener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  subscribeParticipant(
    participantId: string,
    informationTypes: string[],
    listener: InformationDeliveryListener,
  ): () => void {
    if (!informationTypes.length) throw new Error("Information subscription requires at least one information type.");

    const subscription: InformationSubscription = {
      participantId,
      informationTypes: new Set(informationTypes),
      listener,
    };
    const subscriptions = this.subscriptions.get(participantId) ?? new Set<InformationSubscription>();
    subscriptions.add(subscription);
    this.subscriptions.set(participantId, subscriptions);

    return () => {
      const current = this.subscriptions.get(participantId);
      current?.delete(subscription);
      if (current && current.size === 0) this.subscriptions.delete(participantId);
    };
  }

  snapshot(): CanonicalInformationRecord[] {
    return Array.from(this.records.values()).sort((a, b) => b.observedAt.localeCompare(a.observedAt));
  }

  query(query: InformationQuery = {}): CanonicalInformationRecord[] {
    return this.snapshot().filter((record) => {
      if (query.kind && record.kind !== query.kind) return false;
      if (query.source && record.source !== query.source) return false;
      if (query.consumerId && !this.isAuthorizedConsumer(record, query.consumerId)) return false;
      if (!query.includeStale && this.isStale(record)) return false;
      return true;
    });
  }

  isStale(record: CanonicalInformationRecord, now = Date.now()): boolean {
    if (!record.expiresAt) return false;
    return new Date(record.expiresAt).getTime() <= now;
  }

  isAuthorizedConsumer(record: CanonicalInformationRecord, participantId: string): boolean {
    if (record.relationships.some((r) => r.targetId === participantId && r.relation === "AUTHORIZED_CONSUMER")) return true;
    return stormFireRelationshipFabric.forParticipant(participantId).some((relationship) =>
      relationship.enabled && relationship.informationTypes.includes(record.kind)
    );
  }

  private deliverToSubscribers(record: CanonicalInformationRecord): void {
    for (const [participantId, subscriptions] of this.subscriptions) {
      if (!this.isAuthorizedConsumer(record, participantId)) continue;
      for (const subscription of subscriptions) {
        if (!subscription.informationTypes.has(record.kind)) continue;
        subscription.listener(record);
      }
    }
  }

  ingest(record: CanonicalInformationRecord): CanonicalInformationRecord {
    const previous = this.records.get(record.id);
    const next = previous ? {
      ...record,
      version: Math.max(record.version, previous.version + 1),
      provenance: {
        ...record.provenance,
        lineage: Array.from(new Set([...previous.provenance.lineage, ...record.provenance.lineage])),
      },
    } : record;
    this.records.set(record.id, next);
    this.deliverToSubscribers(next);
    this.listeners.forEach((listener) => listener(this.snapshot()));
    return next;
  }

  ingestTrack(track: TacticalTrack) { return this.ingest(trackToCanonical(track)); }
  ingestNode(node: TacticalNode) { return this.ingest(nodeToCanonical(node)); }
  ingestCommandSystem(system: CommandSystem) { return this.ingest(commandSystemToCanonical(system)); }
  ingestEvent(event: StormFireEvent) { return this.ingest(serviceEventToCanonical(event)); }

  clear(): void {
    this.records.clear();
    this.listeners.forEach((listener) => listener(this.snapshot()));
  }
}

export const stormFireInformationFabric = new InformationFabricBridge();

stormFireEventBus.subscribe((event) => stormFireInformationFabric.ingestEvent(event));

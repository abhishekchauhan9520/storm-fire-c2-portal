import { EventIdempotencyStore } from "./eventIdempotency";

export type StormFireInformationKind = "OBJECT" | "EVENT";
export type StormFireInformationQuality = "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH";

export interface StormFireProvenance { sourceId: string; observedAt: string; receivedAt: string; confidence?: number; quality?: StormFireInformationQuality; lineageIds?: string[]; }
export interface StormFireInformationEnvelope<T = unknown> {
  id: string; kind: StormFireInformationKind; type: string; version: number; occurredAt: string;
  producerServiceId: string; producerParticipantId?: string; correlationId?: string; provenance: StormFireProvenance; payload: T; tags?: string[];
}
export interface StormFireSubscription { id: string; participantId: string; serviceId?: string; informationTypes: string[]; handler: (message: StormFireInformationEnvelope) => void; }

export class InformationFabric {
  private history: StormFireInformationEnvelope[] = [];
  private subscriptions = new Map<string, StormFireSubscription>();
  private readonly idempotency = new EventIdempotencyStore();

  publish<T>(message: StormFireInformationEnvelope<T>): StormFireInformationEnvelope<T> {
    this.validate(message);
    if (message.kind === "EVENT" && !this.idempotency.markProcessed(message)) return this.clone(message);
    this.history.push(this.clone(message));
    for (const subscription of this.subscriptions.values()) {
      if (subscription.informationTypes.includes(message.type) || subscription.informationTypes.includes("*")) subscription.handler(this.clone(message));
    }
    return this.clone(message);
  }

  subscribe(subscription: StormFireSubscription): void {
    if (!subscription.id || !subscription.participantId) throw new Error("Subscription requires id and participant.");
    if (this.subscriptions.has(subscription.id)) throw new Error(`Subscription ${subscription.id} already exists.`);
    this.subscriptions.set(subscription.id, { ...subscription, informationTypes: [...subscription.informationTypes] });
  }
  unsubscribe(id: string): boolean { return this.subscriptions.delete(id); }
  historyFor(type?: string): StormFireInformationEnvelope[] { return this.history.filter(item => !type || item.type === type).map(item => this.clone(item)); }
  clear(): void { this.history = []; this.subscriptions.clear(); this.idempotency.clear(); }

  private validate<T>(message: StormFireInformationEnvelope<T>): void {
    if (!message.id || !message.type || !message.producerServiceId) throw new Error("Information message requires id, type and producer service.");
    if (!message.provenance?.sourceId) throw new Error("Information message requires provenance sourceId.");
    if (!Number.isInteger(message.version) || message.version < 1) throw new Error("Information message version must be a positive integer.");
  }
  private clone<T>(message: StormFireInformationEnvelope<T>): StormFireInformationEnvelope<T> {
    return { ...message, provenance: { ...message.provenance, ...(message.provenance.lineageIds ? { lineageIds: [...message.provenance.lineageIds] } : {}) }, ...(message.tags ? { tags: [...message.tags] } : {}) };
  }
}

export const stormFireInformationFabric = new InformationFabric();

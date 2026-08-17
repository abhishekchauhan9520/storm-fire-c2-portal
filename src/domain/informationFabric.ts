import type {
  InformationObject,
  InformationKind,
  InformationQuality,
  InformationSubscription,
} from "../contracts/stormFireContracts";
import { EventIdempotencyStore } from "./eventIdempotency";

export type StormFireInformationKind = InformationKind;
export type StormFireInformationQuality = InformationQuality;
export type StormFireProvenance = InformationObject["provenance"];
export type StormFireInformationEnvelope<T = unknown> = InformationObject<T>;
export type StormFireSubscription = InformationSubscription & {
  handler: (message: StormFireInformationEnvelope) => void;
};

/**
 * Canonical in-process Information Fabric adapter.
 * Durable transport/storage can replace this implementation without changing
 * the domain contract or its consumers.
 */
export class InformationFabric {
  private history: StormFireInformationEnvelope[] = [];
  private subscriptions = new Map<string, StormFireSubscription>();
  private readonly idempotency = new EventIdempotencyStore();

  publish<T>(message: StormFireInformationEnvelope<T>): StormFireInformationEnvelope<T> {
    this.validate(message);
    if (message.kind === "EVENT" && !this.idempotency.markProcessed(message)) return this.clone(message);
    this.history.push(this.clone(message));
    for (const subscription of this.subscriptions.values()) {
      if (!subscription.enabled) continue;
      if (subscription.informationTypes.includes(message.type) || subscription.informationTypes.includes("*")) {
        subscription.handler(this.clone(message));
      }
    }
    return this.clone(message);
  }

  subscribe(subscription: StormFireSubscription): void {
    if (!subscription.id || !subscription.participantId) throw new Error("Subscription requires id and participant.");
    if (subscription.informationTypes.length === 0) throw new Error("Subscription requires at least one information type.");
    if (this.subscriptions.has(subscription.id)) throw new Error(`Subscription ${subscription.id} already exists.`);
    this.subscriptions.set(subscription.id, {
      ...subscription,
      informationTypes: [...subscription.informationTypes],
      geographicScopeIds: [...(subscription.geographicScopeIds ?? [])],
    });
  }

  unsubscribe(id: string): boolean { return this.subscriptions.delete(id); }

  historyFor(type?: string): StormFireInformationEnvelope[] {
    return this.history.filter((item) => !type || item.type === type).map((item) => this.clone(item));
  }

  clear(): void {
    this.history = [];
    this.subscriptions.clear();
    this.idempotency.clear();
  }

  private validate<T>(message: StormFireInformationEnvelope<T>): void {
    if (!message.id || !message.type) throw new Error("Information object requires id and type.");
    if (!Number.isInteger(message.schemaVersion) || message.schemaVersion < 1) throw new Error("Information schemaVersion must be a positive integer.");
    if (!Number.isInteger(message.version) || message.version < 1) throw new Error("Information version must be a positive integer.");
    if (!message.provenance?.sourceId) throw new Error("Information object requires provenance sourceId.");
    if (!Array.isArray(message.geographicScopeIds)) throw new Error("Information object requires geographicScopeIds.");
    if (message.kind === "EVENT" && !message.producerServiceId && !message.producerParticipantId) {
      throw new Error("Events require a producer service or participant.");
    }
  }

  private clone<T>(message: StormFireInformationEnvelope<T>): StormFireInformationEnvelope<T> {
    return {
      ...message,
      geographicScopeIds: [...message.geographicScopeIds],
      provenance: {
        ...message.provenance,
        ...(message.provenance.lineageIds ? { lineageIds: [...message.provenance.lineageIds] } : {}),
      },
      ...(message.tags ? { tags: [...message.tags] } : {}),
    };
  }
}

export const stormFireInformationFabric = new InformationFabric();

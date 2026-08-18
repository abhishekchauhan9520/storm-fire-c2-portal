import type { Event } from "../contracts/stormFireContracts";
import { stormFireEventSpine } from "../platform/event-spine/eventSpine";

export type StormFireEventType = "SERVICE_EVENT" | "CONTEXT_UPDATE" | "INFORMATION_UPDATE" | "ALERT" | "TASK" | "ASSESSMENT";

export interface StormFireEvent<T = unknown> {
  id: string;
  type: StormFireEventType;
  sourceService: string;
  timestamp: string;
  payload: T;
  correlationId: string;
  recipients: string[];
}

type EventHandler = (event: StormFireEvent) => void;

const subscribedHandlers = new Map<StormFireEventType, Set<EventHandler>>();
const spineUnsubscribers = new Map<StormFireEventType, () => void>();

function toStormFireEvent<T>(event: Event<T>): StormFireEvent<T> {
  return {
    id: event.metadata.eventId,
    type: event.metadata.eventType as StormFireEventType,
    sourceService: event.metadata.source,
    timestamp: event.metadata.timestamp,
    payload: event.payload,
    correlationId: event.metadata.correlationId ?? event.metadata.eventId,
    recipients: [],
  };
}

function ensureSpineSubscription(type: StormFireEventType): void {
  if (spineUnsubscribers.has(type)) return;
  spineUnsubscribers.set(type, stormFireEventSpine.subscribe(type, (event) => {
    const handlers = subscribedHandlers.get(type);
    if (!handlers) return;
    const translated = toStormFireEvent(event);
    handlers.forEach((handler) => handler(translated));
  }));
}

/**
 * Compatibility facade for legacy service callers. Event Spine is the only
 * authoritative event propagation path.
 */
export class StormFireEventBus {
  subscribe(handler: EventHandler): () => void {
    const types: StormFireEventType[] = ["SERVICE_EVENT", "CONTEXT_UPDATE", "INFORMATION_UPDATE", "ALERT", "TASK", "ASSESSMENT"];
    types.forEach(ensureSpineSubscription);

    // Legacy callers subscribed without specifying a type, so retain a single
    // fan-out boundary while sourcing all events from the canonical Event Spine.
    const subscriptions = new Map<StormFireEventType, EventHandler>();
    for (const type of types) {
      const handlers = subscribedHandlers.get(type) ?? new Set<EventHandler>();
      handlers.add(handler);
      subscribedHandlers.set(type, handlers);
      subscriptions.set(type, handler);
    }

    return () => {
      for (const [type, subscribedHandler] of subscriptions) {
        const handlers = subscribedHandlers.get(type);
        handlers?.delete(subscribedHandler);
        if (handlers?.size === 0) subscribedHandlers.delete(type);
      }
    };
  }

  publish<T>(event: Omit<StormFireEvent<T>, "id" | "timestamp" | "correlationId">): StormFireEvent<T> {
    const now = new Date().toISOString();
    const canonicalEvent: Event<T> = {
      metadata: {
        eventId: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        eventType: event.type,
        schemaVersion: 1,
        source: event.sourceService,
        producer: event.sourceService,
        timestamp: now,
        correlationId: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        classification: "PUBLIC",
        geographicScopeIds: [],
        provenance: { sourceId: event.sourceService, producerId: event.sourceService, observedAt: now, receivedAt: now },
      },
      payload: event.payload,
    };

    // Event Spine performs propagation and canonical Information Fabric publication.
    void stormFireEventSpine.publish(canonicalEvent);
    return {
      id: canonicalEvent.metadata.eventId,
      type: event.type,
      sourceService: event.sourceService,
      timestamp: now,
      payload: event.payload,
      correlationId: canonicalEvent.metadata.correlationId ?? canonicalEvent.metadata.eventId,
      recipients: [...event.recipients],
    };
  }
}

export const stormFireEventBus = new StormFireEventBus();

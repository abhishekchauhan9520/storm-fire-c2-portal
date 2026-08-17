import type { Event } from "../../contracts/stormFireContracts";
import { stormFireInformationFabric } from "../../domain/informationFabric";
import { InMemoryEventJournal, type EventJournal } from "../../domain/eventJournal";

export interface EventHandler<T = unknown> {
  (event: Event<T>): void | Promise<void>;
}

/** Canonical typed Event Spine boundary; not an unbounded global event bus. */
export class EventSpine {
  private readonly handlers = new Map<string, Set<EventHandler>>();

  constructor(private readonly journal: EventJournal = new InMemoryEventJournal()) {}

  subscribe<T>(eventType: string, handler: EventHandler<T>): () => void {
    const handlers = this.handlers.get(eventType) ?? new Set<EventHandler>();
    handlers.add(handler as EventHandler);
    this.handlers.set(eventType, handlers);
    return () => handlers.delete(handler as EventHandler);
  }

  async publish<T>(event: Event<T>): Promise<boolean> {
    const identity = {
      type: event.metadata.eventType,
      id: event.metadata.eventId,
      version: event.metadata.schemaVersion,
    };
    if (await this.journal.has(identity)) return false;
    await this.journal.append(identity);

    stormFireInformationFabric.publish({
      id: event.metadata.eventId,
      kind: "EVENT",
      type: event.metadata.eventType,
      schemaVersion: event.metadata.schemaVersion,
      version: event.metadata.schemaVersion,
      occurredAt: event.metadata.timestamp,
      producerParticipantId: event.metadata.producer,
      correlationId: event.metadata.correlationId,
      causationId: event.metadata.causationId,
      classification: event.metadata.classification,
      geographicScopeIds: event.metadata.geographicScopeIds,
      provenance: event.metadata.provenance,
      payload: event.payload,
    });

    for (const handler of this.handlers.get(event.metadata.eventType) ?? []) await handler(event);
    return true;
  }
}

export const stormFireEventSpine = new EventSpine();

import type { EventIdentity } from "./eventIdempotency";

/** Durable boundary for the Event Spine's processed-event journal. */
export interface EventJournal {
  has(identity: EventIdentity): Promise<boolean>;
  append(identity: EventIdentity): Promise<void>;
}

export class InMemoryEventJournal implements EventJournal {
  private readonly events = new Set<string>();

  async has(identity: EventIdentity): Promise<boolean> {
    return this.events.has(this.key(identity));
  }

  async append(identity: EventIdentity): Promise<void> {
    this.events.add(this.key(identity));
  }

  private key(identity: EventIdentity): string {
    return `${identity.type}:${identity.id}:v${identity.version}`;
  }
}

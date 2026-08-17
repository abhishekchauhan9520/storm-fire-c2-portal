import type { EventIdentity } from "./eventIdempotency";
import type { StormFireInformationEnvelope } from "./informationFabric";

export interface EventJournal {
  has(identity: EventIdentity): Promise<boolean>;
  append<T>(message: StormFireInformationEnvelope<T>): Promise<void>;
}

export class InMemoryEventJournal implements EventJournal {
  private readonly events = new Set<string>();
  async has(identity: EventIdentity): Promise<boolean> { return this.events.has(this.key(identity)); }
  async append<T>(message: StormFireInformationEnvelope<T>): Promise<void> { this.events.add(this.key(message)); }
  private key(identity: EventIdentity): string { return `${identity.type}:${identity.id}:v${identity.version}`; }
}

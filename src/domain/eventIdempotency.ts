export interface EventIdentity { id: string; type: string; version: number; }

export class EventIdempotencyStore {
  private processed = new Set<string>();
  has(event: EventIdentity): boolean { return this.processed.has(this.key(event)); }
  markProcessed(event: EventIdentity): boolean {
    const key = this.key(event);
    if (this.processed.has(key)) return false;
    this.processed.add(key);
    return true;
  }
  clear(): void { this.processed.clear(); }
  private key(event: EventIdentity): string { return `${event.type}:${event.id}:v${event.version}`; }
}

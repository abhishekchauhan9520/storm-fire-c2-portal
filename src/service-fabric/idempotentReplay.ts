import type { CanonicalInformationRecord } from "./informationAdapter";

export interface ReplayKey { informationId: string; version: number; }

/** Applies each information version at most once for a given consumer. */
export class IdempotentReplayGuard {
  private applied = new Map<string, Set<string>>();
  hasApplied(consumerId: string, record: ReplayKey | CanonicalInformationRecord): boolean { return this.applied.get(consumerId)?.has(this.key(record)) ?? false; }
  apply(consumerId: string, record: CanonicalInformationRecord, handler: (record: CanonicalInformationRecord) => void): boolean {
    const key = this.key(record);
    const seen = this.applied.get(consumerId) ?? new Set<string>();
    if (seen.has(key)) return false;
    handler(structuredClone(record));
    seen.add(key);
    this.applied.set(consumerId, seen);
    return true;
  }
  clear(consumerId?: string): void { if (consumerId) this.applied.delete(consumerId); else this.applied.clear(); }
  private key(record: ReplayKey | CanonicalInformationRecord): string {
    const informationId = "informationId" in record ? record.informationId : record.id;
    return `${informationId}@${record.version}`;
  }
}

export const stormFireIdempotentReplay = new IdempotentReplayGuard();

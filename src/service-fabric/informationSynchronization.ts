import { stormFireInformationReplay } from "./informationReplay";
import { stormFireInformationSyncCursors, type InformationSyncCursor } from "./informationSyncCursor";
import { stormFireIdempotentReplay } from "./idempotentReplay";

export interface SynchronizationResult { consumerId: string; sourceNodeId: string; replayed: number; skipped: number; cursor: InformationSyncCursor; }

/** Coordinates cursor-based history replay and idempotent application. */
export class InformationSynchronizationService {
  synchronize(consumerId: string, sourceNodeId: string, cursor = stormFireInformationSyncCursors.get(sourceNodeId)): SynchronizationResult {
    const history = stormFireInformationReplay.query({ from: cursor.lastRecordedAt });
    let replayed = 0;
    let skipped = 0;
    let latestCursor = cursor;
    for (const entry of history.sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))) {
      const record = entry.record;
      if (record.id === cursor.lastInformationId && record.version <= (cursor.lastVersion ?? 0)) { skipped++; continue; }
      const applied = stormFireIdempotentReplay.apply(consumerId, record, () => undefined);
      if (applied) replayed++; else skipped++;
      latestCursor = stormFireInformationSyncCursors.advance({ sourceNodeId, lastRecordedAt: entry.recordedAt, lastInformationId: record.id, lastVersion: record.version });
    }
    return { consumerId, sourceNodeId, replayed, skipped, cursor: latestCursor };
  }
}

export const stormFireInformationSynchronization = new InformationSynchronizationService();

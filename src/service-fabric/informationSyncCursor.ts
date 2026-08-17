export interface InformationSyncCursor {
  sourceNodeId: string;
  lastRecordedAt?: string;
  lastInformationId?: string;
  lastVersion?: number;
}

/** Stable synchronization position used to request only information after a known point. */
export class InformationSyncCursorStore {
  private cursors = new Map<string, InformationSyncCursor>();

  get(sourceNodeId: string): InformationSyncCursor {
    return { sourceNodeId, ...(this.cursors.get(sourceNodeId) ?? {}) };
  }

  advance(cursor: InformationSyncCursor): InformationSyncCursor {
    const current = this.cursors.get(cursor.sourceNodeId);
    if (current?.lastRecordedAt && cursor.lastRecordedAt && cursor.lastRecordedAt < current.lastRecordedAt) return this.get(cursor.sourceNodeId);
    const next = { ...current, ...cursor };
    this.cursors.set(cursor.sourceNodeId, next);
    return { ...next };
  }

  clear(): void { this.cursors.clear(); }
}

export const stormFireInformationSyncCursors = new InformationSyncCursorStore();

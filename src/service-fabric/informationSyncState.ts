export type InformationConnectivityState = "CONNECTED" | "DEGRADED" | "DISCONNECTED" | "RECONNECTING" | "SYNCHRONIZING";

export interface InformationSyncSnapshot {
  state: InformationConnectivityState;
  changedAt: string;
  lastSynchronizedAt?: string;
  pendingReplayFrom?: string;
}

/** State machine foundation for future distributed Information Fabric synchronization. */
export class InformationSyncState {
  private snapshotState: InformationSyncSnapshot = { state: "CONNECTED", changedAt: new Date().toISOString() };
  get snapshot(): InformationSyncSnapshot { return { ...this.snapshotState }; }
  transition(state: InformationConnectivityState, pendingReplayFrom?: string): InformationSyncSnapshot {
    const now = new Date().toISOString();
    this.snapshotState = { ...this.snapshotState, state, changedAt: now, pendingReplayFrom };
    return this.snapshot;
  }
  markSynchronized(): InformationSyncSnapshot {
    const now = new Date().toISOString();
    this.snapshotState = { state: "CONNECTED", changedAt: now, lastSynchronizedAt: now };
    return this.snapshot;
  }
}

export const stormFireInformationSyncState = new InformationSyncState();

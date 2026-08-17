export type AlertState = "ACTIVE" | "ACKNOWLEDGED" | "ESCALATED" | "EXPIRED" | "RESOLVED";

export interface AlertLifecycleRecord {
  alertId: string;
  state: AlertState;
  createdAt: string;
  updatedAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  escalatedAt?: string;
  expiresAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface AlertLifecycleTransition {
  alertId: string;
  from: AlertState;
  to: AlertState;
  actorId?: string;
  at: string;
}

/** Human-controlled lifecycle state for distributed alerts; never executes an operational action. */
export class AlertLifecycleManager {
  private records = new Map<string, AlertLifecycleRecord>();
  private transitions: AlertLifecycleTransition[] = [];

  create(alertId: string, expiresAt?: string): AlertLifecycleRecord {
    const now = new Date().toISOString();
    const record: AlertLifecycleRecord = { alertId, state: "ACTIVE", createdAt: now, updatedAt: now, ...(expiresAt ? { expiresAt } : {}) };
    this.records.set(alertId, record);
    return { ...record };
  }

  get(alertId: string): AlertLifecycleRecord | undefined {
    const record = this.records.get(alertId);
    return record ? { ...record } : undefined;
  }

  acknowledge(alertId: string, actorId: string): AlertLifecycleRecord | undefined { return this.transition(alertId, "ACKNOWLEDGED", actorId, { acknowledgedBy: actorId, acknowledgedAt: new Date().toISOString() }); }
  escalate(alertId: string, actorId?: string): AlertLifecycleRecord | undefined { return this.transition(alertId, "ESCALATED", actorId, { escalatedAt: new Date().toISOString() }); }
  resolve(alertId: string, actorId: string): AlertLifecycleRecord | undefined { return this.transition(alertId, "RESOLVED", actorId, { resolvedBy: actorId, resolvedAt: new Date().toISOString() }); }
  expire(alertId: string): AlertLifecycleRecord | undefined { return this.transition(alertId, "EXPIRED", undefined, {}); }

  history(alertId?: string): AlertLifecycleTransition[] { return this.transitions.filter((item) => !alertId || item.alertId === alertId).map((item) => ({ ...item })); }

  private transition(alertId: string, to: AlertState, actorId?: string, fields: Partial<AlertLifecycleRecord> = {}): AlertLifecycleRecord | undefined {
    const current = this.records.get(alertId);
    if (!current || !this.allowed(current.state, to)) return undefined;
    const now = new Date().toISOString();
    const next = { ...current, ...fields, state: to, updatedAt: now };
    this.records.set(alertId, next);
    this.transitions.push({ alertId, from: current.state, to, actorId, at: now });
    return { ...next };
  }

  private allowed(from: AlertState, to: AlertState): boolean {
    if (from === "RESOLVED" || from === "EXPIRED") return false;
    if (to === "ACKNOWLEDGED") return from === "ACTIVE" || from === "ESCALATED";
    if (to === "ESCALATED") return from === "ACTIVE" || from === "ACKNOWLEDGED";
    if (to === "RESOLVED") return from === "ACTIVE" || from === "ACKNOWLEDGED" || from === "ESCALATED";
    if (to === "EXPIRED") return from === "ACTIVE" || from === "ACKNOWLEDGED" || from === "ESCALATED";
    return false;
  }

  clear(): void { this.records.clear(); this.transitions = []; }
}

export const stormFireAlertLifecycle = new AlertLifecycleManager();

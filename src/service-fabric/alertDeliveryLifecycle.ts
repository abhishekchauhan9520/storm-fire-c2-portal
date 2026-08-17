import { stormFireAlertLifecycle, type AlertLifecycleRecord } from "./alertLifecycle";
import type { WorkspaceAlertDelivery } from "./workspaceAlertRouter";

export interface AlertDeliveryState {
  alertId: string;
  workspaceId: string;
  participantId: string;
  surfaceIds: string[];
  deliveredAt: string;
  lifecycle: AlertLifecycleRecord;
}

/** Correlates parallel alert delivery with one shared alert lifecycle. */
export class AlertDeliveryLifecycle {
  private deliveries = new Map<string, AlertDeliveryState>();

  record(delivery: WorkspaceAlertDelivery): AlertDeliveryState {
    let lifecycle = stormFireAlertLifecycle.get(delivery.informationId);
    if (!lifecycle) lifecycle = stormFireAlertLifecycle.create(delivery.informationId);
    const state: AlertDeliveryState = { alertId: delivery.informationId, workspaceId: delivery.workspaceId, participantId: delivery.participantId, surfaceIds: [...delivery.surfaceIds], deliveredAt: delivery.deliveredAt, lifecycle };
    this.deliveries.set(this.key(delivery.workspaceId, delivery.informationId), state);
    return { ...state, surfaceIds: [...state.surfaceIds], lifecycle: { ...state.lifecycle } };
  }

  acknowledge(workspaceId: string, alertId: string, actorId: string): AlertDeliveryState | undefined { const lifecycle = stormFireAlertLifecycle.acknowledge(alertId, actorId); return lifecycle ? this.update(workspaceId, alertId, lifecycle) : undefined; }
  escalate(workspaceId: string, alertId: string, actorId?: string): AlertDeliveryState | undefined { const lifecycle = stormFireAlertLifecycle.escalate(alertId, actorId); return lifecycle ? this.update(workspaceId, alertId, lifecycle) : undefined; }
  resolve(workspaceId: string, alertId: string, actorId: string): AlertDeliveryState | undefined { const lifecycle = stormFireAlertLifecycle.resolve(alertId, actorId); return lifecycle ? this.update(workspaceId, alertId, lifecycle) : undefined; }
  expire(workspaceId: string, alertId: string): AlertDeliveryState | undefined { const lifecycle = stormFireAlertLifecycle.expire(alertId); return lifecycle ? this.update(workspaceId, alertId, lifecycle) : undefined; }

  get(workspaceId: string, alertId: string): AlertDeliveryState | undefined { const value = this.deliveries.get(this.key(workspaceId, alertId)); return value ? { ...value, surfaceIds: [...value.surfaceIds], lifecycle: { ...value.lifecycle } } : undefined; }
  list(workspaceId?: string): AlertDeliveryState[] { return [...this.deliveries.values()].filter((item) => !workspaceId || item.workspaceId === workspaceId).map((item) => ({ ...item, surfaceIds: [...item.surfaceIds], lifecycle: { ...item.lifecycle } })); }

  private update(workspaceId: string, alertId: string, lifecycle: AlertLifecycleRecord): AlertDeliveryState | undefined {
    const key = this.key(workspaceId, alertId); const current = this.deliveries.get(key); if (!current) return undefined;
    const next = { ...current, lifecycle: { ...lifecycle } }; this.deliveries.set(key, next); return { ...next, surfaceIds: [...next.surfaceIds], lifecycle: { ...next.lifecycle } };
  }
  private key(workspaceId: string, alertId: string): string { return `${workspaceId}:${alertId}`; }
  clear(): void { this.deliveries.clear(); }
}

export const stormFireAlertDeliveryLifecycle = new AlertDeliveryLifecycle();

export type StormFireMovementStatus = "PLANNED" | "DISPATCHED" | "IN_TRANSIT" | "ARRIVED" | "CANCELLED";

export interface StormFireLogisticsMovement { id: string; requestId: string; originScopeId: string; destinationScopeId: string; assetIds: string[]; status: StormFireMovementStatus; plannedAt: string; updatedAt: string; }

export class LogisticsTransportService {
  private readonly movements = new Map<string, StormFireLogisticsMovement>();
  create(movement: StormFireLogisticsMovement): StormFireLogisticsMovement {
    if (!movement.id || !movement.requestId || !movement.originScopeId || !movement.destinationScopeId) throw new Error("Movement requires request, origin and destination.");
    if (this.movements.has(movement.id)) throw new Error(`Movement ${movement.id} already exists.`);
    const stored = { ...movement, assetIds: [...movement.assetIds] }; this.movements.set(movement.id, stored); return this.clone(stored);
  }
  get(id: string): StormFireLogisticsMovement | undefined { const movement = this.movements.get(id); return movement ? this.clone(movement) : undefined; }
  transition(id: string, status: StormFireMovementStatus, updatedAt: string): StormFireLogisticsMovement {
    const movement = this.movements.get(id); if (!movement) throw new Error(`Movement ${id} not found.`); movement.status = status; movement.updatedAt = updatedAt; return this.clone(movement);
  }
  listByRequest(requestId: string): StormFireLogisticsMovement[] { return [...this.movements.values()].filter(m => m.requestId === requestId).map(m => this.clone(m)); }
  private clone(m: StormFireLogisticsMovement): StormFireLogisticsMovement { return { ...m, assetIds: [...m.assetIds] }; }
}

export const stormFireLogisticsTransport = new LogisticsTransportService();

export type StormFireLogisticsStatus = "REQUESTED" | "ALLOCATED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
export interface StormFireLogisticsItem { id: string; category: string; quantity: number; unit: string; }
export interface StormFireLogisticsRequest { id: string; requestingParticipantId: string; destinationScopeId: string; items: StormFireLogisticsItem[]; priority: "ROUTINE" | "URGENT" | "CRITICAL"; status: StormFireLogisticsStatus; createdAt: string; updatedAt: string; }

/** First logistics domain slice: canonical requests and lifecycle state. */
export class LogisticsService {
  private readonly requests = new Map<string, StormFireLogisticsRequest>();
  createRequest(request: StormFireLogisticsRequest): StormFireLogisticsRequest {
    if (!request.id || !request.requestingParticipantId || !request.destinationScopeId) throw new Error("Logistics request requires id, participant and destination scope.");
    if (this.requests.has(request.id)) throw new Error(`Logistics request ${request.id} already exists.`);
    if (request.items.length === 0 || request.items.some(item => item.quantity <= 0)) throw new Error("Logistics request must contain positive quantities.");
    const stored = this.clone(request); this.requests.set(request.id, stored); return this.clone(stored);
  }
  get(id: string): StormFireLogisticsRequest | undefined { const request = this.requests.get(id); return request ? this.clone(request) : undefined; }
  transition(id: string, status: StormFireLogisticsStatus, updatedAt: string): StormFireLogisticsRequest {
    const request = this.requests.get(id); if (!request) throw new Error(`Logistics request ${id} not found.`); request.status = status; request.updatedAt = updatedAt; return this.clone(request);
  }
  listForParticipant(participantId: string): StormFireLogisticsRequest[] { return [...this.requests.values()].filter(r => r.requestingParticipantId === participantId).map(r => this.clone(r)); }
  private clone(request: StormFireLogisticsRequest): StormFireLogisticsRequest { return { ...request, items: request.items.map(item => ({ ...item })) }; }
}
export const stormFireLogisticsService = new LogisticsService();

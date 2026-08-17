import { LogisticsRepository, InMemoryLogisticsRepository } from "./logisticsRepository";

export type LogisticsResourceKind = "SUPPLY" | "FUEL" | "EQUIPMENT" | "TRANSPORT" | "OTHER";
export type LogisticsRequestStatus = "OPEN" | "PRIORITIZED" | "IN_PROGRESS" | "FULFILLED" | "CANCELLED";

export interface LogisticsResource { id: string; name: string; kind: LogisticsResourceKind; quantity: number; unit: string; locationId?: string; readiness?: "READY" | "LIMITED" | "UNAVAILABLE"; }
export interface LogisticsRequest { id: string; requesterParticipantId: string; resourceId: string; quantity: number; priority: "LOW" | "NORMAL" | "HIGH" | "CRITICAL"; status: LogisticsRequestStatus; createdAt: string; updatedAt: string; }

export class LogisticsService {
  constructor(private readonly repository: LogisticsRepository = new InMemoryLogisticsRepository()) {}

  registerResource(resource: LogisticsResource): LogisticsResource {
    if (!resource.id || resource.quantity < 0) throw new Error("Invalid logistics resource.");
    if (this.repository.getResource(resource.id)) throw new Error(`Resource ${resource.id} already exists.`);
    return this.repository.saveResource(resource);
  }

  getResource(id: string): LogisticsResource | undefined { return this.repository.getResource(id); }
  listResources(): LogisticsResource[] { return this.repository.listResources(); }
  getRequest(id: string): LogisticsRequest | undefined { return this.repository.getRequest(id); }

  createRequest(input: Omit<LogisticsRequest, "status" | "createdAt" | "updatedAt">): LogisticsRequest {
    if (!this.repository.getResource(input.resourceId)) throw new Error(`Resource ${input.resourceId} was not found.`);
    if (input.quantity <= 0) throw new Error("Request quantity must be greater than zero.");
    if (this.repository.getRequest(input.id)) throw new Error(`Request ${input.id} already exists.`);
    const now = new Date().toISOString();
    return this.repository.saveRequest({ ...input, status: "OPEN", createdAt: now, updatedAt: now });
  }

  updateRequestStatus(id: string, status: LogisticsRequestStatus): LogisticsRequest {
    const request = this.repository.getRequest(id);
    if (!request) throw new Error(`Logistics request ${id} was not found.`);
    return this.repository.saveRequest({ ...request, status, updatedAt: new Date().toISOString() });
  }

  listRequests(status?: LogisticsRequestStatus): LogisticsRequest[] { return this.repository.listRequests(status); }
}

export const stormFireLogisticsService = new LogisticsService();

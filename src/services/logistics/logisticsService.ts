export type LogisticsResourceKind = "SUPPLY" | "FUEL" | "EQUIPMENT" | "TRANSPORT" | "OTHER";
export type LogisticsRequestStatus = "OPEN" | "PRIORITIZED" | "IN_PROGRESS" | "FULFILLED" | "CANCELLED";

export interface LogisticsResource {
  id: string;
  name: string;
  kind: LogisticsResourceKind;
  quantity: number;
  unit: string;
  locationId?: string;
  readiness?: "READY" | "LIMITED" | "UNAVAILABLE";
}

export interface LogisticsRequest {
  id: string;
  requesterParticipantId: string;
  resourceId: string;
  quantity: number;
  priority: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
  status: LogisticsRequestStatus;
  createdAt: string;
  updatedAt: string;
}

/** First Storm Fire operational-service vertical slice. Domain state is separate from the UI and can publish through the Information Fabric. */
export class LogisticsService {
  private resources = new Map<string, LogisticsResource>();
  private requests = new Map<string, LogisticsRequest>();

  registerResource(resource: LogisticsResource): LogisticsResource {
    if (!resource.id || resource.quantity < 0) throw new Error("Invalid logistics resource.");
    if (this.resources.has(resource.id)) throw new Error(`Resource ${resource.id} already exists.`);
    const copy = { ...resource };
    this.resources.set(copy.id, copy);
    return { ...copy };
  }

  getResource(id: string): LogisticsResource | undefined {
    const resource = this.resources.get(id);
    return resource ? { ...resource } : undefined;
  }

  listResources(): LogisticsResource[] { return [...this.resources.values()].map(resource => ({ ...resource })); }

  createRequest(input: Omit<LogisticsRequest, "status" | "createdAt" | "updatedAt">): LogisticsRequest {
    if (!this.resources.has(input.resourceId)) throw new Error(`Resource ${input.resourceId} was not found.`);
    if (input.quantity <= 0) throw new Error("Request quantity must be greater than zero.");
    const now = new Date().toISOString();
    const request: LogisticsRequest = { ...input, status: "OPEN", createdAt: now, updatedAt: now };
    if (this.requests.has(request.id)) throw new Error(`Request ${request.id} already exists.`);
    this.requests.set(request.id, request);
    return { ...request };
  }

  updateRequestStatus(id: string, status: LogisticsRequestStatus): LogisticsRequest {
    const request = this.requests.get(id);
    if (!request) throw new Error(`Logistics request ${id} was not found.`);
    request.status = status;
    request.updatedAt = new Date().toISOString();
    return { ...request };
  }

  listRequests(status?: LogisticsRequestStatus): LogisticsRequest[] {
    return [...this.requests.values()].filter(request => !status || request.status === status).map(request => ({ ...request }));
  }

  clear(): void { this.resources.clear(); this.requests.clear(); }
}

export const stormFireLogisticsService = new LogisticsService();

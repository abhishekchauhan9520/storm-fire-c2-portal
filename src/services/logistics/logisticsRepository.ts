import { LogisticsRequest, LogisticsRequestStatus, LogisticsResource } from "./logisticsService";

export interface LogisticsRepository {
  saveResource(resource: LogisticsResource): LogisticsResource;
  getResource(id: string): LogisticsResource | undefined;
  listResources(): LogisticsResource[];
  saveRequest(request: LogisticsRequest): LogisticsRequest;
  getRequest(id: string): LogisticsRequest | undefined;
  listRequests(status?: LogisticsRequestStatus): LogisticsRequest[];
}

export class InMemoryLogisticsRepository implements LogisticsRepository {
  private resources = new Map<string, LogisticsResource>();
  private requests = new Map<string, LogisticsRequest>();
  saveResource(resource: LogisticsResource) { this.resources.set(resource.id, { ...resource }); return { ...resource }; }
  getResource(id: string) { const r = this.resources.get(id); return r ? { ...r } : undefined; }
  listResources() { return [...this.resources.values()].map(r => ({ ...r })); }
  saveRequest(request: LogisticsRequest) { this.requests.set(request.id, { ...request }); return { ...request }; }
  getRequest(id: string) { const r = this.requests.get(id); return r ? { ...r } : undefined; }
  listRequests(status?: LogisticsRequestStatus) { return [...this.requests.values()].filter(r => !status || r.status === status).map(r => ({ ...r })); }
}

import type { LogisticsRepository } from "./logisticsRepository";
import type { LogisticsRequest, LogisticsResource, LogisticsRequestStatus } from "./logisticsService";

export interface LogisticsPersistenceAdapter {
  loadResources(): Promise<LogisticsResource[]>;
  loadRequests(): Promise<LogisticsRequest[]>;
  saveResource(resource: LogisticsResource): Promise<void>;
  saveRequest(request: LogisticsRequest): Promise<void>;
}

export class PersistentLogisticsRepository implements LogisticsRepository {
  constructor(private readonly delegate: LogisticsRepository, private readonly persistence: LogisticsPersistenceAdapter) {}
  saveResource(resource: LogisticsResource): LogisticsResource { const saved = this.delegate.saveResource(resource); void this.persistence.saveResource(saved); return saved; }
  getResource(id: string) { return this.delegate.getResource(id); }
  listResources() { return this.delegate.listResources(); }
  saveRequest(request: LogisticsRequest): LogisticsRequest { const saved = this.delegate.saveRequest(request); void this.persistence.saveRequest(saved); return saved; }
  getRequest(id: string) { return this.delegate.getRequest(id); }
  listRequests(status?: LogisticsRequestStatus) { return this.delegate.listRequests(status); }
  async hydrate(): Promise<void> {
    for (const resource of await this.persistence.loadResources()) if (!this.delegate.getResource(resource.id)) this.delegate.saveResource(resource);
    for (const request of await this.persistence.loadRequests()) if (!this.delegate.getRequest(request.id)) this.delegate.saveRequest(request);
  }
}

export class InMemoryPersistenceAdapter implements LogisticsPersistenceAdapter {
  private resources: LogisticsResource[] = [];
  private requests: LogisticsRequest[] = [];
  async loadResources() { return this.resources.map(r => ({ ...r })); }
  async loadRequests() { return this.requests.map(r => ({ ...r })); }
  async saveResource(resource: LogisticsResource) { this.resources = [...this.resources.filter(r => r.id !== resource.id), { ...resource }]; }
  async saveRequest(request: LogisticsRequest) { this.requests = [...this.requests.filter(r => r.id !== request.id), { ...request }]; }
}

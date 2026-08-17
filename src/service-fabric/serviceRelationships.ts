import { stormFireServiceFabric } from "./serviceFabric";

export type ServiceRelationshipDirection = "VERTICAL" | "HORIZONTAL" | "DIAGONAL";
export type ServiceRelationshipStatus = "PROPOSED" | "ACTIVE" | "SUSPENDED" | "CLOSED";

export interface ServiceRelationship {
  id: string;
  sourceServiceId: string;
  targetServiceId: string;
  informationTypes: string[];
  direction: ServiceRelationshipDirection;
  status: ServiceRelationshipStatus;
  createdAt: string;
  updatedAt: string;
}

/** Explicit service-to-service relationships. They describe information paths, not command authority. */
export class ServiceRelationshipFabric {
  private relationships = new Map<string, ServiceRelationship>();

  propose(input: Omit<ServiceRelationship, "createdAt" | "updatedAt" | "status"> & { status?: ServiceRelationshipStatus }): ServiceRelationship {
    if (!stormFireServiceFabric.get(input.sourceServiceId) || !stormFireServiceFabric.get(input.targetServiceId)) throw new Error("Both services must be registered before creating a relationship.");
    if (input.sourceServiceId === input.targetServiceId) throw new Error("A relationship requires two distinct services.");
    if (!input.informationTypes.length) throw new Error("A relationship requires at least one information type.");
    const now = new Date().toISOString();
    const relationship: ServiceRelationship = { ...input, informationTypes: [...input.informationTypes], status: input.status ?? "PROPOSED", createdAt: now, updatedAt: now };
    this.relationships.set(relationship.id, relationship);
    return this.copy(relationship);
  }

  activate(id: string): ServiceRelationship | undefined { return this.transition(id, "ACTIVE"); }
  suspend(id: string): ServiceRelationship | undefined { return this.transition(id, "SUSPENDED"); }
  close(id: string): ServiceRelationship | undefined { return this.transition(id, "CLOSED"); }
  get(id: string): ServiceRelationship | undefined { const r = this.relationships.get(id); return r ? this.copy(r) : undefined; }
  between(serviceId: string): ServiceRelationship[] { return [...this.relationships.values()].filter(r => r.sourceServiceId === serviceId || r.targetServiceId === serviceId).map(r => this.copy(r)); }
  pathsFor(serviceId: string, informationType: string): ServiceRelationship[] { return [...this.relationships.values()].filter(r => r.status === "ACTIVE" && (r.sourceServiceId === serviceId || r.targetServiceId === serviceId) && r.informationTypes.includes(informationType)).map(r => this.copy(r)); }
  list(status?: ServiceRelationshipStatus): ServiceRelationship[] { return [...this.relationships.values()].filter(r => !status || r.status === status).map(r => this.copy(r)); }
  clear(): void { this.relationships.clear(); }

  private transition(id: string, status: ServiceRelationshipStatus): ServiceRelationship | undefined {
    const current = this.relationships.get(id); if (!current || current.status === "CLOSED") return undefined;
    const next = { ...current, status, updatedAt: new Date().toISOString() }; this.relationships.set(id, next); return this.copy(next);
  }
  private copy(r: ServiceRelationship): ServiceRelationship { return { ...r, informationTypes: [...r.informationTypes] }; }
}

export const stormFireServiceRelationships = new ServiceRelationshipFabric();

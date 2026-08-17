export type StormFireOrganizationKind = "THEATRE" | "COMMAND" | "CORPS" | "DIVISION" | "BRIGADE" | "REGIMENT" | "BATTALION" | "COMPANY" | "PLATOON" | "SQUAD" | "SPECIALIST" | "SUPPORT" | "OTHER";
export type StormFireOrganizationStatus = "ACTIVE" | "INACTIVE";

export interface StormFireGeoScope { id: string; label?: string; center?: { lat: number; lon: number }; radiusKm?: number; }

export interface StormFireOrganizationNode {
  id: string;
  name: string;
  kind: StormFireOrganizationKind;
  status: StormFireOrganizationStatus;
  parentIds: string[];
  childIds: string[];
  areaOfResponsibilityIds: string[];
  serviceIds: string[];
  metadata?: Record<string, string>;
}

export interface StormFireParticipantContext {
  participantId: string;
  organizationIds: string[];
  roleIds: string[];
  serviceIds: string[];
  geographicScopeIds: string[];
  informationRelationshipIds: string[];
  workspaceIds: string[];
}

export class OrganizationGraph {
  private organizations = new Map<string, StormFireOrganizationNode>();

  register(node: StormFireOrganizationNode): StormFireOrganizationNode {
    if (!node.id || !node.name) throw new Error("Organization requires id and name.");
    if (this.organizations.has(node.id)) throw new Error(`Organization ${node.id} already exists.`);
    const normalized = { ...node, parentIds: [...node.parentIds], childIds: [...node.childIds], areaOfResponsibilityIds: [...node.areaOfResponsibilityIds], serviceIds: [...node.serviceIds], ...(node.metadata ? { metadata: { ...node.metadata } } : {}) };
    this.organizations.set(node.id, normalized);
    return this.clone(normalized);
  }

  link(parentId: string, childId: string): StormFireOrganizationNode[] {
    if (parentId === childId) throw new Error("Organization cannot be its own parent.");
    const parent = this.require(parentId); const child = this.require(childId);
    if (!parent.childIds.includes(childId)) parent.childIds.push(childId);
    if (!child.parentIds.includes(parentId)) child.parentIds.push(parentId);
    return [this.clone(parent), this.clone(child)];
  }

  unlink(parentId: string, childId: string): boolean {
    const parent = this.organizations.get(parentId); const child = this.organizations.get(childId);
    if (!parent || !child) return false;
    parent.childIds = parent.childIds.filter((id) => id !== childId); child.parentIds = child.parentIds.filter((id) => id !== parentId); return true;
  }

  get(id: string): StormFireOrganizationNode | undefined { const node = this.organizations.get(id); return node ? this.clone(node) : undefined; }
  childrenOf(id: string): StormFireOrganizationNode[] { return this.require(id).childIds.map((childId) => this.organizations.get(childId)).filter((node): node is StormFireOrganizationNode => Boolean(node)).map((node) => this.clone(node)); }
  parentsOf(id: string): StormFireOrganizationNode[] { return this.require(id).parentIds.map((parentId) => this.organizations.get(parentId)).filter((node): node is StormFireOrganizationNode => Boolean(node)).map((node) => this.clone(node)); }

  ancestorsOf(id: string): StormFireOrganizationNode[] {
    const visited = new Set<string>(); const result: StormFireOrganizationNode[] = [];
    const visit = (currentId: string) => { for (const parentId of this.require(currentId).parentIds) { if (visited.has(parentId)) continue; visited.add(parentId); result.push(this.require(parentId)); visit(parentId); } };
    visit(id); return result.map((node) => this.clone(node));
  }

  descendantsOf(id: string): StormFireOrganizationNode[] {
    const visited = new Set<string>(); const result: StormFireOrganizationNode[] = [];
    const visit = (currentId: string) => { for (const childId of this.require(currentId).childIds) { if (visited.has(childId)) continue; visited.add(childId); result.push(this.require(childId)); visit(childId); } };
    visit(id); return result.map((node) => this.clone(node));
  }

  list(): StormFireOrganizationNode[] { return Array.from(this.organizations.values()).map((node) => this.clone(node)); }
  clear(): void { this.organizations.clear(); }
  private require(id: string): StormFireOrganizationNode { const node = this.organizations.get(id); if (!node) throw new Error(`Organization ${id} was not found.`); return node; }
  private clone(node: StormFireOrganizationNode): StormFireOrganizationNode { return { ...node, parentIds: [...node.parentIds], childIds: [...node.childIds], areaOfResponsibilityIds: [...node.areaOfResponsibilityIds], serviceIds: [...node.serviceIds], ...(node.metadata ? { metadata: { ...node.metadata } } : {}) }; }
}

export const stormFireOrganizationGraph = new OrganizationGraph();

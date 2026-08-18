import type {
  GeographicScope,
  OrganizationNode,
  OrganizationRelationship,
} from "../contracts/stormFireContracts";

export type StormFireOrganizationKind = OrganizationNode["kind"];
export type StormFireOrganizationStatus = OrganizationNode["status"];
export type StormFireGeoScope = GeographicScope;
export type StormFireOrganizationNode = OrganizationNode;

/**
 * Canonical organization graph. Relationships are graph edges; parent/child
 * arrays are maintained as a navigation index for efficient projection.
 */
export class OrganizationGraph {
  private organizations = new Map<string, OrganizationNode>();
  private relationships = new Map<string, OrganizationRelationship>();

  register(node: OrganizationNode): OrganizationNode {
    if (!node.id || !node.name) throw new Error("Organization requires id and name.");
    if (this.organizations.has(node.id)) throw new Error(`Organization ${node.id} already exists.`);
    const normalized = this.clone(node);
    this.organizations.set(node.id, normalized);
    return this.clone(normalized);
  }

  registerRelationship(relationship: OrganizationRelationship): OrganizationRelationship {
    if (!relationship.id) throw new Error("Organization relationship requires an id.");
    this.require(relationship.fromOrganizationId);
    this.require(relationship.toOrganizationId);
    if (relationship.fromOrganizationId === relationship.toOrganizationId) throw new Error("Organization cannot relate to itself.");
    if (this.relationships.has(relationship.id)) throw new Error(`Organization relationship ${relationship.id} already exists.`);
    this.relationships.set(relationship.id, { ...relationship });
    const from = this.require(relationship.fromOrganizationId);
    const to = this.require(relationship.toOrganizationId);
    if (!from.relationshipIds.includes(relationship.id)) from.relationshipIds.push(relationship.id);
    if (!to.relationshipIds.includes(relationship.id)) to.relationshipIds.push(relationship.id);
    if (relationship.kind === "COMMAND" || relationship.kind === "SUPPORT" || relationship.kind === "ATTACHMENT") {
      if (!from.childIds.includes(to.id)) from.childIds.push(to.id);
      if (!to.parentIds.includes(from.id)) to.parentIds.push(from.id);
    }
    return { ...relationship };
  }

  link(parentId: string, childId: string): OrganizationNode[] {
    if (parentId === childId) throw new Error("Organization cannot be its own parent.");
    const parent = this.require(parentId);
    const child = this.require(childId);
    if (!parent.childIds.includes(childId)) parent.childIds.push(childId);
    if (!child.parentIds.includes(parentId)) child.parentIds.push(parentId);
    return [this.clone(parent), this.clone(child)];
  }

  unlink(parentId: string, childId: string): boolean {
    const parent = this.organizations.get(parentId);
    const child = this.organizations.get(childId);
    if (!parent || !child) return false;
    parent.childIds = parent.childIds.filter((id) => id !== childId);
    child.parentIds = child.parentIds.filter((id) => id !== parentId);
    return true;
  }

  get(id: string): OrganizationNode | undefined {
    const node = this.organizations.get(id);
    return node ? this.clone(node) : undefined;
  }

  relationship(id: string): OrganizationRelationship | undefined {
    const relationship = this.relationships.get(id);
    return relationship ? { ...relationship } : undefined;
  }

  relationshipsFor(id: string): OrganizationRelationship[] {
    return [...this.relationships.values()]
      .filter((relationship) => relationship.fromOrganizationId === id || relationship.toOrganizationId === id)
      .map((relationship) => ({ ...relationship }));
  }

  childrenOf(id: string): OrganizationNode[] {
    return this.require(id).childIds
      .map((childId) => this.organizations.get(childId))
      .filter((node): node is OrganizationNode => Boolean(node))
      .map((node) => this.clone(node));
  }

  parentsOf(id: string): OrganizationNode[] {
    return this.require(id).parentIds
      .map((parentId) => this.organizations.get(parentId))
      .filter((node): node is OrganizationNode => Boolean(node))
      .map((node) => this.clone(node));
  }

  ancestorsOf(id: string): OrganizationNode[] {
    const visited = new Set<string>();
    const result: OrganizationNode[] = [];
    const visit = (currentId: string) => {
      for (const parentId of this.require(currentId).parentIds) {
        if (visited.has(parentId)) continue;
        visited.add(parentId);
        result.push(this.require(parentId));
        visit(parentId);
      }
    };
    visit(id);
    return result.map((node) => this.clone(node));
  }

  descendantsOf(id: string): OrganizationNode[] {
    const visited = new Set<string>();
    const result: OrganizationNode[] = [];
    const visit = (currentId: string) => {
      for (const childId of this.require(currentId).childIds) {
        if (visited.has(childId)) continue;
        visited.add(childId);
        result.push(this.require(childId));
        visit(childId);
      }
    };
    visit(id);
    return result.map((node) => this.clone(node));
  }

  list(): OrganizationNode[] { return [...this.organizations.values()].map((node) => this.clone(node)); }
  clear(): void { this.organizations.clear(); this.relationships.clear(); }

  private require(id: string): OrganizationNode {
    const node = this.organizations.get(id);
    if (!node) throw new Error(`Organization ${id} was not found.`);
    return node;
  }

  private clone(node: OrganizationNode): OrganizationNode {
    return {
      ...node,
      parentIds: [...node.parentIds],
      childIds: [...node.childIds],
      relationshipIds: [...node.relationshipIds],
      areaOfResponsibilityIds: [...node.areaOfResponsibilityIds],
      serviceIds: [...node.serviceIds],
      ...(node.metadata ? { metadata: { ...node.metadata } } : {}),
    };
  }
}

export const stormFireOrganizationGraph = new OrganizationGraph();

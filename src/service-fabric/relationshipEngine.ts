import type { RelationshipAxis } from "./serviceManifestAdapter";

export interface StormFireRelationship {
  id: string;
  from: string;
  to: string;
  axis: RelationshipAxis;
  relation: string;
  source: string;
  createdAt: string;
  active: boolean;
}

export interface RelationshipQuery {
  participantId?: string;
  axis?: RelationshipAxis;
  relation?: string;
  activeOnly?: boolean;
}

/**
 * Relationship layer for the shared information environment.
 * It models connections independently of UI modules so services and
 * participants can form vertical, horizontal, or diagonal relationships.
 */
export class StormFireRelationshipEngine {
  private relationships = new Map<string, StormFireRelationship>();

  connect(input: Omit<StormFireRelationship, "id" | "createdAt" | "active">): StormFireRelationship {
    if (input.from === input.to) throw new Error("Self-relationships are not permitted.");
    const relationship: StormFireRelationship = {
      ...input,
      id: `rel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      active: true,
    };
    this.relationships.set(relationship.id, relationship);
    return relationship;
  }

  disconnect(id: string): boolean {
    const relationship = this.relationships.get(id);
    if (!relationship) return false;
    relationship.active = false;
    return true;
  }

  query(query: RelationshipQuery = {}): StormFireRelationship[] {
    return [...this.relationships.values()].filter((relationship) => {
      if (query.activeOnly && !relationship.active) return false;
      if (query.participantId && relationship.from !== query.participantId && relationship.to !== query.participantId) return false;
      if (query.axis && relationship.axis !== query.axis) return false;
      if (query.relation && relationship.relation !== query.relation) return false;
      return true;
    });
  }

  neighbors(participantId: string): string[] {
    return [...new Set(this.query({ participantId, activeOnly: true }).map((relationship) =>
      relationship.from === participantId ? relationship.to : relationship.from,
    ))];
  }

  snapshot(): StormFireRelationship[] {
    return [...this.relationships.values()];
  }
}

export const stormFireRelationshipEngine = new StormFireRelationshipEngine();

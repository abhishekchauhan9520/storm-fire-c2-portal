import { stormFireInformationRelationships } from "../domain/informationRelationshipEngine";
import type { InformationRelationship, RelationshipDirection } from "../contracts/stormFireContracts";
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

function toLegacyRelationship(relationship: InformationRelationship): StormFireRelationship {
  return {
    id: relationship.id,
    from: relationship.fromParticipantId,
    to: relationship.toParticipantId,
    axis: relationship.direction,
    relation: relationship.relationshipType ?? "INFORMATION_LINK",
    source: relationship.createdByParticipantId ?? relationship.fromParticipantId,
    createdAt: relationship.createdAt ?? "",
    active: relationship.enabled,
  };
}

function fromLegacyRelationship(input: Omit<StormFireRelationship, "id" | "createdAt" | "active">): InformationRelationship {
  if (input.from === input.to) throw new Error("Self-relationships are not permitted.");
  return {
    id: `rel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fromParticipantId: input.from,
    toParticipantId: input.to,
    direction: input.axis as RelationshipDirection,
    allowedInformationTypes: ["*"],
    enabled: true,
    relationshipType: input.relation,
    createdAt: new Date().toISOString(),
    createdByParticipantId: input.source,
  };
}

/**
 * Compatibility facade only. Authoritative relationship state lives in the
 * canonical InformationRelationshipEngine; this module owns no parallel store.
 */
export class StormFireRelationshipEngine {
  connect(input: Omit<StormFireRelationship, "id" | "createdAt" | "active">): StormFireRelationship {
    const canonical = fromLegacyRelationship(input);
    stormFireInformationRelationships.register(canonical);
    return toLegacyRelationship(canonical);
  }

  disconnect(id: string): boolean {
    return stormFireInformationRelationships.remove(id);
  }

  query(query: RelationshipQuery = {}): StormFireRelationship[] {
    return stormFireInformationRelationships
      .list()
      .filter((relationship) => {
        if (query.activeOnly && !relationship.enabled) return false;
        if (query.participantId && relationship.fromParticipantId !== query.participantId && relationship.toParticipantId !== query.participantId) return false;
        if (query.axis && relationship.direction !== query.axis) return false;
        if (query.relation && relationship.relationshipType !== query.relation) return false;
        return true;
      })
      .map(toLegacyRelationship);
  }

  neighbors(participantId: string): string[] {
    return [...new Set(this.query({ participantId, activeOnly: true }).map((relationship) =>
      relationship.from === participantId ? relationship.to : relationship.from,
    ))];
  }

  snapshot(): StormFireRelationship[] {
    return this.query();
  }
}

export const stormFireRelationshipEngine = new StormFireRelationshipEngine();

import { stormFireParticipants } from "./participantModel";
import { stormFireInformationRelationships, type StormFireInformationRelationship } from "../domain/informationRelationshipEngine";

export type RelationshipAxis = "VERTICAL" | "HORIZONTAL" | "DIAGONAL";

export interface StormFireInformationRelationshipProjection {
  id: string;
  sourceParticipantId: string;
  targetParticipantId: string;
  axis: RelationshipAxis;
  informationTypes: string[];
  enabled: boolean;
}

function project(relationship: StormFireInformationRelationship): StormFireInformationRelationshipProjection {
  return {
    id: relationship.id,
    sourceParticipantId: relationship.fromParticipantId,
    targetParticipantId: relationship.toParticipantId,
    axis: relationship.direction,
    informationTypes: [...relationship.allowedInformationTypes],
    enabled: relationship.enabled,
  };
}

/**
 * Compatibility facade for older service-fabric callers. The domain
 * InformationRelationshipEngine is the only authoritative relationship store.
 * Initialization is deliberately explicit; this module has no import-time side effects.
 */
class RelationshipFabric {
  establish(input: Omit<StormFireInformationRelationshipProjection, "id">): StormFireInformationRelationshipProjection {
    if (!stormFireParticipants.get(input.sourceParticipantId) || !stormFireParticipants.get(input.targetParticipantId)) {
      throw new Error("Both relationship participants must be registered.");
    }
    if (!input.informationTypes.length) throw new Error("Relationship requires at least one information type.");

    const id = `${input.sourceParticipantId}:${input.axis}:${input.targetParticipantId}`;
    const existing = stormFireInformationRelationships.list().find((relationship) => relationship.id === id);
    if (!existing) {
      stormFireInformationRelationships.register({
        id,
        fromParticipantId: input.sourceParticipantId,
        toParticipantId: input.targetParticipantId,
        direction: input.axis,
        allowedInformationTypes: [...input.informationTypes],
        enabled: input.enabled,
      });
    }
    return project(stormFireInformationRelationships.list().find((relationship) => relationship.id === id)!);
  }

  list(): StormFireInformationRelationshipProjection[] { return stormFireInformationRelationships.list().map(project); }

  forParticipant(participantId: string): StormFireInformationRelationshipProjection[] {
    return this.list().filter((relationship) => relationship.sourceParticipantId === participantId || relationship.targetParticipantId === participantId);
  }

  remove(id: string): boolean { return stormFireInformationRelationships.remove(id); }
}

export const stormFireRelationshipFabric = new RelationshipFabric();

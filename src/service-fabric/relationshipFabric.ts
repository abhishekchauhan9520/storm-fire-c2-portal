import { stormFireParticipants } from "./participantModel";

export type RelationshipAxis = "VERTICAL" | "HORIZONTAL" | "DIAGONAL";

export interface StormFireInformationRelationship {
  id: string;
  sourceParticipantId: string;
  targetParticipantId: string;
  axis: RelationshipAxis;
  informationTypes: string[];
  enabled: boolean;
}

class RelationshipFabric {
  private relationships = new Map<string, StormFireInformationRelationship>();

  establish(input: Omit<StormFireInformationRelationship, "id">): StormFireInformationRelationship {
    if (!stormFireParticipants.get(input.sourceParticipantId) || !stormFireParticipants.get(input.targetParticipantId)) {
      throw new Error("Both relationship participants must be registered.");
    }
    if (!input.informationTypes.length) throw new Error("Relationship requires at least one information type.");
    const relationship = { ...input, id: `${input.sourceParticipantId}:${input.axis}:${input.targetParticipantId}` };
    this.relationships.set(relationship.id, relationship);
    return relationship;
  }

  list(): StormFireInformationRelationship[] { return Array.from(this.relationships.values()); }

  forParticipant(participantId: string): StormFireInformationRelationship[] {
    return this.list().filter((r) => r.sourceParticipantId === participantId || r.targetParticipantId === participantId);
  }

  remove(id: string): boolean { return this.relationships.delete(id); }
}

export const stormFireRelationshipFabric = new RelationshipFabric();

stormFireRelationshipFabric.establish({
  sourceParticipantId: "operator-command",
  targetParticipantId: "operator-intel",
  axis: "HORIZONTAL",
  informationTypes: ["Observation", "Assessment", "Alert"],
  enabled: true,
});

stormFireRelationshipFabric.establish({
  sourceParticipantId: "operator-command",
  targetParticipantId: "uav-service",
  axis: "VERTICAL",
  informationTypes: ["Task", "Track", "Telemetry", "Alert"],
  enabled: true,
});

stormFireRelationshipFabric.establish({
  sourceParticipantId: "operator-intel",
  targetParticipantId: "logistics-service",
  axis: "DIAGONAL",
  informationTypes: ["Context", "Requirement", "Alert"],
  enabled: true,
});

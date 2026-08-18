import type { InformationRelationship, RelationshipDirection } from "../contracts/stormFireContracts";

export type StormFireRelationshipDirection = RelationshipDirection;
export type StormFireInformationRelationship = InformationRelationship;

export interface StormFireInformationPath {
  relationshipIds: string[];
  participantIds: string[];
  informationTypes: string[];
}

/** Resolves explicit information-sharing paths without assuming every participant is directly connected. */
export class InformationRelationshipEngine {
  private readonly relationships = new Map<string, StormFireInformationRelationship>();

  register(relationship: StormFireInformationRelationship): void {
    if (!relationship.id || !relationship.fromParticipantId || !relationship.toParticipantId) throw new Error("Relationship requires an id and both participants.");
    if (relationship.fromParticipantId === relationship.toParticipantId) throw new Error("Self relationships are not allowed.");
    if (this.relationships.has(relationship.id)) throw new Error(`Relationship ${relationship.id} already exists.`);
    this.relationships.set(relationship.id, {
      ...relationship,
      allowedInformationTypes: [...relationship.allowedInformationTypes],
    });
  }

  remove(id: string): boolean { return this.relationships.delete(id); }
  list(): StormFireInformationRelationship[] {
    return [...this.relationships.values()].map((relationship) => ({
      ...relationship,
      allowedInformationTypes: [...relationship.allowedInformationTypes],
    }));
  }

  pathsFrom(participantId: string, informationType: string, maxHops = 8): StormFireInformationPath[] {
    const paths: StormFireInformationPath[] = [];
    const visit = (current: string, participants: string[], relationshipIds: string[], depth: number) => {
      if (depth >= maxHops) return;
      for (const relationship of this.relationships.values()) {
        if (!relationship.enabled || relationship.fromParticipantId !== current) continue;
        if (!relationship.allowedInformationTypes.includes("*") && !relationship.allowedInformationTypes.includes(informationType)) continue;
        if (participants.includes(relationship.toParticipantId)) continue;
        const nextParticipants = [...participants, relationship.toParticipantId];
        const nextRelationships = [...relationshipIds, relationship.id];
        paths.push({ relationshipIds: nextRelationships, participantIds: nextParticipants, informationTypes: [informationType] });
        visit(relationship.toParticipantId, nextParticipants, nextRelationships, depth + 1);
      }
    };
    visit(participantId, [participantId], [], 0);
    return paths;
  }

  canShare(fromParticipantId: string, toParticipantId: string, informationType: string): boolean {
    return this.pathsFrom(fromParticipantId, informationType).some((path) => path.participantIds[path.participantIds.length - 1] === toParticipantId);
  }
}

export const stormFireInformationRelationships = new InformationRelationshipEngine();

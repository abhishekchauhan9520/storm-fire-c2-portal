export type InformationRelationshipType = "VERTICAL" | "HORIZONTAL" | "DIAGONAL";

export interface InformationRelationship {
  id: string;
  fromParticipantId: string;
  toParticipantId: string;
  type: InformationRelationshipType;
  informationTypes: string[];
  geographicScopeIds?: string[];
  enabled: boolean;
}

export class InformationRelationshipRegistry {
  private relationships = new Map<string, InformationRelationship>();

  add(relationship: InformationRelationship): void {
    if (!relationship.id || !relationship.fromParticipantId || !relationship.toParticipantId) throw new Error("Information relationship requires participants.");
    if (relationship.fromParticipantId === relationship.toParticipantId) throw new Error("Information relationship cannot connect a participant to itself.");
    if (this.relationships.has(relationship.id)) throw new Error(`Information relationship ${relationship.id} already exists.`);
    this.relationships.set(relationship.id, { ...relationship, informationTypes: [...relationship.informationTypes], ...(relationship.geographicScopeIds ? { geographicScopeIds: [...relationship.geographicScopeIds] } : {}) });
  }

  get(id: string): InformationRelationship | undefined {
    const value = this.relationships.get(id);
    return value ? { ...value, informationTypes: [...value.informationTypes], ...(value.geographicScopeIds ? { geographicScopeIds: [...value.geographicScopeIds] } : {}) } : undefined;
  }

  forParticipant(participantId: string): InformationRelationship[] {
    return [...this.relationships.values()].filter(r => r.enabled && (r.fromParticipantId === participantId || r.toParticipantId === participantId)).map(r => ({ ...r, informationTypes: [...r.informationTypes], ...(r.geographicScopeIds ? { geographicScopeIds: [...r.geographicScopeIds] } : {}) }));
  }

  allows(fromParticipantId: string, toParticipantId: string, informationType: string): boolean {
    return [...this.relationships.values()].some(r => r.enabled && r.fromParticipantId === fromParticipantId && r.toParticipantId === toParticipantId && (r.informationTypes.includes("*") || r.informationTypes.includes(informationType)));
  }
}

export const stormFireInformationRelationships = new InformationRelationshipRegistry();

import type { InformationRelationshipEngine } from "./informationRelationshipEngine";
import { stormFireInformationRelationships } from "./informationRelationshipEngine";

export interface InformationPolicy {
  id: string;
  informationTypes: string[];
  allowedRecipientParticipants?: string[];
  deniedRecipientParticipants?: string[];
  geographicScopeIds?: string[];
  enabled: boolean;
}

/** Workflow-level policy configuration; relationship authority remains canonical in InformationRelationshipEngine. */
export class InformationPolicyRegistry {
  private policies = new Map<string, InformationPolicy>();

  add(policy: InformationPolicy): void {
    if (!policy.id || !policy.informationTypes.length) throw new Error("Information policy requires id and information types.");
    this.policies.set(policy.id, { ...policy, informationTypes: [...policy.informationTypes] });
  }

  canDeliver(
    policyIds: string[],
    participantId: string,
    informationType: string,
    scopeIds: string[] = [],
    relationships: InformationRelationshipEngine = stormFireInformationRelationships,
    producerParticipantId?: string,
  ): boolean {
    const candidates = policyIds.map((id) => this.policies.get(id)).filter((p): p is InformationPolicy => Boolean(p && p.enabled));
    if (!candidates.length) return false;

    return candidates.some((policy) => {
      if (!policy.informationTypes.includes("*") && !policy.informationTypes.includes(informationType)) return false;
      if (policy.deniedRecipientParticipants?.includes(participantId)) return false;
      if (policy.allowedRecipientParticipants && !policy.allowedRecipientParticipants.includes(participantId)) return false;
      if (policy.geographicScopeIds?.length && !policy.geographicScopeIds.some((id) => scopeIds.includes(id))) return false;
      if (relationships && producerParticipantId && !relationships.canShare(producerParticipantId, participantId, informationType)) return false;
      return true;
    });
  }
}

export const stormFireInformationPolicies = new InformationPolicyRegistry();

import { stormFireParticipantContexts } from "./participantContext";
import { stormFireServiceFabric } from "../service-fabric/serviceFabric";

export interface StormFireCopContext {
  participantId: string;
  organizationIds: string[];
  serviceIds: string[];
  activeServiceIds: string[];
  geographicScopeIds: string[];
  informationRelationshipIds: string[];
  workspaceIds: string[];
}

/** Resolves a participant's operational environment from policy/context instead of hard-coded echelon-specific COPs. */
export function resolveStormFireCopContext(participantId: string): StormFireCopContext | undefined {
  const context = stormFireParticipantContexts.resolve(participantId);
  if (!context) return undefined;
  const activeServiceIds = context.serviceIds.filter(id => stormFireServiceFabric.get(id)?.status === "ACTIVE");
  return {
    participantId,
    organizationIds: [...context.organizationIds],
    serviceIds: [...context.serviceIds],
    activeServiceIds,
    geographicScopeIds: [...context.geographicScopeIds],
    informationRelationshipIds: [...context.informationRelationshipIds],
    workspaceIds: [...context.workspaceIds],
  };
}

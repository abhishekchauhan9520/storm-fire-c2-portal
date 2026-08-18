import { stormFireParticipantContexts } from "./participantContext";
import { stormFireServiceFabric } from "../service-fabric/serviceFabric";
import { stormFireInformationRelationships, type StormFireInformationPath } from "./informationRelationshipEngine";

export interface StormFireCopContext {
  participantId: string;
  organizationIds: string[];
  serviceIds: string[];
  activeServiceIds: string[];
  geographicScopeIds: string[];
  informationRelationshipIds: string[];
  workspaceIds: string[];
  informationTypes: string[];
  informationPaths: StormFireInformationPath[];
}

/** Resolves a participant-specific operational environment and reachable information paths. */
export function resolveStormFireCopContext(participantId: string): StormFireCopContext | undefined {
  const context = stormFireParticipantContexts.resolve(participantId);
  if (!context) return undefined;
  const activeServices = context.serviceIds.map((id) => stormFireServiceFabric.get(id)).filter((service): service is NonNullable<typeof service> => service?.status === "ACTIVE");
  const informationTypes = new Set<string>();
  for (const service of activeServices) {
    for (const type of service.informationTypesProduced) informationTypes.add(type);
    for (const type of service.informationTypesConsumed) informationTypes.add(type);
  }
  const informationPaths: StormFireInformationPath[] = [];
  for (const informationType of informationTypes) informationPaths.push(...stormFireInformationRelationships.pathsFrom(participantId, informationType));
  return { participantId, organizationIds: [...context.organizationIds], serviceIds: [...context.serviceIds], activeServiceIds: activeServices.map((service) => service.id), geographicScopeIds: [...context.geographicScopeIds], informationRelationshipIds: [...context.informationRelationshipIds], workspaceIds: [...context.workspaceIds], informationTypes: [...informationTypes], informationPaths };
}

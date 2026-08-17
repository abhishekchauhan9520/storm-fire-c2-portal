import { stormFireServiceRegistry, type StormFireParticipantServiceContext, type StormFireServiceDefinition } from "./serviceRegistry";

export interface StormFireParticipantOperationalContext extends StormFireParticipantServiceContext {
  organizationId: string;
  roleId: string;
  geographicScopeIds: string[];
  relationshipIds: string[];
  informationClassification?: string;
}

export interface StormFireResolvedOperationalContext {
  participantId: string;
  organizationId: string;
  roleId: string;
  geographicScopeIds: string[];
  relationshipIds: string[];
  informationClassification?: string;
  services: StormFireServiceDefinition[];
}

export function resolveParticipantOperationalContext(context: StormFireParticipantOperationalContext): StormFireResolvedOperationalContext {
  if (!context.participantId || !context.organizationId || !context.roleId) throw new Error("Participant operational context requires participant, organization and role.");
  return { participantId: context.participantId, organizationId: context.organizationId, roleId: context.roleId, geographicScopeIds: [...context.geographicScopeIds], relationshipIds: [...context.relationshipIds], informationClassification: context.informationClassification, services: stormFireServiceRegistry.resolveForParticipant(context) };
}

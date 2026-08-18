import type { StormFireResolvedOperationalContext } from "./participantOperationalContext";
import { evaluateStormFireInformationVisibility, type StormFireInformationVisibilityContext } from "./informationVisibility";

export interface StormFireOperationalInformation<T = unknown> extends StormFireInformationVisibilityContext {
  id: string;
  occurredAt: string;
  payload: T;
  producerParticipantId?: string;
}

export interface StormFireDynamicCop<T = unknown> {
  participantId: string;
  organizationIds: string[];
  roleIds: string[];
  organizationId: string;
  roleId: string;
  geographicScopeIds: string[];
  serviceIds: string[];
  information: Array<StormFireOperationalInformation<T>>;
  generatedAt: string;
}

export function resolveStormFireDynamicCop<T>(
  context: StormFireResolvedOperationalContext,
  information: StormFireOperationalInformation<T>[],
  generatedAt: string,
): StormFireDynamicCop<T> {
  const visible = information.filter((item) => evaluateStormFireInformationVisibility(context, item).allowed);
  return {
    participantId: context.participantId,
    organizationIds: [...context.organizationIds],
    roleIds: [...context.roleIds],
    organizationId: context.organizationId,
    roleId: context.roleId,
    geographicScopeIds: [...context.geographicScopeIds],
    serviceIds: context.services.map((service) => service.id),
    information: visible,
    generatedAt,
  };
}

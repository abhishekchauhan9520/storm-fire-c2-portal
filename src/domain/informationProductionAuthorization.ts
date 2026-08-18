import { stormFireAuthorization } from "./authorizationPolicy";
import type { CanonicalOperationalObject } from "../types";
import type { StormFireResolvedOperationalContext } from "./participantOperationalContext";

export interface InformationProductionDecision {
  allowed: boolean;
  serviceIds: string[];
  matchedPolicyIds: string[];
  reason: string;
}

/** Resolve all participant service paths capable of producing a specific information type. */
export function authorizeInformationProduction(
  context: StormFireResolvedOperationalContext,
  object: CanonicalOperationalObject,
): InformationProductionDecision {
  const serviceIds = context.services
    .filter((service) => service.status === "ACTIVE" || service.status === "REGISTERED")
    .filter((service) => service.informationTypesProduced.includes(object.kind))
    .map((service) => service.id);

  if (serviceIds.length === 0) {
    return {
      allowed: false,
      serviceIds: [],
      matchedPolicyIds: [],
      reason: "Participant has no active canonical service capable of producing this information type.",
    };
  }

  const decisions = serviceIds.map((serviceId) => stormFireAuthorization.decide({
    requestId: `produce:${context.participantId}:${object.id}:${serviceId}`,
    participantId: context.participantId,
    informationType: object.kind,
    serviceId,
    organizationIds: context.organizationIds,
    roleIds: context.roleIds,
    relationshipIds: context.relationshipIds,
    geographicScopeIds: context.geographicScopeIds,
    classification: object.classification,
  }));

  const authorizedServiceIds = decisions
    .map((decision, index) => (decision.allowed ? serviceIds[index] : undefined))
    .filter((serviceId): serviceId is string => Boolean(serviceId));
  const matchedPolicyIds = [...new Set(
    decisions
      .filter((decision) => decision.allowed)
      .flatMap((decision) => decision.matchedRuleIds),
  )];

  return {
    allowed: authorizedServiceIds.length > 0,
    serviceIds: authorizedServiceIds,
    matchedPolicyIds,
    reason: authorizedServiceIds.length > 0
      ? "Information production authorized through at least one canonical service path."
      : "No canonical service production policy authorizes this information type.",
  };
}

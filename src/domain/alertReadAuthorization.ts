import type { PolicyEffect } from "../contracts/stormFireContracts";
import { stormFireAuthorization } from "./authorizationPolicy";
import { resolveParticipantOperationalContext } from "./participantOperationalContext";
import type { CanonicalOperationalObject, OperationalAlert } from "../types";

export interface AlertReadDecision {
  allowed: boolean;
  reason: string;
  matchedPolicyIds: string[];
}

function eligibleServiceIds(
  requestedServiceId: string | undefined,
  informationType: string,
  services: { id: string; informationTypesConsumed: string[]; informationTypesProduced: string[] }[],
): string[] {
  if (requestedServiceId) return [requestedServiceId];
  return services
    .filter((service) => service.informationTypesConsumed.includes(informationType) || service.informationTypesProduced.includes(informationType))
    .map((service) => service.id);
}

/**
 * Canonical read-side alert authorization. Alert recipient lists are treated
 * as dissemination evidence, not as an independent source of authority.
 */
export function authorizeAlertRead(
  participantId: string,
  alert: OperationalAlert,
  informationObject: CanonicalOperationalObject,
  serviceId?: string,
): AlertReadDecision {
  if (!alert.recipients.includes(participantId)) {
    return { allowed: false, reason: "Participant is not a recorded alert recipient.", matchedPolicyIds: [] };
  }

  const context = resolveParticipantOperationalContext(participantId);
  if (serviceId && !context.services.some((service) => service.id === serviceId)) {
    return { allowed: false, reason: "Participant context does not contain the requested alert service.", matchedPolicyIds: [] };
  }

  const serviceIds = eligibleServiceIds(serviceId, informationObject.kind, context.services);
  const candidateServiceIds: Array<string | undefined> = serviceIds.length > 0 ? serviceIds : [undefined];
  const decisions = candidateServiceIds.map((resolvedServiceId) => stormFireAuthorization.decide({
    requestId: `alert-read-${alert.id}-${participantId}${resolvedServiceId ? `-${resolvedServiceId}` : ""}`,
    participantId,
    informationType: informationObject.kind,
    serviceId: resolvedServiceId,
    organizationIds: context.organizationIds,
    roleIds: context.roleIds,
    relationshipIds: context.relationshipIds,
    geographicScopeIds: context.geographicScopeIds,
    classification: informationObject.classification,
  }));

  const matchedPolicyIds = [...new Set(decisions.flatMap((decision) => decision.matchedRuleIds))];
  const allowed = decisions.some((decision) => decision.accessDecision.effect === ("ALLOW" as PolicyEffect));
  return {
    allowed,
    reason: allowed ? decisions.find((decision) => decision.allowed)?.accessDecision.reason ?? "Authorized service path." : decisions[0]?.accessDecision.reason ?? "No matching policy; default deny.",
    matchedPolicyIds,
  };
}

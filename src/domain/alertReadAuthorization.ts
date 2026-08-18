import { stormFireAuthorization } from "./authorizationPolicy";
import { resolveParticipantOperationalContext } from "./participantOperationalContext";
import type { CanonicalOperationalObject, OperationalAlert } from "../types";

export interface AlertReadDecision {
  allowed: boolean;
  reason: string;
  matchedPolicyIds: string[];
}

function resolveRecipientServiceId(
  requestedServiceId: string | undefined,
  informationType: string,
  services: { id: string; informationTypesConsumed: string[]; informationTypesProduced: string[] }[],
): string | undefined {
  if (requestedServiceId) return requestedServiceId;
  return services.find((service) =>
    service.informationTypesConsumed.includes(informationType) ||
    service.informationTypesProduced.includes(informationType),
  )?.id;
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

  const resolvedServiceId = resolveRecipientServiceId(serviceId, informationObject.kind, context.services);
  const decision = stormFireAuthorization.decide({
    requestId: `alert-read-${alert.id}-${participantId}`,
    participantId,
    informationType: informationObject.kind,
    serviceId: resolvedServiceId,
    organizationIds: context.organizationIds,
    roleIds: context.roleIds,
    relationshipIds: context.relationshipIds,
    geographicScopeIds: context.geographicScopeIds,
    classification: informationObject.classification,
  });

  return {
    allowed: decision.allowed,
    reason: decision.accessDecision.reason,
    matchedPolicyIds: [...decision.matchedRuleIds],
  };
}

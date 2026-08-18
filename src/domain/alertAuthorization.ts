import type { PolicyEffect } from "../contracts/stormFireContracts";
import { stormFireAuthorization } from "./authorizationPolicy";
import { resolveParticipantOperationalContext } from "./participantOperationalContext";
import type { CanonicalOperationalObject } from "../types";

export interface AlertAuthorizationRequest {
  issuerParticipantId: string;
  recipientParticipantIds: string[];
  informationObject: CanonicalOperationalObject;
  serviceId?: string;
}

export interface AlertAuthorizationResult {
  allowedRecipientIds: string[];
  deniedRecipientIds: string[];
  matchedPolicyIds: Record<string, string[]>;
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
 * Alert dissemination authority is reconstructed from canonical participant
 * context and backend policy. The caller cannot grant itself recipient access
 * by supplying role, organization, relationship, geography, or classification
 * claims in the alert payload.
 */
export function authorizeAlertDissemination(request: AlertAuthorizationRequest): AlertAuthorizationResult {
  const recipients = [...new Set(request.recipientParticipantIds)].filter(Boolean);
  if (recipients.length === 0) throw new Error("Alert requires at least one recipient participant.");

  const issuerContext = resolveParticipantOperationalContext(request.issuerParticipantId);
  if (request.serviceId && !issuerContext.services.some((service) => service.id === request.serviceId)) {
    throw new Error(`Service ${request.serviceId} is not active in the authenticated participant context.`);
  }

  const matchedPolicyIds: Record<string, string[]> = {};
  const deniedRecipientIds: string[] = [];
  const allowedRecipientIds: string[] = [];

  for (const recipientId of recipients) {
    const recipientContext = resolveParticipantOperationalContext(recipientId);
    const serviceIds = eligibleServiceIds(request.serviceId, request.informationObject.kind, recipientContext.services);
    const candidateServiceIds: Array<string | undefined> = serviceIds.length > 0 ? serviceIds : [undefined];
    const decisions = candidateServiceIds.map((serviceId) => stormFireAuthorization.decide({
      requestId: `alert-${request.informationObject.id}-${recipientId}${serviceId ? `-${serviceId}` : ""}`,
      participantId: recipientId,
      informationType: request.informationObject.kind,
      serviceId,
      organizationIds: recipientContext.organizationIds,
      roleIds: recipientContext.roleIds,
      relationshipIds: recipientContext.relationshipIds,
      geographicScopeIds: recipientContext.geographicScopeIds,
      classification: request.informationObject.classification,
    }));

    matchedPolicyIds[recipientId] = [...new Set(decisions.flatMap((decision) => decision.matchedRuleIds))];
    if (decisions.some((decision) => decision.accessDecision.effect === ("ALLOW" as PolicyEffect))) allowedRecipientIds.push(recipientId);
    else deniedRecipientIds.push(recipientId);
  }

  return { allowedRecipientIds, deniedRecipientIds, matchedPolicyIds };
}

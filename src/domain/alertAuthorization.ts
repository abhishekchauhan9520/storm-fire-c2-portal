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

function resolveRecipientServiceId(
  requestedServiceId: string | undefined,
  informationType: string,
  serviceIds: { id: string; informationTypesConsumed: string[]; informationTypesProduced: string[] }[],
): string | undefined {
  if (requestedServiceId) return requestedServiceId;
  return serviceIds.find((service) =>
    service.informationTypesConsumed.includes(informationType) ||
    service.informationTypesProduced.includes(informationType),
  )?.id;
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
    const serviceId = resolveRecipientServiceId(request.serviceId, request.informationObject.kind, recipientContext.services);
    const decision = stormFireAuthorization.decide({
      requestId: `alert-${request.informationObject.id}-${recipientId}`,
      participantId: recipientId,
      informationType: request.informationObject.kind,
      serviceId,
      organizationIds: recipientContext.organizationIds,
      roleIds: recipientContext.roleIds,
      relationshipIds: recipientContext.relationshipIds,
      geographicScopeIds: recipientContext.geographicScopeIds,
      classification: request.informationObject.classification,
    });

    matchedPolicyIds[recipientId] = [...decision.matchedRuleIds];
    if (decision.accessDecision.effect === ("ALLOW" as PolicyEffect)) allowedRecipientIds.push(recipientId);
    else deniedRecipientIds.push(recipientId);
  }

  return { allowedRecipientIds, deniedRecipientIds, matchedPolicyIds };
}

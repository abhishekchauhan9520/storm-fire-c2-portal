import { stormFireInformationAccess } from "./informationAccessResolver";
import { stormFireGeographicScopes, type StormFireScopePoint } from "./geographicScopeEngine";
import { stormFireAuthorization } from "./authorizationPolicy";
import type { InformationClassification } from "../contracts/stormFireContracts";
import type { StormFireResolvedOperationalContext } from "./participantOperationalContext";

export interface StormFireInformationVisibilityContext {
  id?: string;
  informationType: string;
  organizationId: string;
  geographicScopeId?: string;
  informationPoint?: StormFireScopePoint;
  relationshipId?: string;
  classification?: InformationClassification;
}

export interface StormFireVisibilityDecision { allowed: boolean; reasons: string[]; }

/**
 * COP visibility combines relationship reachability, geometric scope when
 * coordinates are available, and the canonical server-side authorization decision.
 * A participant may consume the same information through multiple services, so
 * every eligible canonical service path is evaluated before denying visibility.
 */
export function evaluateStormFireInformationVisibility(
  context: StormFireResolvedOperationalContext,
  information: StormFireInformationVisibilityContext & { producerParticipantId?: string },
): StormFireVisibilityDecision {
  const eligibleServices = context.services.filter((candidate) =>
    candidate.informationTypesConsumed.includes(information.informationType) ||
    candidate.informationTypesProduced.includes(information.informationType),
  );

  if (eligibleServices.length === 0) {
    return { allowed: false, reasons: ["Participant has no eligible canonical service for this information type."] };
  }

  const sameOrganization = context.organizationIds.includes(information.organizationId);
  const relationshipAllowed = Boolean(information.relationshipId && context.relationshipIds.includes(information.relationshipId));
  if (!sameOrganization && !relationshipAllowed) {
    return { allowed: false, reasons: ["Information is outside the participant organizational and relationship context."] };
  }

  if (information.geographicScopeId && information.informationPoint) {
    if (information.producerParticipantId && information.producerParticipantId !== context.participantId) {
      const geographic = stormFireInformationAccess.decide({
        sourceParticipantId: information.producerParticipantId,
        recipientParticipantId: context.participantId,
        informationType: information.informationType,
        geographicScopeId: information.geographicScopeId,
        informationPoint: information.informationPoint,
      });
      if (!geographic.allowed) return { allowed: false, reasons: [`GEOGRAPHIC_${geographic.reason}`] };
    } else if (!stormFireGeographicScopes.contains(information.geographicScopeId, information.informationPoint)) {
      return { allowed: false, reasons: ["Information point is outside the declared geographic scope."] };
    }
  } else if (information.geographicScopeId && !context.geographicScopeIds.includes(information.geographicScopeId)) {
    return { allowed: false, reasons: ["Information is outside the participant geographic scope."] };
  }

  if (information.classification && context.informationClassification && information.classification !== context.informationClassification) {
    return { allowed: false, reasons: ["Information classification does not match participant context."] };
  }

  const decisions = eligibleServices.map((service) => stormFireAuthorization.decide({
    requestId: `cop:${context.participantId}:${information.id ?? information.informationType}:${service.id}`,
    participantId: context.participantId,
    informationType: information.informationType,
    serviceId: service.id,
    organizationIds: [information.organizationId],
    roleIds: context.roleIds,
    relationshipIds: information.relationshipId ? [information.relationshipId] : context.relationshipIds,
    geographicScopeIds: information.geographicScopeId ? [information.geographicScopeId] : context.geographicScopeIds,
    classification: information.classification,
  }));

  const authorized = decisions.filter((decision) => decision.allowed);
  if (authorized.length === 0) {
    const policyReasons = decisions.flatMap((decision) => [
      `POLICY_${decision.reason}`,
      decision.accessDecision.reason,
    ]);
    return { allowed: false, reasons: [...new Set(policyReasons)] };
  }

  const authorizedServices = eligibleServices.filter((_service, index) => decisions[index].allowed);
  const matchedPolicies = [...new Set(authorized.flatMap((decision) => decision.accessDecision.matchedPolicyIds))];
  const reasons: string[] = [];
  reasons.push(sameOrganization ? `Visible within ${information.organizationId} organizational context.` : `Visible through ${information.relationshipId} information relationship.`);
  if (information.geographicScopeId) reasons.push(`Geographic scope: ${information.geographicScopeId}.`);
  reasons.push(`Eligible through ${authorizedServices.map((service) => service.id).join(", ")} service path(s).`);
  reasons.push(`Authorized by ${matchedPolicies.join(", ") || "policy"}.`);
  return { allowed: true, reasons };
}

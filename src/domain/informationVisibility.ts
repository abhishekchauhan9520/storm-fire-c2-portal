import { stormFireInformationAccess, type StormFireScopePoint } from "./informationAccessResolver";
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
 * COP visibility combines relationship/geographic reachability with the
 * canonical server-side authorization decision. Geometry is evaluated when an
 * actual information point is available; scope IDs remain contextual metadata.
 */
export function evaluateStormFireInformationVisibility(
  context: StormFireResolvedOperationalContext,
  information: StormFireInformationVisibilityContext & { producerParticipantId?: string },
): StormFireVisibilityDecision {
  const reasons: string[] = [];
  const service = context.services.find((candidate) =>
    candidate.informationTypesConsumed.includes(information.informationType) ||
    candidate.informationTypesProduced.includes(information.informationType),
  );

  if (!service) return { allowed: false, reasons: ["Participant has no eligible canonical service for this information type."] };

  const sameOrganization = context.organizationIds.includes(information.organizationId);
  const relationshipAllowed = Boolean(information.relationshipId && context.relationshipIds.includes(information.relationshipId));
  if (!sameOrganization && !relationshipAllowed) return { allowed: false, reasons: ["Information is outside the participant organizational and relationship context."] };

  if (information.geographicScopeId && information.informationPoint) {
    const geographic = stormFireInformationAccess.decide({
      sourceParticipantId: information.producerParticipantId ?? information.organizationId,
      recipientParticipantId: context.participantId,
      informationType: information.informationType,
      geographicScopeId: information.geographicScopeId,
      informationPoint: information.informationPoint,
    });
    if (!geographic.allowed) return { allowed: false, reasons: [`GEOGRAPHIC_${geographic.reason}`] };
  } else if (information.geographicScopeId && !context.geographicScopeIds.includes(information.geographicScopeId)) {
    return { allowed: false, reasons: ["Information is outside the participant geographic scope."] };
  }

  const policy = stormFireAuthorization.decide({
    requestId: `cop:${context.participantId}:${information.id ?? information.informationType}:${service.id}`,
    participantId: context.participantId,
    informationType: information.informationType,
    serviceId: service.id,
    organizationIds: [information.organizationId],
    roleIds: context.roleIds,
    relationshipIds: information.relationshipId ? [information.relationshipId] : context.relationshipIds,
    geographicScopeIds: information.geographicScopeId ? [information.geographicScopeId] : context.geographicScopeIds,
    classification: information.classification,
  });

  if (!policy.allowed) return { allowed: false, reasons: [`POLICY_${policy.reason}`, policy.accessDecision.reason] };
  if (information.classification && context.informationClassification && information.classification !== context.informationClassification) return { allowed: false, reasons: ["Information classification does not match participant context."] };

  reasons.push(sameOrganization ? `Visible within ${information.organizationId} organizational context.` : `Visible through ${information.relationshipId} information relationship.`);
  if (information.geographicScopeId) reasons.push(`Geographic scope: ${information.geographicScopeId}.`);
  reasons.push(`Eligible through ${service.id} service.`);
  reasons.push(`Authorized by ${policy.accessDecision.matchedPolicyIds.join(", ") || "policy"}.`);
  return { allowed: true, reasons };
}

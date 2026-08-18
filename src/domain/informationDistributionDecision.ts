import { stormFireAuthorization } from "./authorizationPolicy";
import { stormFireInformationAccess } from "./informationAccessResolver";
import type { StormFireScopePoint } from "./geographicScopeEngine";
import type { InformationClassification } from "../contracts/stormFireContracts";

export interface StormFireDistributionRequest { sourceParticipantId: string; recipientParticipantId: string; informationType: string; serviceId: string; geographicScopeId?: string; informationPoint?: StormFireScopePoint; classification?: InformationClassification; relationshipIds?: string[]; organizationIds?: string[]; roleIds?: string[]; }
export interface StormFireDistributionDecision { allowed: boolean; relationshipAllowed: boolean; authorizationAllowed: boolean; geographicScopeAllowed: boolean; reasons: string[]; }

/** Final pre-fabric dissemination gate: relationship + geography + policy. */
export function decideStormFireInformationDistribution(request: StormFireDistributionRequest): StormFireDistributionDecision {
  const access = stormFireInformationAccess.decide(request);
  const authorization = stormFireAuthorization.decide({
    requestId: `distribution:${request.sourceParticipantId}:${request.recipientParticipantId}:${request.informationType}`,
    participantId: request.recipientParticipantId,
    informationType: request.informationType,
    serviceId: request.serviceId,
    classification: request.classification,
    relationshipIds: request.relationshipIds,
    organizationIds: request.organizationIds,
    roleIds: request.roleIds,
    geographicScopeIds: request.geographicScopeId ? [request.geographicScopeId] : undefined,
  });
  const geographicScopeAllowed = access.reason === "RELATIONSHIP_PATH";
  const reasons: string[] = [];
  if (!access.allowed) reasons.push(access.reason);
  if (!authorization.allowed) reasons.push(`AUTHORIZATION_${authorization.reason}`);
  return { allowed: access.allowed && authorization.allowed, relationshipAllowed: access.paths.length > 0, authorizationAllowed: authorization.allowed, geographicScopeAllowed, reasons };
}

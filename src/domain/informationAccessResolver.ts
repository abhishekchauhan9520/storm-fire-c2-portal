import type { StormFireInformationPath } from "./informationRelationshipEngine";
import { stormFireInformationRelationships } from "./informationRelationshipEngine";
import { stormFireGeographicScopes, type StormFireScopePoint } from "./geographicScopeEngine";

export interface StormFireAccessRequest { sourceParticipantId: string; recipientParticipantId: string; informationType: string; geographicScopeId?: string; informationPoint?: StormFireScopePoint; }
export interface StormFireAccessDecision { allowed: boolean; reason: "RELATIONSHIP_PATH" | "NO_RELATIONSHIP_PATH" | "GEOGRAPHIC_SCOPE_REQUIRED" | "OUTSIDE_GEOGRAPHIC_SCOPE"; paths: StormFireInformationPath[]; }

/** Combines declared relationship paths with geographic scope evaluation. Authorization remains a separate policy layer. */
export class InformationAccessResolver {
  decide(request: StormFireAccessRequest): StormFireAccessDecision {
    const paths = stormFireInformationRelationships.pathsFrom(request.sourceParticipantId, request.informationType).filter(path => path.participantIds[path.participantIds.length - 1] === request.recipientParticipantId);
    if (paths.length === 0) return { allowed: false, reason: "NO_RELATIONSHIP_PATH", paths: [] };
    if (!request.geographicScopeId) return { allowed: false, reason: "GEOGRAPHIC_SCOPE_REQUIRED", paths };
    if (!request.informationPoint || !stormFireGeographicScopes.contains(request.geographicScopeId, request.informationPoint)) return { allowed: false, reason: "OUTSIDE_GEOGRAPHIC_SCOPE", paths };
    return { allowed: true, reason: "RELATIONSHIP_PATH", paths };
  }
}

export const stormFireInformationAccess = new InformationAccessResolver();

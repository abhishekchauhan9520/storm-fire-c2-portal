import type { StormFireInformationPath } from "./informationRelationshipEngine";
import { stormFireInformationRelationships } from "./informationRelationshipEngine";

export interface StormFireAccessRequest { sourceParticipantId: string; recipientParticipantId: string; informationType: string; geographicScopeId?: string; }
export interface StormFireAccessDecision { allowed: boolean; reason: "RELATIONSHIP_PATH" | "NO_RELATIONSHIP_PATH" | "GEOGRAPHIC_SCOPE_UNSPECIFIED"; paths: StormFireInformationPath[]; }

/** Resolves declared information paths. Authorization and geographic policy remain separate concerns. */
export class InformationAccessResolver {
  decide(request: StormFireAccessRequest): StormFireAccessDecision {
    const paths = stormFireInformationRelationships.pathsFrom(request.sourceParticipantId, request.informationType).filter(path => path.participantIds[path.participantIds.length - 1] === request.recipientParticipantId);
    if (paths.length === 0) return { allowed: false, reason: "NO_RELATIONSHIP_PATH", paths: [] };
    if (request.geographicScopeId === undefined) return { allowed: true, reason: "GEOGRAPHIC_SCOPE_UNSPECIFIED", paths };
    return { allowed: true, reason: "RELATIONSHIP_PATH", paths };
  }
}

export const stormFireInformationAccess = new InformationAccessResolver();

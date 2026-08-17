import type { StormFireResolvedOperationalContext } from "./participantOperationalContext";

export interface StormFireInformationVisibilityContext { informationType: string; organizationId: string; geographicScopeId?: string; relationshipId?: string; classification?: string; }
export interface StormFireVisibilityDecision { allowed: boolean; reasons: string[]; }

export function evaluateStormFireInformationVisibility(context: StormFireResolvedOperationalContext, information: StormFireInformationVisibilityContext): StormFireVisibilityDecision {
  const reasons: string[] = [];
  const service = context.services.find(candidate => candidate.informationTypes.includes(information.informationType));
  if (!service) return { allowed: false, reasons: ["Participant has no eligible service for this information type."] };
  if (information.geographicScopeId && !context.geographicScopeIds.includes(information.geographicScopeId)) return { allowed: false, reasons: ["Information is outside the participant geographic scope."] };
  if (information.relationshipId && !context.relationshipIds.includes(information.relationshipId)) return { allowed: false, reasons: ["Participant has no authorized information relationship for this item."] };
  if (information.classification && context.informationClassification && information.classification !== context.informationClassification) return { allowed: false, reasons: ["Information classification does not match participant context."] };
  reasons.push(`Visible through ${service.id} service.`);
  return { allowed: true, reasons };
}

export type StormFireDecisionEffect = "ALLOW" | "DENY";

export interface StormFireAuthorizationRequest { participantId: string; informationType: string; serviceId: string; classification?: string; }
export interface StormFireAuthorizationRule { id: string; participantIds?: string[]; serviceIds?: string[]; informationTypes?: string[]; classifications?: string[]; effect: StormFireDecisionEffect; priority: number; enabled: boolean; }
export interface StormFireAuthorizationDecision { allowed: boolean; matchedRuleIds: string[]; reason: "ALLOW_RULE" | "DENY_RULE" | "NO_MATCH"; }

/** Explicit entitlement policy. Default is deny when no rule matches. */
export class AuthorizationPolicyEngine {
  private readonly rules = new Map<string, StormFireAuthorizationRule>();
  register(rule: StormFireAuthorizationRule): void { if (!rule.id) throw new Error("Authorization rule requires an id."); if (this.rules.has(rule.id)) throw new Error(`Authorization rule ${rule.id} already exists.`); this.rules.set(rule.id, { ...rule }); }
  decide(request: StormFireAuthorizationRequest): StormFireAuthorizationDecision {
    const matches = [...this.rules.values()].filter(rule => rule.enabled).filter(rule => this.matches(rule.participantIds, request.participantId)).filter(rule => this.matches(rule.serviceIds, request.serviceId)).filter(rule => this.matches(rule.informationTypes, request.informationType)).filter(rule => this.matches(rule.classifications, request.classification)).sort((a, b) => b.priority - a.priority);
    if (matches.length === 0) return { allowed: false, matchedRuleIds: [], reason: "NO_MATCH" };
    const winner = matches[0];
    return { allowed: winner.effect === "ALLOW", matchedRuleIds: matches.map(rule => rule.id), reason: winner.effect === "ALLOW" ? "ALLOW_RULE" : "DENY_RULE" };
  }
  private matches(values: string[] | undefined, value: string | undefined): boolean { if (!values || values.length === 0) return true; if (!value) return false; return values.includes("*") || values.includes(value); }
}

export const stormFireAuthorization = new AuthorizationPolicyEngine();

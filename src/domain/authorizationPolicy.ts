import type { AccessDecision, InformationClassification, Policy } from "../contracts/stormFireContracts";

export interface StormFireAuthorizationRequest {
  requestId: string;
  participantId: string;
  informationType: string;
  serviceId?: string;
  organizationIds?: string[];
  roleIds?: string[];
  relationshipIds?: string[];
  geographicScopeIds?: string[];
  classification?: InformationClassification;
}

export type StormFireAuthorizationRule = Policy;

export interface StormFireAuthorizationDecision {
  allowed: boolean;
  matchedRuleIds: string[];
  reason: "ALLOW_RULE" | "DENY_RULE" | "NO_MATCH";
  accessDecision: AccessDecision;
}

/** Backend/platform authorization. Default deny; client claims are never authoritative. */
export class AuthorizationPolicyEngine {
  private readonly rules = new Map<string, Policy>();

  register(rule: Policy): void {
    if (!rule.id) throw new Error("Authorization rule requires an id.");
    if (this.rules.has(rule.id)) throw new Error(`Authorization rule ${rule.id} already exists.`);
    this.rules.set(rule.id, { ...rule });
  }

  get(id: string): Policy | undefined {
    const rule = this.rules.get(id);
    return rule ? { ...rule } : undefined;
  }

  decide(request: StormFireAuthorizationRequest): StormFireAuthorizationDecision {
    const matches = [...this.rules.values()]
      .filter((rule) => rule.enabled)
      .filter((rule) => this.matches(rule.participantIds, request.participantId))
      .filter((rule) => this.matches(rule.serviceIds, request.serviceId))
      .filter((rule) => this.intersects(rule.organizationIds, request.organizationIds))
      .filter((rule) => this.intersects(rule.roleIds, request.roleIds))
      .filter((rule) => this.intersects(rule.relationshipIds, request.relationshipIds))
      .filter((rule) => this.intersects(rule.informationTypes, [request.informationType]))
      .filter((rule) => this.intersects(rule.geographicScopeIds, request.geographicScopeIds))
      .filter((rule) => this.intersects(rule.classifications, request.classification ? [request.classification] : undefined))
      .sort((a, b) => b.priority - a.priority);

    const winner = matches[0];
    const effect = winner?.effect ?? "DENY";
    const decidedAt = new Date().toISOString();
    const accessDecision: AccessDecision = {
      requestId: request.requestId,
      effect,
      participantId: request.participantId,
      informationType: request.informationType,
      matchedPolicyIds: matches.map((rule) => rule.id),
      reason: winner ? `Matched policy ${winner.id}` : "No matching policy; default deny.",
      decidedAt,
    };

    return {
      allowed: effect === "ALLOW",
      matchedRuleIds: matches.map((rule) => rule.id),
      reason: winner ? (effect === "ALLOW" ? "ALLOW_RULE" : "DENY_RULE") : "NO_MATCH",
      accessDecision,
    };
  }

  list(): Policy[] { return [...this.rules.values()].map((rule) => ({ ...rule })); }
  clear(): void { this.rules.clear(); }

  private matches(values: string[] | undefined, value: string | undefined): boolean {
    if (!values || values.length === 0) return true;
    if (!value) return false;
    return values.includes("*") || values.includes(value);
  }

  private intersects(values: string[] | undefined, requested: string[] | undefined): boolean {
    if (!values || values.length === 0) return true;
    if (!requested || requested.length === 0) return false;
    return values.includes("*") || requested.some((value) => values.includes(value));
  }
}

export const stormFireAuthorization = new AuthorizationPolicyEngine();

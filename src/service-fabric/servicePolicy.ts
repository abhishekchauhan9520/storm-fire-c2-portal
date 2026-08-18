import type { StormFireServiceManifest } from "./serviceManifestAdapter";
import type { AlertPriority } from "./parallelAlertFabric";

/**
 * @deprecated Transitional compatibility contract only.
 *
 * Operational authorization is owned by src/domain/authorizationPolicy.ts.
 * This file is retained solely for legacy adapters that still exchange the
 * older service-policy shape; it must not be used as a second source of
 * operational authorization truth.
 */
export type ServiceAction =
  | "DISCOVER"
  | "CONSUME"
  | "CONTRIBUTE"
  | "RELATE"
  | "PUBLISH_EVENT"
  | "PARALLEL_ALERT";

export interface ServiceIdentity {
  serviceId: string;
  principal: string;
  roles: string[];
  trustLevel: "TRUSTED" | "RESTRICTED" | "QUARANTINED";
  issuedAt: string;
  expiresAt?: string;
}

export interface ServicePolicy {
  serviceId: string;
  allowedActions: ServiceAction[];
  allowedKinds?: string[];
  allowedRecipients?: string[];
  allowedAlertPriorities?: AlertPriority[];
}

export interface AuthorizationRequest {
  identity: ServiceIdentity;
  service: StormFireServiceManifest;
  action: ServiceAction;
  resourceKind?: string;
  recipient?: string;
  alertPriority?: AlertPriority;
}

/** Legacy compatibility evaluator. New operational paths must use AuthorizationPolicyEngine. */
export class StormFirePolicyEngine {
  private readonly policies = new Map<string, ServicePolicy>();

  registerPolicy(policy: ServicePolicy): void {
    this.policies.set(policy.serviceId, {
      ...policy,
      allowedActions: [...policy.allowedActions],
      allowedKinds: policy.allowedKinds ? [...policy.allowedKinds] : undefined,
      allowedRecipients: policy.allowedRecipients ? [...policy.allowedRecipients] : undefined,
      allowedAlertPriorities: policy.allowedAlertPriorities ? [...policy.allowedAlertPriorities] : undefined,
    });
  }

  authorize(request: AuthorizationRequest): boolean {
    const { identity, service, action } = request;
    if (!service.enabled) return false;
    if (identity.serviceId !== service.id) return false;
    if (identity.trustLevel === "QUARANTINED") return false;
    if (identity.expiresAt && Date.now() >= Date.parse(identity.expiresAt)) return false;

    const policy = this.policies.get(service.id);
    if (!policy || !policy.allowedActions.includes(action)) return false;
    if (!service.capabilities.some((capability) => capability.id === action || capability.id === action.replace("CONTRIBUTE", "CONTRIBUTE"))) return false;
    if (request.resourceKind && policy.allowedKinds && !policy.allowedKinds.includes(request.resourceKind)) return false;
    if (request.recipient && policy.allowedRecipients && !policy.allowedRecipients.includes(request.recipient)) return false;
    if (request.alertPriority && policy.allowedAlertPriorities && !policy.allowedAlertPriorities.includes(request.alertPriority)) return false;

    return true;
  }
}

/**
 * Legacy singleton. Do not add new operational consumers.
 * Canonical authorization lives in stormFireAuthorization.
 */
export const stormFirePolicyEngine = new StormFirePolicyEngine();

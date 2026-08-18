import type { StormFireServiceManifest } from "./serviceManifestAdapter";
import type { AlertPriority } from "./parallelAlertFabric";

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

export class StormFirePolicyEngine {
  private policies = new Map<string, ServicePolicy>();

  registerPolicy(policy: ServicePolicy): void {
    this.policies.set(policy.serviceId, policy);
  }

  authorize(request: AuthorizationRequest): boolean {
    const { identity, service, action } = request;
    if (!service.enabled) return false;
    if (identity.serviceId !== service.id) return false;
    if (identity.trustLevel === "QUARANTINED") return false;
    if (identity.expiresAt && Date.now() >= Date.parse(identity.expiresAt)) return false;

    const policy = this.policies.get(service.id);
    if (!policy || !policy.allowedActions.includes(action)) return false;
    if (!service.capabilities.includes(action)) return false;

    if (request.resourceKind && policy.allowedKinds && !policy.allowedKinds.includes(request.resourceKind)) return false;
    if (request.recipient && policy.allowedRecipients && !policy.allowedRecipients.includes(request.recipient)) return false;
    if (request.alertPriority && policy.allowedAlertPriorities && !policy.allowedAlertPriorities.includes(request.alertPriority)) return false;

    return true;
  }
}

export const stormFirePolicyEngine = new StormFirePolicyEngine();

import type { StormFireServiceManifest } from "./serviceRegistry";
import type { AlertPriority } from "./parallelAlertFabric";
import { stormFirePolicyEngine, type ServiceAction, type ServiceIdentity } from "./servicePolicy";

export interface AuthorizationContext {
  identity: ServiceIdentity;
  service: StormFireServiceManifest;
}

export function assertServiceAuthorization(
  context: AuthorizationContext,
  action: ServiceAction,
  options: { resourceKind?: string; recipient?: string; alertPriority?: AlertPriority } = {},
): void {
  if (!stormFirePolicyEngine.authorize({
    identity: context.identity,
    service: context.service,
    action,
    ...options,
  })) {
    throw new Error(`Authorization denied: ${context.service.id} cannot perform ${action}.`);
  }
}

import type { StormFireServiceManifest } from "./serviceManifestAdapter";
import { stormFireParticipants } from "./participantModel";
import { stormFireServiceFabric } from "./serviceFabric";

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

export interface AuthorizationContext {
  identity: ServiceIdentity;
  service: StormFireServiceManifest;
}

const actionCapabilityMap: Record<ServiceAction, string> = {
  DISCOVER: "DISCOVER",
  CONSUME: "CONSUME",
  CONTRIBUTE: "CONTRIBUTE",
  RELATE: "RELATE",
  PUBLISH_EVENT: "PUBLISH_EVENT",
  PARALLEL_ALERT: "PARALLEL_ALERT",
};

/** Compatibility gateway over canonical Service Fabric identity and participant ownership checks. */
export function assertServiceAuthorization(
  context: AuthorizationContext,
  action: ServiceAction,
  options: { resourceKind?: string; recipient?: string; alertPriority?: string } = {},
): void {
  const canonical = stormFireServiceFabric.get(context.service.id);
  const participant = canonical ? stormFireParticipants.get(canonical.ownerParticipantId) : undefined;

  if (!canonical || canonical.status === "PAUSED" || canonical.status === "OFFLINE") {
    throw new Error(`Authorization denied: ${context.service.id} is not operational.`);
  }
  if (context.identity.serviceId !== canonical.id) {
    throw new Error(`Authorization denied: ${context.service.id} identity does not match canonical service.`);
  }
  if (context.identity.trustLevel === "QUARANTINED") {
    throw new Error(`Authorization denied: ${context.service.id} identity is quarantined.`);
  }
  if (context.identity.expiresAt && Date.now() >= Date.parse(context.identity.expiresAt)) {
    throw new Error(`Authorization denied: ${context.service.id} identity has expired.`);
  }
  if (!participant?.enabled || !participant.serviceIds.includes(canonical.id)) {
    throw new Error(`Authorization denied: ${context.service.id} is outside canonical participant service context.`);
  }

  const capability = actionCapabilityMap[action];
  if (!context.service.capabilities.some((item) => item.id === capability || item.name === capability)) {
    throw new Error(`Authorization denied: ${context.service.id} lacks capability ${action}.`);
  }

  if (options.resourceKind) {
    const produces = canonical.informationTypesProduced.includes(options.resourceKind);
    const consumes = canonical.informationTypesConsumed.includes(options.resourceKind);
    if (!produces && !consumes) throw new Error(`Authorization denied: ${context.service.id} has no canonical information capability for ${options.resourceKind}.`);
  }

  if (options.recipient && options.recipient !== "COP" && options.recipient !== "INFORMATION_FABRIC" && options.recipient !== "SERVICE_FABRIC") {
    if (!stormFireParticipants.get(options.recipient)) throw new Error(`Authorization denied: unknown participant recipient ${options.recipient}.`);
  }

  void options.alertPriority;
}

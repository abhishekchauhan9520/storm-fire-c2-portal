import { type StormFireServiceManifest, registerCanonicalService, fromCanonicalService } from "./serviceManifestAdapter";
import { stormFireServiceFabric } from "./serviceFabric";
import { stormFireParticipants } from "./participantModel";
import { validateServiceCompatibility, type CompatibilityResult } from "./serviceCompatibility";
import { stormFireServiceObservability } from "./serviceObservability";

export type ServiceLifecycleState =
  | "DISCOVERED"
  | "REGISTERED"
  | "VALIDATED"
  | "AUTHORIZED"
  | "ENABLED"
  | "MONITORED"
  | "DISABLED"
  | "QUARANTINED";

export interface ServiceIdentity {
  serviceId: string;
  principal: string;
  roles: string[];
  trustLevel: "TRUSTED" | "RESTRICTED" | "QUARANTINED";
  issuedAt: string;
  expiresAt?: string;
}

export interface ServiceLifecycleRecord {
  service: StormFireServiceManifest;
  state: ServiceLifecycleState;
  identity?: ServiceIdentity;
  compatibility?: CompatibilityResult;
  updatedAt: string;
  reason?: string;
}

const transitions: Record<ServiceLifecycleState, ServiceLifecycleState[]> = {
  DISCOVERED: ["REGISTERED", "DISABLED", "QUARANTINED"],
  REGISTERED: ["VALIDATED", "DISABLED", "QUARANTINED"],
  VALIDATED: ["AUTHORIZED", "DISABLED", "QUARANTINED"],
  AUTHORIZED: ["ENABLED", "QUARANTINED", "DISABLED"],
  ENABLED: ["MONITORED", "QUARANTINED", "DISABLED"],
  MONITORED: ["QUARANTINED", "DISABLED"],
  DISABLED: ["REGISTERED", "QUARANTINED"],
  QUARANTINED: ["REGISTERED", "DISABLED"],
};

function canonicalManifest(serviceId: string): StormFireServiceManifest | undefined {
  const canonical = stormFireServiceFabric.get(serviceId);
  return canonical ? fromCanonicalService(canonical) : undefined;
}

export class StormFireServiceLifecycleManager {
  private records = new Map<string, ServiceLifecycleRecord>();

  discover(service: StormFireServiceManifest): ServiceLifecycleRecord {
    const canonical = registerCanonicalService(service, stormFireServiceFabric);
    const compatibility = validateServiceCompatibility(canonical);
    const record: ServiceLifecycleRecord = {
      service: canonical,
      state: "DISCOVERED",
      compatibility,
      updatedAt: new Date().toISOString(),
      reason: compatibility.compatible ? undefined : compatibility.errors.join("; "),
    };
    this.records.set(service.id, record);
    stormFireServiceObservability.record({ serviceId: service.id, type: "LIFECYCLE", action: "DISCOVERED", state: record.state, success: true });
    return record;
  }

  transition(serviceId: string, next: ServiceLifecycleState, reason?: string): ServiceLifecycleRecord {
    const record = this.records.get(serviceId);
    if (!record) throw new Error(`Service has not been discovered: ${serviceId}`);
    if (!transitions[record.state].includes(next)) {
      stormFireServiceObservability.record({ serviceId, type: "ERROR", action: "INVALID_LIFECYCLE_TRANSITION", state: record.state, success: false, message: `${record.state} -> ${next}` });
      throw new Error(`Invalid lifecycle transition: ${record.state} -> ${next}`);
    }
    const previous = record.state;
    record.state = next;
    record.updatedAt = new Date().toISOString();
    record.reason = reason;

    const canonical = stormFireServiceFabric.get(serviceId);
    if (canonical) {
      const status = next === "DISABLED" ? "PAUSED" : next === "QUARANTINED" ? "OFFLINE" : next === "REGISTERED" ? "REGISTERED" : "ACTIVE";
      stormFireServiceFabric.update(serviceId, { status });
      record.service = fromCanonicalService(stormFireServiceFabric.get(serviceId)!);
    }

    stormFireServiceObservability.record({ serviceId, type: "LIFECYCLE", action: "STATE_TRANSITION", state: next, success: true, message: `${previous} -> ${next}`, metadata: { previousState: previous, reason } });
    return record;
  }

  register(serviceId: string) { return this.transition(serviceId, "REGISTERED"); }

  validate(serviceId: string) {
    const record = this.records.get(serviceId);
    if (!record) throw new Error(`Service has not been discovered: ${serviceId}`);
    const canonical = canonicalManifest(serviceId);
    if (canonical) record.service = canonical;
    const compatibility = validateServiceCompatibility(record.service);
    record.compatibility = compatibility;
    stormFireServiceObservability.record({ serviceId, type: "COMPATIBILITY", action: "VALIDATION", success: compatibility.compatible, state: record.state, message: compatibility.errors.join("; ") || compatibility.warnings.join("; ") });
    if (!compatibility.compatible) return this.transition(serviceId, "QUARANTINED", `Compatibility validation failed: ${compatibility.errors.join("; ")}`);
    return this.transition(serviceId, "VALIDATED");
  }

  authorize(serviceId: string, identity: ServiceIdentity) {
    const record = this.records.get(serviceId);
    if (!record) throw new Error(`Service has not been discovered: ${serviceId}`);
    if (record.state !== "VALIDATED") return this.transition(serviceId, "QUARANTINED", "Authorization attempted before successful compatibility validation.");

    const service = stormFireServiceFabric.get(serviceId);
    const owner = service ? stormFireParticipants.get(service.ownerParticipantId) : undefined;
    const validIdentity = identity.serviceId === serviceId && identity.trustLevel !== "QUARANTINED" && (!identity.expiresAt || Date.now() < Date.parse(identity.expiresAt));
    const ownerContext = Boolean(owner?.enabled && owner.serviceIds.includes(serviceId));
    const serviceOperational = Boolean(service && (service.status === "ACTIVE" || service.status === "REGISTERED"));
    const authorized = validIdentity && ownerContext && serviceOperational;

    stormFireServiceObservability.record({
      serviceId,
      type: "AUTHORIZATION",
      action: "CANONICAL_SERVICE_CONTEXT_CHECK",
      state: record.state,
      success: authorized,
      message: authorized ? "Service owner and canonical service context accepted." : "Service lifecycle authorization denied by canonical service/participant context.",
    });

    if (!authorized) return this.transition(serviceId, "QUARANTINED", "Canonical service/participant context authorization failed.");
    record.identity = identity;
    return this.transition(serviceId, "AUTHORIZED");
  }

  enable(serviceId: string) { return this.transition(serviceId, "ENABLED"); }
  monitor(serviceId: string) { return this.transition(serviceId, "MONITORED"); }
  disable(serviceId: string, reason = "Disabled by operator policy.") { return this.transition(serviceId, "DISABLED", reason); }
  quarantine(serviceId: string, reason = "Quarantined by policy.") { return this.transition(serviceId, "QUARANTINED", reason); }

  get(serviceId: string) {
    const record = this.records.get(serviceId);
    if (!record) return undefined;
    const canonical = canonicalManifest(serviceId);
    return canonical ? { ...record, service: canonical } : record;
  }

  list() {
    return [...this.records.values()].map((record) => {
      const canonical = canonicalManifest(record.service.id);
      return canonical ? { ...record, service: canonical } : record;
    });
  }
}

export const stormFireServiceLifecycle = new StormFireServiceLifecycleManager();

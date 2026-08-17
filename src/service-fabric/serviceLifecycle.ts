import type { StormFireServiceManifest } from "./serviceRegistry";
import { stormFirePolicyEngine, type ServiceIdentity } from "./servicePolicy";
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

export class StormFireServiceLifecycleManager {
  private records = new Map<string, ServiceLifecycleRecord>();

  discover(service: StormFireServiceManifest): ServiceLifecycleRecord {
    const compatibility = validateServiceCompatibility(service);
    const record: ServiceLifecycleRecord = { service, state: "DISCOVERED", compatibility, updatedAt: new Date().toISOString(), reason: compatibility.compatible ? undefined : compatibility.errors.join("; ") };
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
    stormFireServiceObservability.record({ serviceId, type: "LIFECYCLE", action: "STATE_TRANSITION", state: next, success: true, message: `${previous} -> ${next}`, metadata: { previousState: previous, reason } });
    return record;
  }

  register(serviceId: string) { return this.transition(serviceId, "REGISTERED"); }

  validate(serviceId: string) {
    const record = this.records.get(serviceId);
    if (!record) throw new Error(`Service has not been discovered: ${serviceId}`);
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
    if (identity.serviceId !== serviceId || identity.trustLevel === "QUARANTINED") {
      stormFireServiceObservability.record({ serviceId, type: "AUTHORIZATION", action: "IDENTITY_REJECTED", state: record.state, success: false });
      return this.transition(serviceId, "QUARANTINED", "Identity validation failed.");
    }
    record.identity = identity;
    const authorized = stormFirePolicyEngine.authorize({ identity, service: record.service, action: "DISCOVER" });
    stormFireServiceObservability.record({ serviceId, type: "AUTHORIZATION", action: "POLICY_CHECK", state: record.state, success: authorized });
    if (!authorized) return this.transition(serviceId, "QUARANTINED", "Policy authorization failed.");
    return this.transition(serviceId, "AUTHORIZED");
  }

  enable(serviceId: string) { return this.transition(serviceId, "ENABLED"); }
  monitor(serviceId: string) { return this.transition(serviceId, "MONITORED"); }
  disable(serviceId: string, reason = "Disabled by operator policy.") { return this.transition(serviceId, "DISABLED", reason); }
  quarantine(serviceId: string, reason = "Quarantined by policy.") { return this.transition(serviceId, "QUARANTINED", reason); }
  get(serviceId: string) { return this.records.get(serviceId); }
  list() { return [...this.records.values()]; }
}

export const stormFireServiceLifecycle = new StormFireServiceLifecycleManager();

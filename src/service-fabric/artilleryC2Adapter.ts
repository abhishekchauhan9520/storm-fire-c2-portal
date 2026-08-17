import { stormFireServiceGateway } from "./serviceGateway";
import { connectRelationship } from "./relationshipGateway";
import { parallelAlertFabric, type AlertPriority } from "./parallelAlertFabric";
import { stormFireServiceLifecycle } from "./serviceLifecycle";
import type { StormFireServiceManifest } from "./serviceRegistry";
import type { ServiceIdentity } from "./servicePolicy";
import { stormFirePolicyEngine, type ServicePolicy } from "./servicePolicy";
import type { StormFireEvent } from "./serviceEventBus";

export interface ArtilleryInformationPayload {
  assessmentId: string;
  status: "OBSERVATION" | "ASSESSMENT" | "STATUS";
  text: string;
  sourceReference?: string;
  observedAt: string;
}

/**
 * Demonstration adapter for integrating an external Artillery C2 as a
 * Storm Fire information service. It deliberately excludes fire-control,
 * targeting, firing, or weapon-command functionality.
 */
export class ArtilleryC2ServiceAdapter {
  constructor(private readonly manifest: StormFireServiceManifest) {}

  install(): void {
    if (!stormFireServiceLifecycle.get(this.manifest.id)) {
      stormFireServiceLifecycle.discover(this.manifest);
    }
    const state = stormFireServiceLifecycle.get(this.manifest.id)?.state;
    if (state === "DISCOVERED") stormFireServiceLifecycle.register(this.manifest.id);
    if (stormFireServiceLifecycle.get(this.manifest.id)?.state === "REGISTERED") {
      stormFireServiceLifecycle.validate(this.manifest.id);
    }

    const identity: ServiceIdentity = {
      serviceId: this.manifest.id,
      principal: `service:${this.manifest.id}`,
      roles: ["INFORMATION_SERVICE"],
      trustLevel: "TRUSTED",
      issuedAt: new Date().toISOString(),
    };

    const policy: ServicePolicy = {
      serviceId: this.manifest.id,
      allowedActions: ["DISCOVER", "CONSUME", "CONTRIBUTE", "RELATE", "PUBLISH_EVENT", "PARALLEL_ALERT"],
      allowedKinds: ["TACTICAL_TRACK", "TACTICAL_NODE", "COMMAND_SYSTEM", "SERVICE_EVENT", "ARTILLERY_ASSESSMENT"],
      allowedRecipients: ["COP", "INFORMATION_FABRIC", "SERVICE_FABRIC"],
      allowedAlertPriorities: ["INFO", "WARNING", "CRITICAL"],
    };
    stormFirePolicyEngine.registerPolicy(policy);
    stormFireServiceLifecycle.authorize(this.manifest.id, identity);
    stormFireServiceLifecycle.enable(this.manifest.id);
    stormFireServiceLifecycle.monitor(this.manifest.id);
  }

  consumeSharedInformation() {
    const record = stormFireServiceLifecycle.get(this.manifest.id);
    if (!record?.identity) throw new Error("Artillery C2 service is not authorized.");
    return stormFireServiceGateway.query(this.manifest, { limit: 50 });
  }

  contributeAssessment(payload: ArtilleryInformationPayload) {
    return stormFireServiceGateway.contribute(this.manifest, {
      kind: "ARTILLERY_ASSESSMENT",
      source: this.manifest.id,
      payload,
    });
  }

  connectParticipant(participantId: string, axis: "VERTICAL" | "HORIZONTAL" | "DIAGONAL") {
    return connectRelationship(this.manifest, {
      from: this.manifest.id,
      to: participantId,
      axis,
      relation: "INFORMATION_LINK",
    });
  }

  publishAssessmentEvent(payload: ArtilleryInformationPayload, recipients: string[]): StormFireEvent {
    return stormFireServiceGateway.publish(this.manifest, {
      type: "INFORMATION_UPDATE",
      payload,
      recipients,
    });
  }

  distributeParallelAlert(event: StormFireEvent, priority: AlertPriority) {
    return parallelAlertFabric.dispatch(event, priority);
  }
}

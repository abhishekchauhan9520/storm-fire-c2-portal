import { BaseStormFireServiceAdapter } from "./serviceAdapter";
import type { StormFireServiceManifest } from "./serviceManifestAdapter";
import type { StormFireEvent } from "./serviceEventBus";
import type { AlertPriority } from "./parallelAlertFabric";

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
export class ArtilleryC2ServiceAdapter extends BaseStormFireServiceAdapter {
  constructor(manifest: StormFireServiceManifest) {
    super(manifest);
  }

  install(): void {
    super.install();
    // Domain-specific registration/authorization can be supplied by the
    // deployment's identity and policy provisioning layer.
  }

  consumeSharedInformation() {
    return this.consume({ limit: 50 });
  }

  contributeAssessment(payload: ArtilleryInformationPayload) {
    return this.contribute("ARTILLERY_ASSESSMENT", payload as unknown as Record<string, unknown>);
  }

  connectParticipant(participantId: string, axis: "VERTICAL" | "HORIZONTAL" | "DIAGONAL") {
    return this.relate(participantId, axis, "INFORMATION_LINK");
  }

  publishAssessmentEvent(payload: ArtilleryInformationPayload, recipients: string[]): StormFireEvent {
    return this.publish("INFORMATION_UPDATE", payload, recipients);
  }

  distributeParallelAlert(event: StormFireEvent, priority: AlertPriority) {
    return this.alert(event, priority);
  }
}

import { stormFireInformationFabric } from "./informationFabric";
import { stormFireInformationRelationships } from "./informationRelationshipEngine";
import { ParallelAlertRouter } from "./parallelAlertRouter";
import { stormFireServiceFabric } from "../service-fabric/serviceFabric";

export interface OperationalDispatchResult {
  informationId: string;
  informationType: string;
  recipients: string[];
}

/** Shared Storm Fire runtime wiring the canonical fabric, relationship policy and service registry together. */
export class StormFireOperationalRuntime {
  readonly alerts = new ParallelAlertRouter(stormFireInformationFabric, stormFireInformationRelationships);

  publishAndDispatch<T>(message: import("./informationFabric").StormFireInformationEnvelope<T>, recipients: string[]): OperationalDispatchResult {
    if (message.producerServiceId && !stormFireServiceFabric.get(message.producerServiceId)) {
      throw new Error(`Producer service ${message.producerServiceId} is not registered.`);
    }
    if (!message.producerServiceId && !message.producerParticipantId) {
      throw new Error("Operational information requires a producer service or participant.");
    }

    const published = stormFireInformationFabric.publish(message);
    const dispatched = this.alerts.dispatch(published, recipients);

    return {
      informationId: published.id,
      informationType: published.type,
      recipients: dispatched.recipients.map((recipient) => recipient.participantId),
    };
  }
}

export const stormFireOperationalRuntime = new StormFireOperationalRuntime();

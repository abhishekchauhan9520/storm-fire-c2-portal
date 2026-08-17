import { InformationFabric, StormFireInformationEnvelope } from "./informationFabric";
import { InformationRelationshipRegistry } from "./informationRelationships";
import { ParallelAlertRouter } from "./parallelAlertRouter";

export interface InformationRouteTarget {
  participantId: string;
  relationshipId?: string;
}

export interface InformationDispatch<T = unknown> {
  message: StormFireInformationEnvelope<T>;
  deliveredTo: InformationRouteTarget[];
}

/** Coordinates shared-information publication and relationship-aware parallel dissemination. */
export class StormFireInformationRouter {
  private readonly alerts: ParallelAlertRouter;

  constructor(
    private readonly fabric: InformationFabric,
    private readonly relationships: InformationRelationshipRegistry,
  ) {
    this.alerts = new ParallelAlertRouter(fabric, relationships);
  }

  publish<T>(message: StormFireInformationEnvelope<T>, targets: string[] = []): InformationDispatch<T> {
    const published = this.fabric.publish(message);
    const deliveredTo = this.authorizedTargets(published, targets);
    return { message: published, deliveredTo };
  }

  dispatchAlert<T>(alert: StormFireInformationEnvelope<T>, targets: string[]) {
    const published = this.fabric.publish(alert);
    return this.alerts.dispatch(published, targets);
  }

  private authorizedTargets<T>(message: StormFireInformationEnvelope<T>, targets: string[]): InformationRouteTarget[] {
    if (!message.producerParticipantId) return [...new Set(targets)].map(participantId => ({ participantId }));

    return [...new Set(targets)].flatMap(participantId => {
      const relationship = this.relationships.forParticipant(message.producerParticipantId!)
        .find(r => r.fromParticipantId === message.producerParticipantId && r.toParticipantId === participantId &&
          (r.informationTypes.includes("*") || r.informationTypes.includes(message.type)));
      return relationship ? [{ participantId, relationshipId: relationship.id }] : [];
    });
  }
}

export const stormFireInformationRouter = new StormFireInformationRouter(
  new InformationFabric(),
  new InformationRelationshipRegistry(),
);

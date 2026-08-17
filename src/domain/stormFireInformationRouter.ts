import { InformationFabric, StormFireInformationEnvelope } from "./informationFabric";
import { InformationRelationshipEngine, stormFireInformationRelationships } from "./informationRelationshipEngine";
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
    private readonly relationships: InformationRelationshipEngine = stormFireInformationRelationships,
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
    if (!message.producerParticipantId) return [...new Set(targets)].map((participantId) => ({ participantId }));

    return [...new Set(targets)].flatMap((participantId) => {
      const directPath = this.relationships.pathsFrom(message.producerParticipantId!, message.type)
        .find((path) => path.participantIds[path.participantIds.length - 1] === participantId && path.participantIds.length === 2);
      return directPath ? [{ participantId, relationshipId: directPath.relationshipIds[0] }] : [];
    });
  }
}

export const stormFireInformationRouter = new StormFireInformationRouter(new InformationFabric(), stormFireInformationRelationships);

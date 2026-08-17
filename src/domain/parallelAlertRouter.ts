import { InformationFabric, StormFireInformationEnvelope } from "./informationFabric";
import { InformationRelationshipRegistry } from "./informationRelationships";

export interface AlertRecipient {
  participantId: string;
  relationshipId?: string;
  deliveredAt: string;
}

export interface ParallelAlertDispatch {
  alert: StormFireInformationEnvelope;
  recipients: AlertRecipient[];
}

/** Routes one alert to multiple authorized participants in parallel. Authorization is relationship-aware. */
export class ParallelAlertRouter {
  constructor(private readonly fabric: InformationFabric, private readonly relationships: InformationRelationshipRegistry) {}

  dispatch<T>(alert: StormFireInformationEnvelope<T>, recipients: string[]): ParallelAlertDispatch {
    const uniqueRecipients = [...new Set(recipients)].filter(Boolean);
    const deliveredAt = new Date().toISOString();
    const delivered: AlertRecipient[] = [];

    for (const participantId of uniqueRecipients) {
      if (alert.producerParticipantId && !this.relationships.allows(alert.producerParticipantId, participantId, alert.type)) continue;
      delivered.push({ participantId, deliveredAt });
    }

    const dispatch: ParallelAlertDispatch = { alert, recipients: delivered };
    return dispatch;
  }
}

export const createParallelAlertRouter = (fabric: InformationFabric, relationships: InformationRelationshipRegistry) => new ParallelAlertRouter(fabric, relationships);

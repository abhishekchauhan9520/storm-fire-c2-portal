import { InformationFabric, StormFireInformationEnvelope } from "./informationFabric";
import { InformationRelationshipEngine, stormFireInformationRelationships } from "./informationRelationshipEngine";

export interface AlertRecipient {
  participantId: string;
  relationshipId?: string;
  deliveredAt: string;
}

export interface ParallelAlertDispatch {
  alert: StormFireInformationEnvelope;
  recipients: AlertRecipient[];
}

/** Routes one alert to multiple authorized participants in parallel. */
export class ParallelAlertRouter {
  constructor(private readonly fabric: InformationFabric, private readonly relationships: InformationRelationshipEngine) {}

  dispatch<T>(alert: StormFireInformationEnvelope<T>, recipients: string[]): ParallelAlertDispatch {
    const uniqueRecipients = [...new Set(recipients)].filter(Boolean);
    const deliveredAt = new Date().toISOString();
    const delivered: AlertRecipient[] = [];

    for (const participantId of uniqueRecipients) {
      if (alert.producerParticipantId && !this.relationships.canShare(alert.producerParticipantId, participantId, alert.type)) continue;
      delivered.push({ participantId, deliveredAt });
    }

    return { alert, recipients: delivered };
  }
}

export const createParallelAlertRouter = (fabric: InformationFabric, relationships = stormFireInformationRelationships) => new ParallelAlertRouter(fabric, relationships);

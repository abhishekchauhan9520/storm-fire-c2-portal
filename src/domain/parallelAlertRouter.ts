import { InformationFabric, StormFireInformationEnvelope } from "./informationFabric";

export interface AlertRecipient {
  participantId: string;
  relationshipId?: string;
  deliveredAt: string;
}

export interface ParallelAlertDispatch {
  alert: StormFireInformationEnvelope;
  recipients: AlertRecipient[];
}

/**
 * Disseminates an already-authorized alert to its selected participants.
 * Authorization is deliberately not reimplemented here: callers must use the
 * canonical participant/policy boundary before invoking this transport path.
 */
export class ParallelAlertRouter {
  constructor(private readonly fabric: InformationFabric) {}

  dispatch<T>(alert: StormFireInformationEnvelope<T>, recipients: string[]): ParallelAlertDispatch {
    const uniqueRecipients = [...new Set(recipients)].filter(Boolean);
    const deliveredAt = new Date().toISOString();
    const delivered: AlertRecipient[] = uniqueRecipients.map((participantId) => ({ participantId, deliveredAt }));
    return { alert, recipients: delivered };
  }
}

export const createParallelAlertRouter = (fabric: InformationFabric) => new ParallelAlertRouter(fabric);

import { stormFireInformationFabric, type StormFireInformationEnvelope } from "./informationFabric";
import { decideStormFireInformationDistribution } from "./informationDistributionDecision";

export interface StormFireSecuredPublishResult {
  deliveredTo: string[];
  deniedTo: string[];
}

/** Policy-aware facade over the Information Fabric. Existing low-level publish remains available for trusted infrastructure adapters. */
export class SecuredInformationFabric {
  publishToParticipants<T>(
    message: StormFireInformationEnvelope<T>,
    recipients: Array<{ participantId: string; serviceId: string; geographicScopeId?: string; informationPoint?: { latitude: number; longitude: number }; classification?: string }>,
  ): StormFireSecuredPublishResult {
    const deliveredTo: string[] = [];
    const deniedTo: string[] = [];

    for (const recipient of recipients) {
      const decision = decideStormFireInformationDistribution({
        sourceParticipantId: message.producerParticipantId ?? message.provenance.sourceId,
        recipientParticipantId: recipient.participantId,
        informationType: message.type,
        serviceId: recipient.serviceId,
        geographicScopeId: recipient.geographicScopeId,
        informationPoint: recipient.informationPoint,
        classification: recipient.classification,
      });

      if (!decision.allowed) {
        deniedTo.push(recipient.participantId);
        continue;
      }

      const subscription = `${recipient.participantId}:${message.type}`;
      stormFireInformationFabric.subscribe({
        id: subscription,
        participantId: recipient.participantId,
        serviceId: recipient.serviceId,
        informationTypes: [message.type],
        handler: () => undefined,
      });
      deliveredTo.push(recipient.participantId);
    }

    if (deliveredTo.length > 0) stormFireInformationFabric.publish(message);
    return { deliveredTo, deniedTo };
  }
}

export const stormFireSecuredInformationFabric = new SecuredInformationFabric();

import { stormFireInformationFabric, type StormFireInformationEnvelope } from "./informationFabric";
import { decideStormFireInformationDistribution } from "./informationDistributionDecision";
import type { InformationClassification } from "../contracts/stormFireContracts";

export interface StormFireSecuredRecipient { participantId: string; serviceId: string; geographicScopeId?: string; informationPoint?: { latitude: number; longitude: number }; classification?: InformationClassification; }
export interface StormFireSecuredPublishResult { deliveredTo: string[]; deniedTo: string[]; }

/** Policy-aware facade over the canonical Information Fabric. */
export class SecuredInformationFabric {
  publishToParticipants<T>(message: StormFireInformationEnvelope<T>, recipients: StormFireSecuredRecipient[]): StormFireSecuredPublishResult {
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
      if (!decision.allowed) { deniedTo.push(recipient.participantId); continue; }
      deliveredTo.push(recipient.participantId);
    }
    if (deliveredTo.length > 0) stormFireInformationFabric.publish(message);
    return { deliveredTo, deniedTo };
  }
}
export const stormFireSecuredInformationFabric = new SecuredInformationFabric();

import { InformationFabric, StormFireInformationEnvelope } from "./informationFabric";
import { InformationPolicyRegistry } from "./informationPolicy";
import { InformationRelationshipEngine, stormFireInformationRelationships } from "./informationRelationshipEngine";

export interface AlertDispatchResult {
  alertId: string;
  recipientIds: string[];
  rejectedRecipientIds: string[];
  dispatchedAt: string;
}

export class AlertDispatchService {
  constructor(
    private readonly fabric: InformationFabric,
    private readonly policies: InformationPolicyRegistry,
    private readonly relationships: InformationRelationshipEngine = stormFireInformationRelationships,
  ) {}

  dispatch<T>(alert: StormFireInformationEnvelope<T>, recipients: string[], policyIds: string[], scopeIds: string[] = []): AlertDispatchResult {
    const allowed: string[] = [];
    const rejected: string[] = [];

    for (const participantId of [...new Set(recipients)]) {
      const canDeliver = this.policies.canDeliver(policyIds, participantId, alert.type, scopeIds, this.relationships, alert.producerParticipantId);
      (canDeliver ? allowed : rejected).push(participantId);
    }

    this.fabric.publish(alert);
    return { alertId: alert.id, recipientIds: allowed, rejectedRecipientIds: rejected, dispatchedAt: new Date().toISOString() };
  }
}

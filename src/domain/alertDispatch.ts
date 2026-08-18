import { InformationFabric, StormFireInformationEnvelope } from "./informationFabric";
import { stormFireAuthorization } from "./authorizationPolicy";
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
    private readonly relationships: InformationRelationshipEngine = stormFireInformationRelationships,
  ) {}

  dispatch<T>(alert: StormFireInformationEnvelope<T>, recipients: string[], policyIds: string[], scopeIds: string[] = []): AlertDispatchResult {
    const allowed: string[] = [];
    const rejected: string[] = [];

    for (const participantId of [...new Set(recipients)]) {
      const policies = policyIds
        .map((id) => stormFireAuthorization.get(id))
        .filter((policy): policy is NonNullable<ReturnType<typeof stormFireAuthorization.get>> => Boolean(policy));
      const relationshipIds = policies.flatMap((policy) => policy.relationshipIds ?? []);
      const authorization = stormFireAuthorization.decide({
        requestId: `alert:${alert.id}:${participantId}`,
        participantId,
        informationType: alert.type,
        geographicScopeIds: scopeIds,
        classification: alert.classification,
        relationshipIds,
      });
      const requestedPoliciesExist = policyIds.length === 0 || policies.length > 0;
      const relationshipAllowed = Boolean(
        !alert.producerParticipantId ||
        this.relationships.canShare(alert.producerParticipantId, participantId, alert.type),
      );

      const canDeliver = requestedPoliciesExist && relationshipAllowed && authorization.allowed;
      (canDeliver ? allowed : rejected).push(participantId);
    }

    this.fabric.publish(alert);
    return { alertId: alert.id, recipientIds: allowed, rejectedRecipientIds: rejected, dispatchedAt: new Date().toISOString() };
  }
}

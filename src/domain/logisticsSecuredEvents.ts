import { stormFireSecuredInformationFabric } from "./securedInformationFabric";
import type { StormFireLogisticsAssetReadiness } from "./logisticsReadiness";
import type { StormFireLogisticsMovement } from "./logisticsTransport";

export interface StormFireLogisticsRecipient { participantId: string; serviceId: string; geographicScopeId: string; informationPoint?: { latitude: number; longitude: number }; classification?: string; }

export function publishSecuredLogisticsReadiness(asset: StormFireLogisticsAssetReadiness, occurredAt: string, recipients: StormFireLogisticsRecipient[]) {
  return stormFireSecuredInformationFabric.publishToParticipants({ id: `logistics-readiness:${asset.assetId}:${occurredAt}`, kind: "EVENT", type: "LOGISTICS_READINESS_CHANGED", version: 1, occurredAt, producerServiceId: "logistics", producerParticipantId: asset.ownerParticipantId, provenance: { sourceId: asset.assetId, observedAt: occurredAt, receivedAt: occurredAt }, payload: asset }, recipients);
}

export function publishSecuredLogisticsMovement(movement: StormFireLogisticsMovement, sourceParticipantId: string, recipients: StormFireLogisticsRecipient[]) {
  return stormFireSecuredInformationFabric.publishToParticipants({ id: `logistics-movement:${movement.id}:${movement.updatedAt}`, kind: "EVENT", type: "LOGISTICS_MOVEMENT_CHANGED", version: 1, occurredAt: movement.updatedAt, producerServiceId: "logistics", producerParticipantId: sourceParticipantId, provenance: { sourceId: movement.id, observedAt: movement.updatedAt, receivedAt: movement.updatedAt }, payload: movement }, recipients);
}

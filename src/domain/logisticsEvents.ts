import { stormFireInformationFabric } from "./informationFabric";
import type { StormFireLogisticsAssetReadiness } from "./logisticsReadiness";
import type { StormFireLogisticsMovement } from "./logisticsTransport";

export function publishLogisticsReadiness(asset: StormFireLogisticsAssetReadiness, occurredAt: string): void {
  stormFireInformationFabric.publish({ id: `logistics-readiness:${asset.assetId}:${occurredAt}`, kind: "EVENT", type: "LOGISTICS_READINESS_CHANGED", version: 1, occurredAt, producerServiceId: "logistics", producerParticipantId: asset.ownerParticipantId, provenance: { sourceId: asset.assetId, observedAt: occurredAt, receivedAt: occurredAt }, payload: asset });
}

export function publishLogisticsMovement(movement: StormFireLogisticsMovement): void {
  stormFireInformationFabric.publish({ id: `logistics-movement:${movement.id}:${movement.updatedAt}`, kind: "EVENT", type: "LOGISTICS_MOVEMENT_CHANGED", version: 1, occurredAt: movement.updatedAt, producerServiceId: "logistics", producerParticipantId: movement.requestId, provenance: { sourceId: movement.id, observedAt: movement.updatedAt, receivedAt: movement.updatedAt }, payload: movement });
}

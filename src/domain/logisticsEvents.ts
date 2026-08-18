import { stormFireInformationFabric } from "./informationFabric";
import type { StormFireLogisticsAssetReadiness } from "./logisticsReadiness";
import type { StormFireLogisticsMovement } from "./logisticsTransport";

const envelope = <T>(id: string, type: string, occurredAt: string, participantId: string, sourceId: string, payload: T) => ({ id, kind: "EVENT" as const, type, schemaVersion: 1, version: 1, occurredAt, producerServiceId: "logistics", producerParticipantId: participantId, classification: "CONTROLLED" as const, geographicScopeIds: [], provenance: { sourceId, observedAt: occurredAt, receivedAt: occurredAt }, payload });
export function publishLogisticsReadiness(asset: StormFireLogisticsAssetReadiness, occurredAt: string): void { stormFireInformationFabric.publish(envelope(`logistics-readiness:${asset.assetId}:${occurredAt}`, "LOGISTICS_READINESS_CHANGED", occurredAt, asset.ownerParticipantId, asset.assetId, asset)); }
export function publishLogisticsMovement(movement: StormFireLogisticsMovement): void { stormFireInformationFabric.publish(envelope(`logistics-movement:${movement.id}:${movement.updatedAt}`, "LOGISTICS_MOVEMENT_CHANGED", movement.updatedAt, movement.requestId, movement.id, movement)); }

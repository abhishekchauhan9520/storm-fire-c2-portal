import { stormFireInformationFabric } from "./informationFabric";
import { stormFireLogisticsService, type StormFireLogisticsRequest, type StormFireLogisticsStatus } from "./logisticsService";

export function publishLogisticsRequest(request: StormFireLogisticsRequest): void {
  stormFireInformationFabric.publish({ id: `logistics:${request.id}:${request.updatedAt}`, kind: "OBJECT", type: "LOGISTICS_REQUEST", version: 1, occurredAt: request.updatedAt, producerServiceId: "logistics", producerParticipantId: request.requestingParticipantId, provenance: { sourceId: request.requestingParticipantId, observedAt: request.updatedAt, receivedAt: request.updatedAt }, payload: request });
}

export function transitionAndPublishLogistics(requestId: string, status: StormFireLogisticsStatus, updatedAt: string): StormFireLogisticsRequest {
  const request = stormFireLogisticsService.transition(requestId, status, updatedAt); publishLogisticsRequest(request); return request;
}

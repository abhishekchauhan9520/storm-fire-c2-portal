import { InformationFabric, type StormFireInformationEnvelope } from "../../domain/informationFabric";
import type { LogisticsRequest, LogisticsResource, LogisticsService } from "./logisticsService";

export const LOGISTICS_RESOURCE_INFORMATION = "logistics.resource";
export const LOGISTICS_REQUEST_INFORMATION = "logistics.request";
export const LOGISTICS_ALERT_INFORMATION = "logistics.alert";

export class LogisticsInformationBridge {
  constructor(private readonly service: LogisticsService, private readonly fabric: InformationFabric) {}
  publishResource(resource: LogisticsResource, producerServiceId = "logistics", producerParticipantId?: string) { return this.publish(LOGISTICS_RESOURCE_INFORMATION, resource, producerServiceId, producerParticipantId); }
  publishRequest(request: LogisticsRequest, producerServiceId = "logistics", producerParticipantId?: string) { return this.publish(LOGISTICS_REQUEST_INFORMATION, request, producerServiceId, producerParticipantId); }
  publishAlert(request: LogisticsRequest, producerServiceId = "logistics", producerParticipantId?: string) {
    if (request.status !== "OPEN" && request.status !== "PRIORITIZED") return undefined;
    return this.publish(LOGISTICS_ALERT_INFORMATION, { requestId: request.id, priority: request.priority, resourceId: request.resourceId, quantity: request.quantity, status: request.status }, producerServiceId, producerParticipantId);
  }
  private publish<T>(type: string, payload: T, producerServiceId: string, producerParticipantId?: string) {
    const now = new Date().toISOString();
    const message: StormFireInformationEnvelope<T> = { id: `${type}:${cryptoRandomId()}`, kind: "OBJECT", type, schemaVersion: 1, version: 1, occurredAt: now, producerServiceId, ...(producerParticipantId ? { producerParticipantId } : {}), classification: "CONTROLLED", geographicScopeIds: [], provenance: { sourceId: producerServiceId, observedAt: now, receivedAt: now }, payload };
    return this.fabric.publish(message);
  }
}
function cryptoRandomId(): string { return Math.random().toString(36).slice(2, 12); }

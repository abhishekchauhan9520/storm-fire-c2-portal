import { stormFireInformationFabric } from "../../domain/informationFabric";
import { AlertDispatchResult, AlertDispatchService } from "../../domain/alertDispatch";
import { InformationPolicyRegistry } from "../../domain/informationPolicy";
import { InformationRelationshipRegistry } from "../../domain/informationRelationships";
import { LogisticsRequest, LogisticsService } from "./logisticsService";

export interface LogisticsWorkflowResult {
  request: LogisticsRequest;
  requestEventId: string;
  alert?: AlertDispatchResult;
}

/** End-to-end Logistics flow: request -> canonical information -> policy/relationship evaluation -> parallel alert fan-out. */
export class LogisticsWorkflow {
  constructor(private readonly logistics: LogisticsService, private readonly policies: InformationPolicyRegistry, private readonly relationships: InformationRelationshipRegistry) {}

  createAndDistributeRequest(input: Omit<LogisticsRequest, "status" | "createdAt" | "updatedAt">, recipients: string[], policyIds: string[], scopeIds: string[] = []): LogisticsWorkflowResult {
    const request = this.logistics.createRequest(input);
    const now = new Date().toISOString();
    const requestEvent = {
      id: `logistics.request:${randomId()}`,
      kind: "EVENT" as const,
      type: "logistics.request",
      version: 1,
      occurredAt: now,
      producerServiceId: "logistics",
      producerParticipantId: request.requesterParticipantId,
      correlationId: request.id,
      provenance: { sourceId: "logistics", observedAt: now, receivedAt: now },
      payload: request,
    };
    stormFireInformationFabric.publish(requestEvent);

    let alert: AlertDispatchResult | undefined;
    if (request.priority === "HIGH" || request.priority === "CRITICAL") {
      const alertEvent = {
        ...requestEvent,
        id: `logistics.alert:${randomId()}`,
        type: "logistics.alert",
        payload: { requestId: request.id, priority: request.priority, resourceId: request.resourceId, quantity: request.quantity },
      };
      alert = new AlertDispatchService(stormFireInformationFabric, this.policies, this.relationships).dispatch(alertEvent, recipients, policyIds, scopeIds);
    }
    return { request, requestEventId: requestEvent.id, ...(alert ? { alert } : {}) };
  }
}

function randomId(): string { return Math.random().toString(36).slice(2, 12); }

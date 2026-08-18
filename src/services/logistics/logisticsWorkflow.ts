import { stormFireInformationFabric } from "../../domain/informationFabric";
import { AlertDispatchResult, AlertDispatchService } from "../../domain/alertDispatch";
import { InformationRelationshipEngine, stormFireInformationRelationships } from "../../domain/informationRelationshipEngine";
import { stormFireEventSpine } from "../../platform/event-spine/eventSpine";
import type { Event } from "../../contracts/stormFireContracts";
import { LogisticsRequest, LogisticsService } from "./logisticsService";

export interface LogisticsWorkflowResult { request: LogisticsRequest; requestEventId: string; requestPublished: boolean; alert?: AlertDispatchResult; }

/** End-to-end Logistics flow through canonical persistence, Event Spine, information, policy and relationship layers. */
export class LogisticsWorkflow {
  constructor(
    private readonly logistics: LogisticsService,
    private readonly relationships: InformationRelationshipEngine = stormFireInformationRelationships,
  ) {}

  async createAndDistributeRequest(
    input: Omit<LogisticsRequest, "status" | "createdAt" | "updatedAt">,
    recipients: string[],
    policyIds: string[],
    scopeIds: string[] = [],
  ): Promise<LogisticsWorkflowResult> {
    const request = this.logistics.createRequest(input);
    const now = new Date().toISOString();
    const requestEvent: Event<LogisticsRequest> = {
      metadata: {
        eventId: `logistics.request:${randomId()}`,
        eventType: "LogisticsRequestCreated",
        schemaVersion: 1,
        source: "logistics",
        producer: request.requesterParticipantId,
        timestamp: now,
        correlationId: request.id,
        classification: "CONTROLLED",
        geographicScopeIds: scopeIds,
        provenance: { sourceId: "logistics", observedAt: now, receivedAt: now },
      },
      payload: request,
    };

    const requestPublished = await stormFireEventSpine.publish(requestEvent);

    let alert: AlertDispatchResult | undefined;
    if (request.priority === "HIGH" || request.priority === "CRITICAL") {
      const alertEnvelope = {
        id: `logistics.alert:${randomId()}`,
        kind: "EVENT" as const,
        type: "logistics.alert",
        schemaVersion: 1,
        version: 1,
        occurredAt: now,
        producerServiceId: "logistics",
        producerParticipantId: request.requesterParticipantId,
        correlationId: request.id,
        classification: "CONTROLLED" as const,
        geographicScopeIds: scopeIds,
        provenance: { sourceId: "logistics", observedAt: now, receivedAt: now },
        payload: { requestId: request.id, priority: request.priority, resourceId: request.resourceId, quantity: request.quantity },
      };
      alert = new AlertDispatchService(stormFireInformationFabric, this.relationships)
        .dispatch(alertEnvelope, recipients, policyIds, scopeIds);
    }

    return { request, requestEventId: requestEvent.metadata.eventId, requestPublished, ...(alert ? { alert } : {}) };
  }
}

function randomId(): string { return Math.random().toString(36).slice(2, 12); }

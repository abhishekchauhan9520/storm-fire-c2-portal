import type { Event } from "../../contracts/stormFireContracts";
import { stormFireEventSpine } from "../../platform/event-spine/eventSpine";
import { LogisticsRequest, LogisticsRequestStatus, LogisticsResource, LogisticsService } from "./logisticsService";

export interface LogisticsLifecycleResult<T> {
  data: T;
  eventId: string;
  published: boolean;
}

/**
 * Application boundary for Logistics lifecycle changes. Domain mutation stays
 * inside LogisticsService; this adapter is responsible for emitting canonical
 * Event Spine lifecycle events after the mutation is accepted.
 */
export class LogisticsLifecycle {
  constructor(private readonly service: LogisticsService) {}

  async registerResource(resource: LogisticsResource): Promise<LogisticsLifecycleResult<LogisticsResource>> {
    const data = this.service.registerResource(resource);
    const event = this.event("LogisticsResourceRegistered", data.id, resource.ownerParticipantId, data);
    return { data, eventId: event.metadata.eventId, published: await stormFireEventSpine.publish(event) };
  }

  async createRequest(request: Omit<LogisticsRequest, "status" | "createdAt" | "updatedAt">): Promise<LogisticsLifecycleResult<LogisticsRequest>> {
    const data = this.service.createRequest(request);
    const event = this.event("LogisticsRequestCreated", data.id, data.requesterParticipantId, data);
    return { data, eventId: event.metadata.eventId, published: await stormFireEventSpine.publish(event) };
  }

  async updateRequestStatus(id: string, status: LogisticsRequestStatus, participantId: string): Promise<LogisticsLifecycleResult<LogisticsRequest>> {
    const existing = this.service.getRequest(id);
    if (!existing) throw new Error(`Logistics request ${id} was not found.`);
    if (existing.requesterParticipantId !== participantId) throw new Error("Only the authenticated requester may change this logistics request status.");
    if (existing.status === status) {
      const event = this.event("LogisticsRequestStatusReaffirmed", id, participantId, existing);
      return { data: existing, eventId: event.metadata.eventId, published: await stormFireEventSpine.publish(event) };
    }
    const data = this.service.updateRequestStatus(id, status);
    const event = this.event("LogisticsRequestStatusChanged", data.id, participantId, { requestId: data.id, previousStatus: existing.status, request: data });
    return { data, eventId: event.metadata.eventId, published: await stormFireEventSpine.publish(event) };
  }

  private event<T>(eventType: string, correlationId: string, producer: string, payload: T): Event<T> {
    const now = new Date().toISOString();
    return {
      metadata: {
        eventId: `logistics.lifecycle:${eventType}:${cryptoRandomId()}`,
        eventType,
        schemaVersion: 1,
        source: "logistics",
        producer,
        timestamp: now,
        correlationId,
        classification: "CONTROLLED",
        geographicScopeIds: [],
        provenance: { sourceId: "logistics", producerId: producer, observedAt: now, receivedAt: now },
      },
      payload,
    };
  }
}

function cryptoRandomId(): string { return Math.random().toString(36).slice(2, 12); }

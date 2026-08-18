import { stormFireEventBus, type StormFireEvent, type StormFireEventType } from "./serviceEventBus";
import { validateServiceContract, type StormFireServiceManifest } from "./serviceManifestAdapter";
import { canonicalEnvelopeToRecord, type CanonicalInformationRecord } from "./informationAdapter";
import { stormFireInformationFabric } from "../domain/informationFabric";
import { stormFireServiceFabric } from "./serviceFabric";

export interface ServiceQuery {
  kinds?: string[];
  source?: string;
  limit?: number;
}

export interface ServiceWriteRequest {
  kind: string;
  source: string;
  payload: Record<string, unknown>;
  relationships?: string[];
}

export interface ServiceEventRequest {
  type: StormFireEventType;
  payload: unknown;
  recipients: string[];
}

/** Single application boundary for Storm Fire services over canonical platform state. */
export class StormFireServiceGateway {
  register(service: StormFireServiceManifest): StormFireServiceManifest {
    const errors = validateServiceContract(service);
    if (errors.length) throw new Error(`Service rejected: ${errors.join("; ")}`);
    return service;
  }

  query(service: StormFireServiceManifest, query: ServiceQuery = {}): CanonicalInformationRecord[] {
    const canonical = this.assertCapability(service, "CONSUME");
    let records = stormFireInformationFabric.historyFor().map(canonicalEnvelopeToRecord);
    if (query.kinds?.length) records = records.filter((record) => query.kinds!.includes(record.kind));
    if (query.source) records = records.filter((record) => record.source === query.source);
    return query.limit ? records.slice(0, query.limit) : records;
  }

  contribute(service: StormFireServiceManifest, request: ServiceWriteRequest): CanonicalInformationRecord {
    const canonical = this.assertCapability(service, "CONTRIBUTE");
    const observedAt = new Date().toISOString();
    const informationType = request.kind as CanonicalInformationRecord["kind"];
    stormFireInformationFabric.publish({
      id: `${service.id}:${informationType}:${Date.now()}`,
      kind: informationType === "SERVICE_EVENT" || informationType === "ALERT" ? "EVENT" : "OBJECT",
      type: informationType,
      schemaVersion: 1,
      version: 1,
      occurredAt: observedAt,
      producerServiceId: service.id,
      producerParticipantId: canonical.ownerParticipantId,
      classification: "PUBLIC",
      geographicScopeIds: [],
      provenance: {
        sourceId: request.source || service.id,
        producerId: canonical.ownerParticipantId,
        observedAt,
        receivedAt: observedAt,
        lineageIds: [request.source || service.id],
      },
      payload: request.payload,
      tags: (request.relationships ?? []).map((relationshipId) => `rel:${relationshipId}:RELATED`),
    });
    const record = stormFireInformationFabric.historyFor(informationType).at(-1);
    if (!record) throw new Error(`Canonical information publication failed for ${service.id}.`);
    return canonicalEnvelopeToRecord(record);
  }

  publish(service: StormFireServiceManifest, request: ServiceEventRequest): StormFireEvent {
    this.assertCapability(service, "PUBLISH_EVENT");
    return stormFireEventBus.publish({
      type: request.type,
      sourceService: service.id,
      payload: request.payload,
      recipients: request.recipients,
    });
  }

  private assertCapability(
    service: StormFireServiceManifest,
    capability: StormFireServiceManifest["capabilities"][number],
  ) {
    if (!service.enabled) throw new Error(`Service is disabled: ${service.id}`);
    if (!service.capabilities.includes(capability)) {
      throw new Error(`${service.id} is not authorized for ${capability}`);
    }
    const canonical = stormFireServiceFabric.get(service.id);
    if (!canonical) throw new Error(`Canonical Service ${service.id} is not registered.`);
    if (canonical.status !== "ACTIVE") throw new Error(`Canonical Service ${service.id} is not active.`);
    if (!canonical.capabilities.some((item) => item.id === capability)) {
      throw new Error(`${service.id} canonical Service Fabric contract does not authorize ${capability}.`);
    }
    return canonical;
  }
}

export const stormFireServiceGateway = new StormFireServiceGateway();

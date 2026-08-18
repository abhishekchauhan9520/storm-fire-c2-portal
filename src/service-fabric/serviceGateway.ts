import { stormFireEventBus, type StormFireEvent, type StormFireEventType } from "./serviceEventBus";
import { validateServiceContract, type StormFireServiceManifest } from "./serviceManifestAdapter";
import { informationFabricBridge, type CanonicalInformationRecord } from "./informationFabricBridge";

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

/**
 * Single application boundary for Storm Fire services.
 * Services should use this gateway rather than reaching into React state or
 * individual modules directly. Authorization/policy can be layered here later.
 */
export class StormFireServiceGateway {
  register(service: StormFireServiceManifest): StormFireServiceManifest {
    const errors = validateServiceContract(service);
    if (errors.length) throw new Error(`Service rejected: ${errors.join("; ")}`);
    return service;
  }

  query(service: StormFireServiceManifest, query: ServiceQuery = {}): CanonicalInformationRecord[] {
    this.assertCapability(service, "CONSUME");
    let records = informationFabricBridge.snapshot();
    if (query.kinds?.length) records = records.filter((record) => query.kinds!.includes(record.kind));
    if (query.source) records = records.filter((record) => record.source === query.source);
    return query.limit ? records.slice(0, query.limit) : records;
  }

  contribute(service: StormFireServiceManifest, request: ServiceWriteRequest): CanonicalInformationRecord {
    this.assertCapability(service, "CONTRIBUTE");
    return informationFabricBridge.ingestServiceRecord(service.id, request.kind, request.payload, request.relationships ?? []);
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

  private assertCapability(service: StormFireServiceManifest, capability: StormFireServiceManifest["capabilities"][number]) {
    if (!service.enabled) throw new Error(`Service is disabled: ${service.id}`);
    if (!service.capabilities.includes(capability)) {
      throw new Error(`${service.id} is not authorized for ${capability}`);
    }
  }
}

export const stormFireServiceGateway = new StormFireServiceGateway();

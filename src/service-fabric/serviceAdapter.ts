import type { StormFireServiceManifest } from "./serviceManifestAdapter";
import type { CanonicalInformationRecord } from "./informationAdapter";
import type { StormFireEvent } from "./serviceEventBus";
import type { AlertPriority, ParallelAlertResult } from "./parallelAlertFabric";
import type { StormFireRelationship } from "./relationshipEngine";
import { stormFireServiceLifecycle } from "./serviceLifecycle";
import { stormFireServiceGateway } from "./serviceGateway";
import { connectRelationship } from "./relationshipGateway";
import { parallelAlertFabric } from "./parallelAlertFabric";

export interface ServiceAdapterContext { manifest: StormFireServiceManifest; }

export interface ServiceAdapter {
  readonly context: ServiceAdapterContext;
  install(): void;
  consume(query?: { kinds?: string[]; source?: string; limit?: number }): CanonicalInformationRecord[];
  contribute(kind: string, payload: Record<string, unknown>, relationships?: string[]): CanonicalInformationRecord;
  publish(type: StormFireEvent["type"], payload: unknown, recipients: string[]): StormFireEvent;
  relate(participantId: string, axis: "VERTICAL" | "HORIZONTAL" | "DIAGONAL", relation?: string): StormFireRelationship;
  alert(event: StormFireEvent, priority: AlertPriority): ParallelAlertResult;
}

/** Generic service adapter boundary over canonical platform services. */
export abstract class BaseStormFireServiceAdapter implements ServiceAdapter {
  readonly context: ServiceAdapterContext;
  protected constructor(manifest: StormFireServiceManifest) { this.context = { manifest }; }

  install(): void {
    const id = this.context.manifest.id;
    if (!stormFireServiceLifecycle.get(id)) stormFireServiceLifecycle.discover(this.context.manifest);
    const state = stormFireServiceLifecycle.get(id)?.state;
    if (state === "DISCOVERED") stormFireServiceLifecycle.register(id);
    if (stormFireServiceLifecycle.get(id)?.state === "REGISTERED") stormFireServiceLifecycle.validate(id);
  }

  consume(query = {}) { return stormFireServiceGateway.query(this.context.manifest, query); }
  contribute(kind: string, payload: Record<string, unknown>, relationships: string[] = []) {
    return stormFireServiceGateway.contribute(this.context.manifest, { kind, source: this.context.manifest.id, payload, relationships });
  }
  publish(type: StormFireEvent["type"], payload: unknown, recipients: string[]) {
    return stormFireServiceGateway.publish(this.context.manifest, { type, payload, recipients });
  }
  relate(participantId: string, axis: "VERTICAL" | "HORIZONTAL" | "DIAGONAL", relation = "INFORMATION_LINK") {
    return connectRelationship(this.context.manifest, { from: this.context.manifest.id, to: participantId, axis, relation });
  }
  alert(event: StormFireEvent, priority: AlertPriority) { return parallelAlertFabric.dispatch(event, priority); }
}

export type ServiceAdapterFactory<T extends ServiceAdapter = ServiceAdapter> = (manifest: StormFireServiceManifest) => T;

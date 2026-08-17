import type { CommandSystem, TacticalNode, TacticalTrack } from "../types";
import { commandSystemToCanonical, nodeToCanonical, trackToCanonical, type CanonicalInformationRecord } from "./informationAdapter";
import { stormFireEventBus } from "./serviceEventBus";

export interface ServiceFabricSnapshot {
  tracks: CanonicalInformationRecord<TacticalTrack>[];
  nodes: CanonicalInformationRecord<TacticalNode>[];
  systems: CanonicalInformationRecord<CommandSystem>[];
  serviceEvents: CanonicalInformationRecord[];
}

/**
 * Shared in-process context for the current UI build. The same interface can later
 * be backed by a remote Event Spine / Information Fabric without changing consumers.
 */
export class ServiceFabricContext {
  private snapshot: ServiceFabricSnapshot = { tracks: [], nodes: [], systems: [], serviceEvents: [] };

  syncOperationalContext(input: {
    tracks: TacticalTrack[];
    nodes: TacticalNode[];
    systems: CommandSystem[];
  }): ServiceFabricSnapshot {
    this.snapshot = {
      ...this.snapshot,
      tracks: input.tracks.map(trackToCanonical),
      nodes: input.nodes.map(nodeToCanonical),
      systems: input.systems.map(commandSystemToCanonical),
    };
    return this.getSnapshot();
  }

  connectEventSpine(): () => void {
    return stormFireEventBus.subscribe((event) => {
      const record = {
        id: event.id,
        kind: "SERVICE_EVENT" as const,
        source: event.sourceService,
        observedAt: event.timestamp,
        payload: event,
        relationships: event.recipients.map((targetId) => ({ targetId, relation: "AUTHORIZED_CONSUMER" })),
      };
      this.snapshot = {
        ...this.snapshot,
        serviceEvents: [record, ...this.snapshot.serviceEvents].slice(0, 100),
      };
    });
  }

  getSnapshot(): ServiceFabricSnapshot {
    return {
      tracks: [...this.snapshot.tracks],
      nodes: [...this.snapshot.nodes],
      systems: [...this.snapshot.systems],
      serviceEvents: [...this.snapshot.serviceEvents],
    };
  }
}

export const serviceFabricContext = new ServiceFabricContext();

import type { CommandSystem, TacticalNode, TacticalTrack } from "../types";
import { commandSystemToCanonical, nodeToCanonical, trackToCanonical, serviceEventToCanonical, type CanonicalInformationRecord } from "./informationAdapter";
import { stormFireEventBus } from "./serviceEventBus";

export interface ServiceFabricSnapshot {
  tracks: CanonicalInformationRecord<TacticalTrack>[];
  nodes: CanonicalInformationRecord<TacticalNode>[];
  systems: CanonicalInformationRecord<CommandSystem>[];
  serviceEvents: CanonicalInformationRecord[];
}

/** Transitional UI context; operational truth remains in the platform Information Fabric. */
export class ServiceFabricContext {
  private snapshot: ServiceFabricSnapshot = { tracks: [], nodes: [], systems: [], serviceEvents: [] };

  syncOperationalContext(input: { tracks: TacticalTrack[]; nodes: TacticalNode[]; systems: CommandSystem[] }): ServiceFabricSnapshot {
    this.snapshot = { ...this.snapshot, tracks: input.tracks.map(trackToCanonical), nodes: input.nodes.map(nodeToCanonical), systems: input.systems.map(commandSystemToCanonical) };
    return this.getSnapshot();
  }

  connectEventSpine(): () => void {
    return stormFireEventBus.subscribe((event) => {
      const record = serviceEventToCanonical(event);
      this.snapshot = { ...this.snapshot, serviceEvents: [record, ...this.snapshot.serviceEvents].slice(0, 100) };
    });
  }

  getSnapshot(): ServiceFabricSnapshot { return { tracks: [...this.snapshot.tracks], nodes: [...this.snapshot.nodes], systems: [...this.snapshot.systems], serviceEvents: [...this.snapshot.serviceEvents] }; }
}

export const serviceFabricContext = new ServiceFabricContext();

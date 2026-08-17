import type { CommandSystem, TacticalNode, TacticalTrack } from "../types";
import { commandSystemToCanonical, nodeToCanonical, serviceEventToCanonical, trackToCanonical, type CanonicalInformationRecord } from "./informationAdapter";
import { stormFireEventBus, type StormFireEvent } from "./serviceEventBus";

export type InformationListener = (records: CanonicalInformationRecord[]) => void;

/**
 * UI-side Information Fabric bridge.
 * It deliberately sits between existing Storm Fire operational objects and
 * service contracts; a server-side/event-stream implementation can replace
 * this store later without changing service-facing types.
 */
class InformationFabricBridge {
  private records = new Map<string, CanonicalInformationRecord>();
  private listeners = new Set<InformationListener>();

  subscribe(listener: InformationListener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  snapshot(): CanonicalInformationRecord[] {
    return Array.from(this.records.values()).sort((a, b) => b.observedAt.localeCompare(a.observedAt));
  }

  ingest(record: CanonicalInformationRecord): CanonicalInformationRecord {
    this.records.set(record.id, record);
    this.listeners.forEach((listener) => listener(this.snapshot()));
    return record;
  }

  ingestTrack(track: TacticalTrack) { return this.ingest(trackToCanonical(track)); }
  ingestNode(node: TacticalNode) { return this.ingest(nodeToCanonical(node)); }
  ingestCommandSystem(system: CommandSystem) { return this.ingest(commandSystemToCanonical(system)); }

  ingestEvent(event: StormFireEvent) {
    return this.ingest(serviceEventToCanonical(event));
  }

  clear(): void {
    this.records.clear();
    this.listeners.forEach((listener) => listener(this.snapshot()));
  }
}

export const stormFireInformationFabric = new InformationFabricBridge();

// Service events automatically enter the shared canonical information boundary.
stormFireEventBus.subscribe((event) => stormFireInformationFabric.ingestEvent(event));

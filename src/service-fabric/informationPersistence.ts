import type { CanonicalInformationRecord } from "./informationAdapter";
import type { InformationDeliveryRecord } from "./informationFabricBridge";

export interface InformationHistoryEntry {
  informationId: string;
  version: number;
  recordedAt: string;
  record: CanonicalInformationRecord;
}

export interface InformationPersistenceSnapshot {
  schemaVersion: 1;
  history: InformationHistoryEntry[];
  deliveries: InformationDeliveryRecord[];
}

export interface InformationPersistence {
  append(record: CanonicalInformationRecord): void;
  appendDelivery(delivery: InformationDeliveryRecord): void;
  history(informationId?: string): InformationHistoryEntry[];
  deliveries(participantId?: string): InformationDeliveryRecord[];
  snapshot(): InformationPersistenceSnapshot;
  clear(): void;
}

/** In-process persistence boundary; a durable backend can replace this contract later. */
export class InMemoryInformationPersistence implements InformationPersistence {
  private historyEntries: InformationHistoryEntry[] = [];
  private deliveryEntries: InformationDeliveryRecord[] = [];

  append(record: CanonicalInformationRecord): void {
    this.historyEntries.push({
      informationId: record.id,
      version: record.version,
      recordedAt: new Date().toISOString(),
      record: structuredClone(record),
    });
  }

  appendDelivery(delivery: InformationDeliveryRecord): void {
    this.deliveryEntries.push(structuredClone(delivery));
  }

  history(informationId?: string): InformationHistoryEntry[] {
    return this.historyEntries
      .filter((entry) => !informationId || entry.informationId === informationId)
      .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  }

  deliveries(participantId?: string): InformationDeliveryRecord[] {
    return this.deliveryEntries
      .filter((entry) => !participantId || entry.participantId === participantId)
      .sort((a, b) => b.deliveredAt.localeCompare(a.deliveredAt));
  }

  snapshot(): InformationPersistenceSnapshot {
    return { schemaVersion: 1, history: this.history(), deliveries: this.deliveries() };
  }

  clear(): void {
    this.historyEntries = [];
    this.deliveryEntries = [];
  }
}

export const stormFireInformationPersistence = new InMemoryInformationPersistence();

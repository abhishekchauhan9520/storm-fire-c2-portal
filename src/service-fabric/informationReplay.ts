import type { CanonicalInformationRecord } from "./informationAdapter";
import { stormFireInformationPersistence, type InformationHistoryEntry } from "./informationPersistence";

export interface InformationReplayQuery { informationId?: string; from?: string; to?: string; version?: number; }
export interface CorrelatedInformationGroup { key: string; records: CanonicalInformationRecord[]; }

/** Deterministic replay/query layer over the Information Fabric history boundary. */
export class InformationReplayService {
  query(query: InformationReplayQuery = {}): InformationHistoryEntry[] {
    return stormFireInformationPersistence.history(query.informationId).filter((entry) => {
      if (query.from && entry.recordedAt < query.from) return false;
      if (query.to && entry.recordedAt > query.to) return false;
      if (query.version !== undefined && entry.version !== query.version) return false;
      return true;
    });
  }

  replay(query: InformationReplayQuery = {}): CanonicalInformationRecord[] {
    return this.query(query).sort((a, b) => a.recordedAt.localeCompare(b.recordedAt)).map((entry) => structuredClone(entry.record));
  }

  correlateByProvenance(query: InformationReplayQuery = {}): CorrelatedInformationGroup[] {
    const groups = new Map<string, CanonicalInformationRecord[]>();
    for (const record of this.replay(query)) {
      const keys = record.provenance.lineage.length ? record.provenance.lineage : [record.provenance.sourceId];
      for (const key of keys) { const group = groups.get(key) ?? []; group.push(record); groups.set(key, group); }
    }
    return Array.from(groups, ([key, records]) => ({ key, records }));
  }
}

export const stormFireInformationReplay = new InformationReplayService();

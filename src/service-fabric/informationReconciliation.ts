import type { CanonicalInformationRecord } from "./informationAdapter";
import { stormFireInformationPersistence } from "./informationPersistence";
import { stormFireInformationReplay } from "./informationReplay";

export interface ReconciliationResult {
  informationId: string;
  localVersion: number;
  latestVersion: number;
  action: "NO_CHANGE" | "APPLY_LATEST";
  record?: CanonicalInformationRecord;
}

/** Compares local canonical state with recorded history and selects the latest version. */
export class InformationReconciliationService {
  reconcile(records: CanonicalInformationRecord[]): ReconciliationResult[] {
    return records.map((local) => {
      const history = stormFireInformationReplay.query({ informationId: local.id });
      const latest = history.reduce<typeof history[number] | undefined>((current, entry) => {
        if (!current || entry.version > current.version || (entry.version === current.version && entry.recordedAt > current.recordedAt)) return entry;
        return current;
      }, undefined);
      if (!latest || latest.version <= local.version) return { informationId: local.id, localVersion: local.version, latestVersion: local.version, action: "NO_CHANGE" };
      return { informationId: local.id, localVersion: local.version, latestVersion: latest.version, action: "APPLY_LATEST", record: structuredClone(latest.record) };
    });
  }

  latest(informationId: string): CanonicalInformationRecord | undefined {
    return stormFireInformationReplay.replay({ informationId }).at(-1);
  }

  historySize(): number { return stormFireInformationPersistence.history().length; }
}

export const stormFireInformationReconciliation = new InformationReconciliationService();

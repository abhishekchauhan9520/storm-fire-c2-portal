import fs from "node:fs";
import path from "node:path";
import type { LogisticsPersistenceAdapter } from "./logisticsPersistence";
import type { LogisticsRequest, LogisticsResource } from "./logisticsService";

interface LogisticsStore {
  version: 1;
  resources: LogisticsResource[];
  requests: LogisticsRequest[];
}

const EMPTY_STORE: LogisticsStore = { version: 1, resources: [], requests: [] };

/**
 * Durable single-node persistence adapter for the Logistics reference vertical.
 * It is intentionally behind the persistence interface so it can be replaced by
 * a database adapter without changing domain/application code.
 */
export class FileLogisticsPersistenceAdapter implements LogisticsPersistenceAdapter {
  private readonly filePath: string;

  constructor(filePath = process.env.STORM_FIRE_LOGISTICS_STORE ?? path.join(".storm-fire-data", "logistics.json")) {
    this.filePath = filePath;
  }

  loadResources(): Promise<LogisticsResource[]> {
    return Promise.resolve(this.readStore().resources.map((resource) => ({ ...resource })));
  }

  loadRequests(): Promise<LogisticsRequest[]> {
    return Promise.resolve(this.readStore().requests.map((request) => ({ ...request })));
  }

  saveResource(resource: LogisticsResource): Promise<void> {
    const store = this.readStore();
    store.resources = [...store.resources.filter((item) => item.id !== resource.id), { ...resource }];
    this.writeStore(store);
    return Promise.resolve();
  }

  saveRequest(request: LogisticsRequest): Promise<void> {
    const store = this.readStore();
    store.requests = [...store.requests.filter((item) => item.id !== request.id), { ...request }];
    this.writeStore(store);
    return Promise.resolve();
  }

  private readStore(): LogisticsStore {
    try {
      const raw = fs.readFileSync(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<LogisticsStore>;
      return {
        version: 1,
        resources: Array.isArray(parsed.resources) ? parsed.resources : [],
        requests: Array.isArray(parsed.requests) ? parsed.requests : [],
      };
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? String((error as { code?: unknown }).code) : "";
      if (code === "ENOENT") return { ...EMPTY_STORE, resources: [], requests: [] };
      throw error;
    }
  }

  private writeStore(store: LogisticsStore): void {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.tmp`;
    fs.writeFileSync(temporaryPath, JSON.stringify(store, null, 2), "utf8");
    fs.renameSync(temporaryPath, this.filePath);
  }
}

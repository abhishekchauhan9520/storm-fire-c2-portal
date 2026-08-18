import fs from "node:fs";
import path from "node:path";
import type { StormFireInformationEnvelope } from "../../domain/informationFabric";

export interface InformationFabricPersistence {
  load(): Promise<StormFireInformationEnvelope[]>;
  append(message: StormFireInformationEnvelope): Promise<void>;
}

interface Store {
  version: 1;
  messages: StormFireInformationEnvelope[];
}

const EMPTY: Store = { version: 1, messages: [] };

/** Durable single-node history adapter for the canonical Information Fabric. */
export class FileInformationFabricPersistence implements InformationFabricPersistence {
  constructor(private readonly filePath = process.env.STORM_FIRE_INFORMATION_STORE ?? path.join(".storm-fire-data", "information-fabric.json")) {}

  async load(): Promise<StormFireInformationEnvelope[]> {
    return this.readStore().messages.map((message) => this.clone(message));
  }

  async append(message: StormFireInformationEnvelope): Promise<void> {
    const store = this.readStore();
    const exists = store.messages.some((item) => item.id === message.id && item.version === message.version && item.kind === message.kind);
    if (exists) return;
    store.messages.push(this.clone(message));
    this.writeStore(store);
  }

  private readStore(): Store {
    try {
      const parsed = JSON.parse(fs.readFileSync(this.filePath, "utf8")) as Partial<Store>;
      return { version: 1, messages: Array.isArray(parsed.messages) ? parsed.messages : [] };
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? String((error as { code?: unknown }).code) : "";
      if (code === "ENOENT") return { ...EMPTY, messages: [] };
      throw error;
    }
  }

  private writeStore(store: Store): void {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.tmp`;
    fs.writeFileSync(temporaryPath, JSON.stringify(store, null, 2), "utf8");
    fs.renameSync(temporaryPath, this.filePath);
  }

  private clone<T>(message: StormFireInformationEnvelope<T>): StormFireInformationEnvelope<T> {
    return {
      ...message,
      geographicScopeIds: [...message.geographicScopeIds],
      provenance: {
        ...message.provenance,
        ...(message.provenance.lineageIds ? { lineageIds: [...message.provenance.lineageIds] } : {}),
      },
      ...(message.tags ? { tags: [...message.tags] } : {}),
    };
  }
}

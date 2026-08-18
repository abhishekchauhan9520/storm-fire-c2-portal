import fs from "node:fs";
import path from "node:path";
import type { EventIdentity } from "./eventIdempotency";
import type { EventJournal } from "./eventJournal";

interface EventJournalStore { version: 1; identities: string[]; }

/** Durable single-node event idempotency journal used by the Event Spine. */
export class FileEventJournal implements EventJournal {
  constructor(private readonly filePath = process.env.STORM_FIRE_EVENT_JOURNAL ?? path.join(".storm-fire-data", "event-journal.json")) {}

  async has(identity: EventIdentity): Promise<boolean> {
    return this.readStore().identities.includes(this.key(identity));
  }

  async append(identity: EventIdentity): Promise<void> {
    const store = this.readStore();
    const key = this.key(identity);
    if (store.identities.includes(key)) return;
    store.identities.push(key);
    this.writeStore(store);
  }

  private key(identity: EventIdentity): string {
    return `${identity.type}:${identity.id}:v${identity.version}`;
  }

  private readStore(): EventJournalStore {
    try {
      return JSON.parse(fs.readFileSync(this.filePath, "utf8")) as EventJournalStore;
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? String((error as { code?: unknown }).code) : "";
      if (code === "ENOENT") return { version: 1, identities: [] };
      throw error;
    }
  }

  private writeStore(store: EventJournalStore): void {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.tmp`;
    fs.writeFileSync(temporaryPath, JSON.stringify(store, null, 2), "utf8");
    fs.renameSync(temporaryPath, this.filePath);
  }
}

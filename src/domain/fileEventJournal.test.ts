import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { FileEventJournal } from "./fileEventJournal";

test("durable Event Journal remembers processed event identities", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "storm-fire-events-"));
  const filePath = path.join(directory, "events.json");
  const identity = { id: "evt-1", type: "LogisticsRequestCreated", version: 1 };

  try {
    const first = new FileEventJournal(filePath);
    assert.equal(await first.has(identity), false);
    await first.append(identity);
    assert.equal(await first.has(identity), true);

    const second = new FileEventJournal(filePath);
    assert.equal(await second.has(identity), true);
    await second.append(identity);
    assert.equal(await second.has(identity), true);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

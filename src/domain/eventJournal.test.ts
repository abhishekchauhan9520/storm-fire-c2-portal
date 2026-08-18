import assert from "node:assert/strict";
import test from "node:test";
import { InMemoryEventJournal } from "./eventJournal";

test("InMemoryEventJournal retains event identity across repeated checks", async () => {
  const journal = new InMemoryEventJournal();
  const event = { id: "evt-1", type: "logistics.alert", version: 1 };
  assert.equal(await journal.has(event), false);
  await journal.append(event);
  assert.equal(await journal.has(event), true);
  assert.equal(await journal.has({ ...event, version: 2 }), false);
});

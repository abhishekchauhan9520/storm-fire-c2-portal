import assert from "node:assert/strict";
import test from "node:test";
import { EventIdempotencyStore } from "./eventIdempotency";

test("EventIdempotencyStore accepts an event once and rejects a retry", () => {
  const store = new EventIdempotencyStore();
  const event = { id: "evt-1", type: "logistics.alert", version: 1 };
  assert.equal(store.markProcessed(event), true);
  assert.equal(store.markProcessed(event), false);
  assert.equal(store.has(event), true);
});

test("EventIdempotencyStore treats versions as distinct identities", () => {
  const store = new EventIdempotencyStore();
  assert.equal(store.markProcessed({ id: "evt-1", type: "logistics.alert", version: 1 }), true);
  assert.equal(store.markProcessed({ id: "evt-1", type: "logistics.alert", version: 2 }), true);
});

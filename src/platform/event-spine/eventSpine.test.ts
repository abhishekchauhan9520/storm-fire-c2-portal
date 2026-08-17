import assert from "node:assert/strict";
import test from "node:test";
import { EventSpine } from "./eventSpine";
import { InMemoryEventJournal } from "../../domain/eventJournal";
import type { Event } from "../../contracts/stormFireContracts";

const event: Event<{ objectId: string }> = {
  metadata: {
    eventId: "evt-1",
    eventType: "OBJECT_CREATED",
    schemaVersion: 1,
    source: "participant-1",
    producer: "participant-1",
    timestamp: "2026-08-18T00:00:00.000Z",
    provenance: { sourceId: "participant-1", observedAt: "2026-08-18T00:00:00.000Z", receivedAt: "2026-08-18T00:00:00.000Z" },
    classification: "CONTROLLED",
    geographicScopeIds: [],
  },
  payload: { objectId: "obj-1" },
};

test("Event Spine delivers a typed event once and rejects duplicate identity", async () => {
  const spine = new EventSpine(new InMemoryEventJournal());
  let deliveries = 0;
  spine.subscribe("OBJECT_CREATED", () => { deliveries += 1; });
  assert.equal(await spine.publish(event), true);
  assert.equal(await spine.publish(event), false);
  assert.equal(deliveries, 1);
});

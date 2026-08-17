import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createStormFireRuntime } from "./stormFireRuntime";
import type { CanonicalOperationalObject, OperationalAlert } from "../types";

describe("Storm Fire runtime", () => {
  it("accepts newer versions and emits an event", () => {
    const runtime = createStormFireRuntime();
    const object: CanonicalOperationalObject = {
      id: "obj-1", kind: "TRACK", version: 1, timestamp: "2026-08-18T00:00:00Z",
      sourceParticipantId: "participant-1", domains: ["LAND"], classification: "CONTROLLED",
      confidence: 0.9, attributes: { status: "ACTIVE" },
    };
    const event = runtime.ingestObject(object);
    assert.equal(event.type, "OBJECT_CREATED");
    assert.equal(runtime.state.objects.length, 1);
    assert.equal(runtime.state.events.length, 1);
  });

  it("does not replace an object with an older version", () => {
    const runtime = createStormFireRuntime();
    const base: CanonicalOperationalObject = {
      id: "obj-1", kind: "TRACK", version: 2, timestamp: "2026-08-18T00:00:00Z",
      sourceParticipantId: "participant-1", domains: ["AIR"], classification: "RESTRICTED",
      confidence: 0.8, attributes: { state: "new" },
    };
    runtime.ingestObject(base);
    runtime.ingestObject({ ...base, version: 1, attributes: { state: "old" } });
    assert.equal(runtime.state.objects[0].version, 2);
  });

  it("maintains independent parallel alert records", () => {
    const runtime = createStormFireRuntime();
    const makeAlert = (id: string): OperationalAlert => ({
      id, objectId: "obj-1", severity: "HIGH", state: "OPEN",
      createdAt: "2026-08-18T00:00:00Z", updatedAt: "2026-08-18T00:00:00Z", recipients: ["p-1", "p-2"],
    });
    runtime.publishAlert(makeAlert("a-1"));
    runtime.publishAlert(makeAlert("a-2"));
    assert.deepEqual(runtime.state.alerts.map((alert) => alert.id), ["a-1", "a-2"]);
  });
});

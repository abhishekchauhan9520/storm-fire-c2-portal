import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createStormFireRuntime } from "./stormFireRuntime";
import { FileInformationFabricPersistence } from "../platform/persistence/informationFabricPersistence";
import { InformationFabric } from "../domain/informationFabric";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
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

  it("keeps parallel alert records in the canonical fabric projection", () => {
    const runtime = createStormFireRuntime();
    const makeAlert = (id: string): OperationalAlert => ({
      id, objectId: "obj-1", severity: "HIGH", state: "OPEN",
      createdAt: "2026-08-18T00:00:00Z", updatedAt: "2026-08-18T00:00:00Z", recipients: ["p-1", "p-2"],
    });
    runtime.publishAlert(makeAlert("a-1"));
    runtime.publishAlert(makeAlert("a-2"));
    assert.deepEqual(runtime.state.alerts.map((alert) => alert.id), ["a-1", "a-2"]);
    assert.equal(runtime.informationFabric.historyFor("operational.alert").length, 2);
  });

  it("rebuilds alert state from durable canonical information", async () => {
    const directory = mkdtempSync(path.join(tmpdir(), "storm-fire-runtime-alerts-"));
    const filePath = path.join(directory, "information.json");

    try {
      const firstFabric = new InformationFabric(new FileInformationFabricPersistence(filePath));
      const firstRuntime = createStormFireRuntime({}, firstFabric);
      firstRuntime.publishAlert({
        id: "a-1", objectId: "obj-1", severity: "CRITICAL", state: "OPEN",
        createdAt: "2026-08-18T00:00:00Z", updatedAt: "2026-08-18T00:01:00Z", recipients: ["p-1"],
      });

      const secondFabric = new InformationFabric(new FileInformationFabricPersistence(filePath));
      await secondFabric.hydrate();
      const secondRuntime = createStormFireRuntime({}, secondFabric);

      assert.deepEqual(secondRuntime.state.alerts.map((alert) => alert.id), ["a-1"]);
      assert.equal(secondRuntime.state.alerts[0]?.severity, "CRITICAL");
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});

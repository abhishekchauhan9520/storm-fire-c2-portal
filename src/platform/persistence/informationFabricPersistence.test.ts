import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { InformationFabric } from "../../domain/informationFabric";
import { FileInformationFabricPersistence } from "./informationFabricPersistence";

test("canonical Information Fabric history survives restart", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "storm-fire-information-"));
  const filePath = path.join(directory, "information-fabric.json");
  const message = {
    id: "object-1",
    kind: "OBJECT" as const,
    type: "Observation",
    schemaVersion: 1,
    version: 2,
    occurredAt: "2026-08-18T00:00:00.000Z",
    producerParticipantId: "operator-command",
    classification: "CONTROLLED" as const,
    geographicScopeIds: ["scope-1"],
    provenance: {
      sourceId: "operator-command",
      producerId: "operator-command",
      observedAt: "2026-08-18T00:00:00.000Z",
      receivedAt: "2026-08-18T00:00:01.000Z",
      confidence: 0.9,
    },
    payload: { state: "ACTIVE" },
  };

  try {
    const first = new InformationFabric(new FileInformationFabricPersistence(filePath));
    first.publish(message);

    const second = new InformationFabric(new FileInformationFabricPersistence(filePath));
    await second.hydrate();

    assert.deepEqual(second.historyFor("Observation"), [message]);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

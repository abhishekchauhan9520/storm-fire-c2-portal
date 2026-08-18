import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { InformationFabric } from "../../domain/informationFabric";
import { FileInformationFabricPersistence } from "./informationFabricPersistence";

function message(id: string) {
  return {
    id,
    kind: "OBJECT" as const,
    type: "Observation",
    schemaVersion: 1,
    version: 1,
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
    payload: { state: "ACTIVE", id },
  };
}

test("canonical Information Fabric history survives restart", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "storm-fire-information-"));
  const filePath = path.join(directory, "information-fabric.json");

  try {
    const first = new InformationFabric(new FileInformationFabricPersistence(filePath));
    first.publish(message("object-1"));
    const second = new InformationFabric(new FileInformationFabricPersistence(filePath));
    await second.hydrate();

    assert.deepEqual(second.historyFor("Observation"), [message("object-1")]);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("durable Information Fabric persistence serializes concurrent appends", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "storm-fire-information-concurrent-"));
  const filePath = path.join(directory, "information-fabric.json");

  try {
    const persistence = new FileInformationFabricPersistence(filePath);
    await Promise.all(Array.from({ length: 20 }, (_, index) => persistence.append(message(`object-${index}`))));

    const restored = new FileInformationFabricPersistence(filePath);
    const persisted = await restored.load();
    assert.equal(persisted.length, 20);
    assert.deepEqual(new Set(persisted.map((item) => item.id)).size, 20);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

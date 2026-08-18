import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { FileLogisticsPersistenceAdapter } from "./fileLogisticsPersistence";
import { InMemoryLogisticsRepository } from "./logisticsRepository";
import { LogisticsService } from "./logisticsService";
import { PersistentLogisticsRepository } from "./logisticsPersistence";

test("Logistics durable persistence survives repository recreation", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "storm-fire-logistics-"));
  const filePath = path.join(directory, "logistics.json");

  try {
    const firstRepository = new PersistentLogisticsRepository(
      new InMemoryLogisticsRepository(),
      new FileLogisticsPersistenceAdapter(filePath),
    );
    await firstRepository.hydrate();
    const firstService = new LogisticsService(firstRepository);

    firstService.registerResource({ id: "fuel-1", name: "Fuel", kind: "FUEL", quantity: 100, unit: "L", readiness: "READY" });
    firstService.createRequest({ id: "req-1", requesterParticipantId: "operator-command", resourceId: "fuel-1", quantity: 20, priority: "HIGH" });

    const secondRepository = new PersistentLogisticsRepository(
      new InMemoryLogisticsRepository(),
      new FileLogisticsPersistenceAdapter(filePath),
    );
    await secondRepository.hydrate();

    assert.equal(secondRepository.getResource("fuel-1")?.quantity, 100);
    assert.equal(secondRepository.getRequest("req-1")?.requesterParticipantId, "operator-command");
    assert.equal(secondRepository.getRequest("req-1")?.status, "OPEN");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

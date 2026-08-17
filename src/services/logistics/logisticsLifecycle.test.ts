import assert from "node:assert/strict";
import test from "node:test";
import { stormFireEventSpine } from "../../platform/event-spine/eventSpine";
import { LogisticsLifecycle } from "./logisticsLifecycle";
import { LogisticsService } from "./logisticsService";

test("LogisticsLifecycle emits create and status-change events through the Event Spine", async () => {
  const service = new LogisticsService();
  const lifecycle = new LogisticsLifecycle(service);
  const publishedTypes: string[] = [];
  const unsubscribeCreated = stormFireEventSpine.subscribe("LogisticsRequestCreated", (event) => {
    publishedTypes.push(event.metadata.eventType);
  });
  const unsubscribeChanged = stormFireEventSpine.subscribe("LogisticsRequestStatusChanged", (event) => {
    publishedTypes.push(event.metadata.eventType);
  });

  try {
    service.registerResource({ id: "fuel-1", name: "Fuel", kind: "FUEL", quantity: 100, unit: "L", readiness: "READY" });
    const created = await lifecycle.createRequest({ id: "req-1", requesterParticipantId: "operator-command", resourceId: "fuel-1", quantity: 20, priority: "HIGH" });
    assert.equal(created.data.status, "OPEN");

    const changed = await lifecycle.updateRequestStatus("req-1", "IN_PROGRESS", "operator-command");
    assert.equal(changed.data.status, "IN_PROGRESS");
    assert.deepEqual(publishedTypes, ["LogisticsRequestCreated", "LogisticsRequestStatusChanged"]);
  } finally {
    unsubscribeCreated();
    unsubscribeChanged();
  }
});

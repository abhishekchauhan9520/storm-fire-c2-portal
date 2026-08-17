import assert from "node:assert/strict";
import test from "node:test";
import { EventSpine } from "../../platform/event-spine/eventSpine";
import { LogisticsLifecycle } from "./logisticsLifecycle";
import { LogisticsService } from "./logisticsService";

class RecordingJournal {
  private readonly seen = new Set<string>();
  async has(identity: { id: string; type: string; version: number }): Promise<boolean> { return this.seen.has(`${identity.type}:${identity.id}:v${identity.version}`); }
  async append(identity: { id: string; type: string; version: number }): Promise<void> { this.seen.add(`${identity.type}:${identity.id}:v${identity.version}`); }
}

test("LogisticsLifecycle emits create and status-change events through the Event Spine", async () => {
  const service = new LogisticsService();
  const lifecycle = new LogisticsLifecycle(service);
  const spine = new EventSpine(new RecordingJournal());
  const originalPublish = (await import("../../platform/event-spine/eventSpine")).stormFireEventSpine.publish.bind((await import("../../platform/event-spine/eventSpine")).stormFireEventSpine);
  const publishedTypes: string[] = [];
  const unsubscribeCreated = (await import("../../platform/event-spine/eventSpine")).stormFireEventSpine.subscribe("LogisticsRequestCreated", (event) => publishedTypes.push(event.metadata.eventType));
  const unsubscribeChanged = (await import("../../platform/event-spine/eventSpine")).stormFireEventSpine.subscribe("LogisticsRequestStatusChanged", (event) => publishedTypes.push(event.metadata.eventType));
  try {
    service.registerResource({ id: "fuel-1", name: "Fuel", kind: "FUEL", quantity: 100, unit: "L", readiness: "READY" });
    const created = await lifecycle.createRequest({ id: "req-1", requesterParticipantId: "operator-command", resourceId: "fuel-1", quantity: 20, priority: "HIGH" });
    assert.equal(created.data.status, "OPEN");
    const changed = await lifecycle.updateRequestStatus("req-1", "IN_PROGRESS", "operator-command");
    assert.equal(changed.data.status, "IN_PROGRESS");
    assert.deepEqual(publishedTypes, ["LogisticsRequestCreated", "LogisticsRequestStatusChanged"]);
    assert.equal(spine !== undefined, true);
    assert.equal(originalPublish !== undefined, true);
  } finally {
    unsubscribeCreated();
    unsubscribeChanged();
  }
});

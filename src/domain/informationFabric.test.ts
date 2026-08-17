import assert from "node:assert/strict";
import test from "node:test";
import { InformationFabric } from "./informationFabric";

const event = () => ({
  id: "evt-1", kind: "EVENT" as const, type: "logistics.alert", schemaVersion: 1, version: 1,
  occurredAt: "2026-08-17T00:00:00.000Z", producerServiceId: "logistics", producerParticipantId: "company-a",
  classification: "CONTROLLED" as const, geographicScopeIds: ["aor-1"],
  provenance: { sourceId: "logistics", producerId: "logistics", observedAt: "2026-08-17T00:00:00.000Z", receivedAt: "2026-08-17T00:00:00.000Z" },
  payload: { requestId: "req-1" },
});

test("InformationFabric does not dispatch duplicate events", () => {
  const fabric = new InformationFabric();
  let deliveries = 0;
  fabric.subscribe({ id: "sub-1", participantId: "brigade-a", informationTypes: ["logistics.alert"], enabled: true, handler: () => deliveries++ });
  fabric.publish(event());
  fabric.publish(event());
  assert.equal(deliveries, 1);
  assert.equal(fabric.historyFor("logistics.alert").length, 1);
});

test("InformationFabric allows a different event version", () => {
  const fabric = new InformationFabric();
  const first = event();
  const second = { ...first, version: 2 };
  fabric.publish(first);
  fabric.publish(second);
  assert.equal(fabric.historyFor("logistics.alert").length, 2);
});

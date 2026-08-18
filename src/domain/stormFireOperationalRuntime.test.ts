import assert from "node:assert/strict";
import test from "node:test";
import { stormFireInformationFabric } from "./informationFabric";
import { StormFireOperationalRuntime } from "./stormFireOperationalRuntime";
import { stormFireServiceFabric } from "../service-fabric/serviceFabric";

test("operational runtime accepts participant-produced information without a service producer", () => {
  const previousHistory = stormFireInformationFabric.historyFor();
  const runtime = new StormFireOperationalRuntime();

  const message = {
    id: `participant-observation-${Date.now()}`,
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
    payload: { source: "participant" },
  };

  try {
    const result = runtime.publishAndDispatch(message, []);
    assert.equal(result.informationId, message.id);
    assert.equal(stormFireInformationFabric.historyFor("Observation").some((item) => item.id === message.id), true);
  } finally {
    stormFireInformationFabric.clear();
    for (const item of previousHistory) stormFireInformationFabric.publish(item);
    void stormFireServiceFabric;
  }
});

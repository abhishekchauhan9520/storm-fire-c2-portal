import assert from "node:assert/strict";
import test from "node:test";
import type { Event } from "../../contracts/stormFireContracts";
import { stormFireAuthorization } from "../../domain/authorizationPolicy";
import { stormFireInformationRelationships } from "../../domain/informationRelationshipEngine";
import { dispatchParticipantEvent } from "./participantEventDispatch";
import { stormFireParticipantEventStream } from "./participantEventStream";

const event: Event<{ requesterParticipantId: string }> = {
  metadata: {
    eventId: "evt-policy-1",
    eventType: "LogisticsRequestCreated",
    schemaVersion: 1,
    source: "logistics",
    producer: "operator-command",
    timestamp: "2026-08-18T00:00:00.000Z",
    classification: "CONTROLLED",
    geographicScopeIds: [],
    provenance: { sourceId: "logistics", producerId: "operator-command", observedAt: "2026-08-18T00:00:00.000Z", receivedAt: "2026-08-18T00:00:00.000Z" },
  },
  payload: { requesterParticipantId: "operator-command" },
};

test("realtime fan-out requires both an information path and an allow policy", () => {
  stormFireAuthorization.clear();
  const relationshipId = "rel-policy-test";
  try { stormFireInformationRelationships.remove(relationshipId); } catch { /* isolated test state */ }
  stormFireInformationRelationships.register({
    id: relationshipId,
    fromParticipantId: "operator-command",
    toParticipantId: "logistics-peer",
    direction: "HORIZONTAL",
    informationTypes: ["LogisticsRequest"],
    enabled: true,
  });

  const received: string[] = [];
  const unsubscribeCommand = stormFireParticipantEventStream.subscribe("operator-command", () => received.push("operator-command"));
  const unsubscribePeer = stormFireParticipantEventStream.subscribe("logistics-peer", () => received.push("logistics-peer"));
  try {
    stormFireAuthorization.register({ id: "allow-command", version: 1, effect: "ALLOW", participantIds: ["operator-command"], informationTypes: ["LogisticsRequest"], classifications: ["CONTROLLED"], priority: 100, enabled: true });
    assert.deepEqual(dispatchParticipantEvent(event), ["operator-command"]);
    assert.deepEqual(received, ["operator-command"]);

    stormFireAuthorization.register({ id: "allow-peer", version: 1, effect: "ALLOW", participantIds: ["logistics-peer"], informationTypes: ["LogisticsRequest"], classifications: ["CONTROLLED"], priority: 100, enabled: false });
    assert.deepEqual(dispatchParticipantEvent({ ...event, metadata: { ...event.metadata, eventId: "evt-policy-2" } }), ["operator-command"]);
    assert.deepEqual(received, ["operator-command", "operator-command"]);
  } finally {
    unsubscribeCommand();
    unsubscribePeer();
    stormFireAuthorization.clear();
    stormFireInformationRelationships.remove(relationshipId);
  }
});

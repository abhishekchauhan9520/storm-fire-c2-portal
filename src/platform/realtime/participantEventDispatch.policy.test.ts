import assert from "node:assert/strict";
import test from "node:test";
import type { Event } from "../../contracts/stormFireContracts";
import { runDynamicCopScenario } from "../../domain/dynamicCopScenario";
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
    producer: "company-cdr",
    timestamp: "2026-08-18T00:00:00.000Z",
    classification: "CONTROLLED",
    geographicScopeIds: [],
    provenance: { sourceId: "logistics", producerId: "company-cdr", observedAt: "2026-08-18T00:00:00.000Z", receivedAt: "2026-08-18T00:00:00.000Z" },
  },
  payload: { requesterParticipantId: "company-cdr" },
};

test("realtime fan-out requires both an information path and an allow policy", () => {
  runDynamicCopScenario();
  stormFireAuthorization.clear();
  const relationshipId = "rel-policy-test";
  try { stormFireInformationRelationships.remove(relationshipId); } catch { /* isolated test state */ }
  stormFireInformationRelationships.register({
    id: relationshipId,
    fromParticipantId: "company-cdr",
    toParticipantId: "brigade-cdr",
    direction: "HORIZONTAL",
    allowedInformationTypes: ["LogisticsRequest"],
    enabled: true,
  });

  const received: string[] = [];
  const unsubscribeCommand = stormFireParticipantEventStream.subscribe("company-cdr", () => received.push("company-cdr"));
  const unsubscribePeer = stormFireParticipantEventStream.subscribe("brigade-cdr", () => received.push("brigade-cdr"));
  try {
    stormFireAuthorization.register({ id: "allow-company", version: 1, effect: "ALLOW", participantIds: ["company-cdr"], informationTypes: ["LogisticsRequest"], classifications: ["CONTROLLED"], priority: 100, enabled: true });
    assert.deepEqual(dispatchParticipantEvent(event), ["company-cdr"]);
    assert.deepEqual(received, ["company-cdr"]);

    stormFireAuthorization.register({ id: "allow-brigade", version: 1, effect: "ALLOW", participantIds: ["brigade-cdr"], informationTypes: ["LogisticsRequest"], classifications: ["CONTROLLED"], priority: 100, enabled: false });
    assert.deepEqual(dispatchParticipantEvent({ ...event, metadata: { ...event.metadata, eventId: "evt-policy-2" } }), ["company-cdr"]);
    assert.deepEqual(received, ["company-cdr", "company-cdr"]);
  } finally {
    unsubscribeCommand();
    unsubscribePeer();
    stormFireAuthorization.clear();
    stormFireInformationRelationships.remove(relationshipId);
    runDynamicCopScenario();
  }
});

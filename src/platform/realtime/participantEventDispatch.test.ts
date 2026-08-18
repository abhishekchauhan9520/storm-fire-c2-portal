import assert from "node:assert/strict";
import test from "node:test";
import type { Event } from "../../contracts/stormFireContracts";
import { runDynamicCopScenario } from "../../domain/dynamicCopScenario";
import { stormFireInformationRelationships } from "../../domain/informationRelationshipEngine";
import { stormFireParticipantEventStream } from "./participantEventStream";
import { dispatchParticipantEvent } from "./participantEventDispatch";

test("dispatches one Logistics event to source and relationship-connected participants in parallel", () => {
  runDynamicCopScenario();
  const source = "company-cdr";
  const command = "brigade-cdr";
  const relationshipId = "rt-brigade";

  stormFireInformationRelationships.remove(relationshipId);
  stormFireInformationRelationships.register({
    id: relationshipId,
    fromParticipantId: source,
    toParticipantId: command,
    direction: "DIAGONAL",
    informationTypes: ["LogisticsRequest"],
    enabled: true,
  });

  const received = new Map<string, string[]>();
  const unsubscribers = [source, command].map((participantId) => stormFireParticipantEventStream.subscribe(participantId, (event) => {
    const current = received.get(event.participantId) ?? [];
    received.set(event.participantId, [...current, event.eventId]);
  }));

  try {
    const event: Event<{ requesterParticipantId: string }> = {
      metadata: {
        eventId: "evt-logistics-1",
        eventType: "LogisticsRequestCreated",
        schemaVersion: 1,
        source: "logistics",
        producer: source,
        timestamp: new Date().toISOString(),
        correlationId: "req-1",
        classification: "CONTROLLED",
        geographicScopeIds: [],
        provenance: { sourceId: source, producerId: source, observedAt: new Date().toISOString(), receivedAt: new Date().toISOString() },
      },
      payload: { requesterParticipantId: source },
    };

    const recipients = dispatchParticipantEvent(event);
    assert.deepEqual(new Set(recipients), new Set([source, command]));
    assert.equal(received.get(source)?.length, 1);
    assert.equal(received.get(command)?.length, 1);
  } finally {
    for (const unsubscribe of unsubscribers) unsubscribe();
    stormFireInformationRelationships.remove(relationshipId);
  }
});

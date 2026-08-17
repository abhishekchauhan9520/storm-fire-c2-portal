import assert from "node:assert/strict";
import test from "node:test";
import type { Event } from "../../contracts/stormFireContracts";
import { stormFireInformationRelationships } from "../../domain/informationRelationshipEngine";
import { stormFireParticipantEventStream } from "./participantEventStream";
import { dispatchParticipantEvent } from "./participantEventDispatch";

test("dispatches one Logistics event to source and relationship-connected participants in parallel", () => {
  const source = "uav-1";
  const command = "command-1";
  const intelligence = "intel-1";
  const relationshipIds = ["rt-command", "rt-intel"];

  for (const id of relationshipIds) stormFireInformationRelationships.remove(id);
  stormFireInformationRelationships.register({ id: relationshipIds[0], fromParticipantId: source, toParticipantId: command, direction: "DIAGONAL", informationTypes: ["LogisticsRequest"], enabled: true });
  stormFireInformationRelationships.register({ id: relationshipIds[1], fromParticipantId: source, toParticipantId: intelligence, direction: "HORIZONTAL", informationTypes: ["LogisticsRequest"], enabled: true });

  const received = new Map<string, string[]>();
  const unsubscribers = [source, command, intelligence].map((participantId) => stormFireParticipantEventStream.subscribe(participantId, (event) => {
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
    assert.deepEqual(new Set(recipients), new Set([source, command, intelligence]));
    assert.equal(received.get(source)?.length, 1);
    assert.equal(received.get(command)?.length, 1);
    assert.equal(received.get(intelligence)?.length, 1);
  } finally {
    for (const unsubscribe of unsubscribers) unsubscribe();
    for (const id of relationshipIds) stormFireInformationRelationships.remove(id);
  }
});

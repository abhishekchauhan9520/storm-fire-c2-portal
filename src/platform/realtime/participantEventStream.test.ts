import assert from "node:assert/strict";
import test from "node:test";
import { ParticipantEventStream } from "./participantEventStream";

test("participant event stream isolates listeners by participant", () => {
  const stream = new ParticipantEventStream();
  const command: string[] = [];
  const intelligence: string[] = [];

  const unsubscribeCommand = stream.subscribe("operator-command", (event) => command.push(event.type));
  const unsubscribeIntelligence = stream.subscribe("intelligence-cell", (event) => intelligence.push(event.type));

  stream.publish({ type: "LogisticsRequestCreated", eventId: "e-1", participantId: "operator-command" });
  stream.publish({ type: "LogisticsRequestStatusChanged", eventId: "e-2", participantId: "intelligence-cell" });

  assert.deepEqual(command, ["LogisticsRequestCreated"]);
  assert.deepEqual(intelligence, ["LogisticsRequestStatusChanged"]);
  assert.equal(stream.listenerCount("operator-command"), 1);

  unsubscribeCommand();
  unsubscribeIntelligence();
  assert.equal(stream.listenerCount(), 0);
});

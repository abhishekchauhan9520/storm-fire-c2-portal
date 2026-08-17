import assert from "node:assert/strict";
import test from "node:test";

export function bindAuthenticatedRequester<T extends Record<string, unknown>>(body: T, participantId: string): T & { requesterParticipantId: string } {
  return { ...body, requesterParticipantId: participantId };
}

test("authenticated participant is the authoritative Logistics requester", () => {
  const request = bindAuthenticatedRequester({
    id: "req-1",
    requesterParticipantId: "spoofed-participant",
    resourceId: "fuel-1",
    quantity: 10,
    priority: "HIGH",
  }, "operator-command");

  assert.equal(request.requesterParticipantId, "operator-command");
  assert.notEqual(request.requesterParticipantId, "spoofed-participant");
});

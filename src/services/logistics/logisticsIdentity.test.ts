import assert from "node:assert/strict";
import test from "node:test";
import { bindAuthenticatedRequester } from "./logisticsIdentity";

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

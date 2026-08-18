import assert from "node:assert/strict";
import test from "node:test";
import { authorizeAlertRead } from "./alertReadAuthorization";
import type { CanonicalOperationalObject, OperationalAlert } from "../types";

test("alert read authorization rejects participants who are not recorded recipients", () => {
  const alert: OperationalAlert = {
    id: "alert-1",
    objectId: "object-1",
    severity: "HIGH",
    state: "OPEN",
    createdAt: "2026-08-18T00:00:00Z",
    updatedAt: "2026-08-18T00:00:00Z",
    recipients: ["participant-a"],
  };
  const object: CanonicalOperationalObject = {
    id: "object-1",
    kind: "TRACK",
    version: 1,
    timestamp: "2026-08-18T00:00:00Z",
    sourceParticipantId: "participant-source",
    domains: ["LAND"],
    classification: "CONTROLLED",
    confidence: 1,
    attributes: {},
  };

  const decision = authorizeAlertRead("participant-b", alert, object);
  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, "Participant is not a recorded alert recipient.");
});

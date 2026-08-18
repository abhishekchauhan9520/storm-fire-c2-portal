import assert from "node:assert/strict";
import test from "node:test";
import { AuthorizationPolicyEngine } from "./authorizationPolicy";

test("authorization defaults to deny when no policy matches", () => {
  const engine = new AuthorizationPolicyEngine();
  const decision = engine.decide({ requestId: "req-1", participantId: "p-1", informationType: "TRACK" });
  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, "NO_MATCH");
});

test("authorization evaluates relationship scope", () => {
  const engine = new AuthorizationPolicyEngine();
  engine.register({ id: "policy-1", version: 1, effect: "ALLOW", relationshipIds: ["rel-1"], informationTypes: ["TRACK"], priority: 10, enabled: true });
  assert.equal(engine.decide({ requestId: "req-2", participantId: "p-1", informationType: "TRACK", relationshipIds: ["rel-1"] }).allowed, true);
  assert.equal(engine.decide({ requestId: "req-3", participantId: "p-1", informationType: "TRACK", relationshipIds: ["rel-2"] }).allowed, false);
});

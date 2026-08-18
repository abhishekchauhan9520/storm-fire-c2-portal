import assert from "node:assert/strict";
import test from "node:test";
import { buildStormFireAdvisoryContext, generateBoundedAdvisory } from "./aiDecisionSupport";

test("advisory context is derived from one participant Dynamic COP", () => {
  const context = buildStormFireAdvisoryContext({
    participantId: "operator-command",
    organizationIds: ["company-a"],
    roleIds: ["COMMAND"],
    organizationId: "company-a",
    roleId: "COMMAND",
    geographicScopeIds: ["local-aor"],
    serviceIds: ["logistics", "uav"],
    information: [
      { id: "track-1", occurredAt: "2026-08-18T00:00:00.000Z", informationType: "Track", organizationId: "company-a", payload: { name: "Track Alpha" } },
      { id: "alert-1", occurredAt: "2026-08-18T00:00:01.000Z", informationType: "Alert", organizationId: "company-a", payload: { state: "OPEN" } },
      { id: "alert-2", occurredAt: "2026-08-18T00:00:02.000Z", informationType: "Alert", organizationId: "company-a", payload: { state: "RESOLVED" } },
    ],
    generatedAt: "2026-08-18T00:00:03.000Z",
  });

  assert.deepEqual(context.services, ["logistics", "uav"]);
  assert.equal(context.informationCount, 3);
  assert.equal(context.unresolvedAlertCount, 1);
  assert.deepEqual(context.informationTypes, ["Alert", "Track"]);

  const response = generateBoundedAdvisory(context, "Explain the current information picture.");
  assert.match(response, /authorized information objects: 3/i);
  assert.match(response, /does not issue operational commands/i);
});

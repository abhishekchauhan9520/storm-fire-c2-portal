import assert from "node:assert/strict";
import test from "node:test";
import { evaluateStormFireInformationVisibility } from "./informationVisibility";

function context() {
  return {
    participantId: "operator-command",
    organizationIds: ["org-command"],
    roleIds: ["role-operator"],
    organizationId: "org-command",
    roleId: "role-operator",
    geographicScopeIds: ["scope-1"],
    relationshipIds: ["relationship-1"],
    informationClassification: "CONTROLLED" as const,
    services: [
      {
        id: "service-denied-path",
        informationTypesConsumed: ["Observation"],
        informationTypesProduced: [],
      },
      {
        id: "service-allowed-path",
        informationTypesConsumed: ["Observation"],
        informationTypesProduced: ["Assessment"],
      },
    ],
  };
}

test("Dynamic COP visibility accepts an authorized service path when an earlier eligible service is denied", () => {
  const decision = evaluateStormFireInformationVisibility(context(), {
    id: "observation-1",
    informationType: "Observation",
    organizationId: "org-command",
    geographicScopeId: "scope-1",
    relationshipId: "relationship-1",
    classification: "CONTROLLED",
    producerParticipantId: "operator-command",
  });

  assert.equal(decision.allowed, true);
  assert.ok(decision.reasons.some((reason) => reason.includes("service")));
});

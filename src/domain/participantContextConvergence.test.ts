import assert from "node:assert/strict";
import test from "node:test";
import { runDynamicCopScenario } from "./dynamicCopScenario";
import { resolveParticipantOperationalContext } from "./participantOperationalContext";
import { stormFireParticipantContexts } from "./participantContext";

test("participant operational projection is derived from canonical ParticipantContext", () => {
  const result = runDynamicCopScenario();
  const company = stormFireParticipantContexts.resolve("company-cdr");
  const brigade = stormFireParticipantContexts.resolve("brigade-cdr");

  assert.ok(company);
  assert.ok(brigade);
  assert.deepEqual(company?.serviceIds, ["logistics", "uav"]);
  assert.deepEqual(brigade?.serviceIds, ["logistics", "uav", "ew", "air-defence"]);
  assert.equal(company?.classification, "CONTROLLED");
  assert.equal(brigade?.classification, "CONTROLLED");
  assert.equal(result.companyCop.information.length, 1);
  assert.equal(result.brigadeCop.information.length, 2);
});

test("compatibility operational-context fields cannot override canonical assignment", () => {
  runDynamicCopScenario();

  assert.throws(
    () => resolveParticipantOperationalContext({
      participantId: "company-cdr",
      organizationId: "company-alpha",
      roleId: "company-commander",
      serviceIds: ["ew"],
    }),
    /not part of the canonical participant context/,
  );

  assert.throws(
    () => resolveParticipantOperationalContext({
      participantId: "company-cdr",
      organizationId: "brigade-alpha",
      roleId: "company-commander",
    }),
    /not assigned to participant/,
  );
});

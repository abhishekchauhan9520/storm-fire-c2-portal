import assert from "node:assert/strict";
import test from "node:test";
import { bootstrapStormFireDevelopmentScenario } from "./stormFireBootstrap";
import { buildDynamicCopFromFabric } from "../domain/dynamicCopFromFabric";
import { resolveParticipantOperationalContext } from "../domain/participantOperationalContext";
import { stormFireInformationFabric } from "../domain/informationFabric";

test("development baseline resolves a canonical participant COP", () => {
  bootstrapStormFireDevelopmentScenario();
  const context = resolveParticipantOperationalContext("operator-command");
  const cop = buildDynamicCopFromFabric(context, stormFireInformationFabric.historyFor());

  assert.equal(cop.participantId, "operator-command");
  assert.equal(cop.organizationId, "company-a");
  assert.ok(cop.serviceIds.includes("logistics"));
  assert.ok(cop.serviceIds.includes("uav"));
  assert.ok(cop.information.some((item) => item.informationType === "Track"));
  assert.ok(cop.generatedAt);
});

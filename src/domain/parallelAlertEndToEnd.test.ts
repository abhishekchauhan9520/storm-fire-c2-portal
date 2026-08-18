import assert from "node:assert/strict";
import test from "node:test";
import { authorizeAlertDissemination } from "./alertAuthorization";
import { authorizeAlertRead } from "./alertReadAuthorization";
import { bootstrapStormFireDevelopmentScenario } from "../platform/stormFireBootstrap";
import { createStormFireRuntime } from "../core/stormFireRuntime";
import { stormFireInformationFabric } from "./informationFabric";
import type { CanonicalOperationalObject, OperationalAlert } from "../types";

test("parallel alert dissemination and read authorization remain participant-specific", () => {
  bootstrapStormFireDevelopmentScenario();

  const runtime = createStormFireRuntime({}, stormFireInformationFabric);
  const object: CanonicalOperationalObject = {
    id: "e2e-parallel-alert-object",
    kind: "Track",
    version: 1,
    timestamp: "2026-08-18T12:00:00Z",
    sourceParticipantId: "uav-service",
    domains: ["AIR"],
    classification: "CONTROLLED",
    confidence: 0.95,
    attributes: { status: "ACTIVE", source: "e2e" },
  };
  runtime.ingestObject(object);

  const dissemination = authorizeAlertDissemination({
    issuerParticipantId: "operator-command",
    recipientParticipantIds: ["operator-command", "operator-intel"],
    informationObject: object,
  });

  assert.deepEqual(dissemination.deniedRecipientIds, []);
  assert.deepEqual(dissemination.allowedRecipientIds.sort(), ["operator-command", "operator-intel"].sort());

  const alert: OperationalAlert = {
    id: "e2e-parallel-alert",
    objectId: object.id,
    severity: "HIGH",
    state: "OPEN",
    createdAt: "2026-08-18T12:01:00Z",
    updatedAt: "2026-08-18T12:01:00Z",
    recipients: [...dissemination.allowedRecipientIds],
  };
  runtime.publishAlert(alert);

  const projectedObject = runtime.state.objects.find((candidate) => candidate.id === object.id);
  assert.ok(projectedObject);

  const commandRead = authorizeAlertRead("operator-command", alert, projectedObject!);
  const intelRead = authorizeAlertRead("operator-intel", alert, projectedObject!);
  assert.equal(commandRead.allowed, true);
  assert.equal(intelRead.allowed, true);

  const deniedRead = authorizeAlertRead("logistics-service", alert, projectedObject!);
  assert.equal(deniedRead.allowed, false);
  assert.match(deniedRead.reason, /No matching policy|not a recorded alert recipient/);

  assert.equal(runtime.state.alerts.some((candidate) => candidate.id === alert.id), true);
});

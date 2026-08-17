import assert from "node:assert/strict";
import test from "node:test";
import { buildDynamicCopFromFabric } from "./dynamicCopFromFabric";
import { resolveParticipantOperationalContext } from "./participantOperationalContext";
import { stormFireInformationRelationships } from "./informationRelationshipEngine";
import { bootstrapStormFireDevelopmentScenario } from "../platform/stormFireBootstrap";


test("one canonical event can produce different participant COP projections", () => {
  bootstrapStormFireDevelopmentScenario();

  const producerToCommandRelationshipId = "test-uav-to-command-track";
  if (!stormFireInformationRelationships.list().some((relationship) => relationship.id === producerToCommandRelationshipId)) {
    stormFireInformationRelationships.register({
      id: producerToCommandRelationshipId,
      fromParticipantId: "uav-service",
      toParticipantId: "operator-command",
      direction: "VERTICAL",
      informationTypes: ["Track"],
      enabled: true,
    });
  }

  const now = new Date().toISOString();
  const sharedEvent = {
    id: "shared-cop-event-1",
    kind: "OBJECT" as const,
    type: "Track",
    schemaVersion: 1,
    version: 1,
    occurredAt: now,
    producerServiceId: "uav",
    producerParticipantId: "uav-service",
    classification: "CONTROLLED" as const,
    geographicScopeIds: ["local-aor"],
    provenance: { sourceId: "uav-service", observedAt: now, receivedAt: now, confidence: 0.9 },
    tags: ["org:company-a", "geo:local-aor", `rel:${producerToCommandRelationshipId}`, "lat:34.15", "lon:77.58"],
    payload: { name: "Shared ISR Track" },
  };

  const commandContext = resolveParticipantOperationalContext("operator-command");
  const intelContext = resolveParticipantOperationalContext("operator-intel");
  const commandCop = buildDynamicCopFromFabric(commandContext, [sharedEvent]);
  const intelCop = buildDynamicCopFromFabric(intelContext, [sharedEvent]);

  assert.equal(commandCop.information.some((item) => item.id === sharedEvent.id), true);
  assert.equal(intelCop.information.some((item) => item.id === sharedEvent.id), false);
});

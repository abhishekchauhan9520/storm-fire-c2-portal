import assert from "node:assert/strict";
import test from "node:test";
import { stormFireInformationRelationships } from "./informationRelationshipEngine";
import { stormFireGeographicScopes } from "./geographicScopeEngine";
import { stormFireParticipantContexts } from "./participantContext";
import { resolveParticipantOperationalContext } from "./participantOperationalContext";
import { evaluateStormFireInformationVisibility } from "./informationVisibility";
import { runDynamicCopScenario } from "./dynamicCopScenario";

test("Dynamic COP visibility evaluates both relationship authorization and geometry", () => {
  runDynamicCopScenario();

  if (!stormFireGeographicScopes.get("sector-20km")) {
    stormFireGeographicScopes.register({
      id: "sector-20km",
      name: "Scenario 20km sector",
      center: { latitude: 28.6139, longitude: 77.2090 },
      radiusKm: 20,
      enabled: true,
    });
  }

  if (!stormFireInformationRelationships.list().some((relationship) => relationship.id === "brigade-logistics")) {
    stormFireInformationRelationships.register({
      id: "brigade-logistics",
      fromParticipantId: "company-cdr",
      toParticipantId: "brigade-cdr",
      direction: "VERTICAL",
      allowedInformationTypes: ["LOGISTICS_READINESS_CHANGED"],
      enabled: true,
    });
  }

  const brigade = resolveParticipantOperationalContext(stormFireParticipantContexts.resolve("brigade-cdr")!.participantId);
  const visible = evaluateStormFireInformationVisibility(brigade, {
    id: "geo-logistics-1",
    informationType: "LOGISTICS_READINESS_CHANGED",
    organizationId: "company-alpha",
    geographicScopeId: "sector-20km",
    informationPoint: { latitude: 28.614, longitude: 77.2092 },
    relationshipId: "brigade-logistics",
    classification: "CONTROLLED",
    producerParticipantId: "company-cdr",
  });
  assert.equal(visible.allowed, true);

  const outside = evaluateStormFireInformationVisibility(brigade, {
    id: "geo-logistics-2",
    informationType: "LOGISTICS_READINESS_CHANGED",
    organizationId: "company-alpha",
    geographicScopeId: "sector-20km",
    informationPoint: { latitude: 29.6139, longitude: 78.209 },
    relationshipId: "brigade-logistics",
    classification: "CONTROLLED",
    producerParticipantId: "company-cdr",
  });
  assert.equal(outside.allowed, false);
});

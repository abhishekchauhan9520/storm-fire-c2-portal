import assert from "node:assert/strict";
import test from "node:test";
import { InformationPolicyRegistry } from "../../domain/informationPolicy";
import { InformationRelationshipRegistry } from "../../domain/informationRelationships";
import { LogisticsService } from "./logisticsService";
import { LogisticsWorkflow } from "./logisticsWorkflow";

test("LogisticsWorkflow distributes a critical alert only to authorized recipients", () => {
  const logistics = new LogisticsService();
  logistics.registerResource({ id: "fuel-1", name: "Fuel", kind: "FUEL", quantity: 100, unit: "L", readiness: "READY" });
  const policies = new InformationPolicyRegistry();
  policies.add({ id: "logistics-alert", informationTypes: ["logistics.alert"], enabled: true });
  const relationships = new InformationRelationshipRegistry();
  relationships.add({ id: "vertical-1", fromParticipantId: "company-a", toParticipantId: "brigade-a", type: "VERTICAL", informationTypes: ["logistics.alert"], enabled: true });
  relationships.add({ id: "horizontal-1", fromParticipantId: "company-a", toParticipantId: "company-b", type: "HORIZONTAL", informationTypes: ["logistics.alert"], enabled: true });
  relationships.add({ id: "diagonal-1", fromParticipantId: "company-a", toParticipantId: "ew-a", type: "DIAGONAL", informationTypes: ["logistics.alert"], enabled: true });
  const workflow = new LogisticsWorkflow(logistics, policies, relationships);
  const result = workflow.createAndDistributeRequest({ id: "req-1", requesterParticipantId: "company-a", resourceId: "fuel-1", quantity: 20, priority: "CRITICAL" }, ["brigade-a", "company-b", "ew-a", "unauthorized"], ["logistics-alert"]);
  assert.equal(result.request.status, "OPEN");
  assert.deepEqual(result.alert?.recipientIds.sort(), ["brigade-a", "company-b", "ew-a"].sort());
  assert.equal(result.alert?.rejectedRecipientIds.includes("unauthorized"), true);
});

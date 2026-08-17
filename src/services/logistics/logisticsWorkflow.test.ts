import assert from "node:assert/strict";
import test from "node:test";
import { InformationPolicyRegistry } from "../../domain/informationPolicy";
import { stormFireInformationRelationships } from "../../domain/informationRelationshipEngine";
import { LogisticsService } from "./logisticsService";
import { LogisticsWorkflow } from "./logisticsWorkflow";

test("LogisticsWorkflow distributes a critical alert only to authorized recipients", async () => {
  const logistics = new LogisticsService();
  logistics.registerResource({ id: "fuel-1", name: "Fuel", kind: "FUEL", quantity: 100, unit: "L", readiness: "READY" });
  const policies = new InformationPolicyRegistry();
  policies.add({ id: "logistics-alert", informationTypes: ["logistics.alert"], enabled: true });

  const existingIds = new Set(stormFireInformationRelationships.list().map((relationship) => relationship.id));
  const seed = [
    { id: "vertical-1", fromParticipantId: "company-a", toParticipantId: "brigade-a", direction: "VERTICAL" as const },
    { id: "horizontal-1", fromParticipantId: "company-a", toParticipantId: "company-b", direction: "HORIZONTAL" as const },
    { id: "diagonal-1", fromParticipantId: "company-a", toParticipantId: "ew-a", direction: "DIAGONAL" as const },
  ];

  for (const relationship of seed) {
    if (!existingIds.has(relationship.id)) {
      stormFireInformationRelationships.register({
        ...relationship,
        informationTypes: ["logistics.alert"],
        enabled: true,
      });
    }
  }

  const workflow = new LogisticsWorkflow(logistics, policies, stormFireInformationRelationships);
  const result = await workflow.createAndDistributeRequest(
    { id: "req-1", requesterParticipantId: "company-a", resourceId: "fuel-1", quantity: 20, priority: "CRITICAL" },
    ["brigade-a", "company-b", "ew-a", "unauthorized"],
    ["logistics-alert"],
  );

  assert.equal(result.request.status, "OPEN");
  assert.equal(result.requestPublished, true);
  assert.deepEqual(result.alert?.recipientIds.sort(), ["brigade-a", "company-b", "ew-a"].sort());
  assert.equal(result.alert?.rejectedRecipientIds.includes("unauthorized"), true);
});

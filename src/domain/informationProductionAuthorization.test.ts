import test from "node:test";
import assert from "node:assert/strict";
import { stormFireAuthorization } from "./authorizationPolicy";
import { authorizeInformationProduction } from "./informationProductionAuthorization";
import type { StormFireResolvedOperationalContext } from "./participantOperationalContext";
import type { CanonicalOperationalObject } from "../types";

const object: CanonicalOperationalObject = {
  id: "object-1",
  kind: "Observation",
  version: 1,
  timestamp: new Date().toISOString(),
  sourceParticipantId: "participant-1",
  domains: ["JOINT"],
  confidence: 0.9,
  attributes: { value: "test" },
};

const context = (services: Array<Record<string, unknown>>) => ({
  participantId: "participant-1",
  organizationIds: ["org-1"],
  roleIds: ["role-1"],
  relationshipIds: ["relationship-1"],
  geographicScopeIds: ["scope-1"],
  services,
} as unknown as StormFireResolvedOperationalContext);

test("production is denied when the participant has no service capable of producing the information type", () => {
  const decision = authorizeInformationProduction(context([{
    id: "consumer-service",
    status: "ACTIVE",
    informationTypesProduced: ["Message"],
    informationTypesConsumed: ["Observation"],
  }]), object);

  assert.equal(decision.allowed, false);
  assert.deepEqual(decision.serviceIds, []);
});

test("production can use any authorized canonical service path", () => {
  stormFireAuthorization.clear();
  stormFireAuthorization.register({
    id: "allow-observation-service-2",
    enabled: true,
    priority: 50,
    effect: "ALLOW",
    participantIds: ["participant-1"],
    serviceIds: ["producer-service-2"],
    organizationIds: ["org-1"],
    roleIds: ["role-1"],
    relationshipIds: ["relationship-1"],
    geographicScopeIds: ["scope-1"],
    informationTypes: ["Observation"],
    classifications: [],
  });

  const decision = authorizeInformationProduction(context([
    {
      id: "producer-service-1",
      status: "ACTIVE",
      informationTypesProduced: ["Observation"],
      informationTypesConsumed: [],
    },
    {
      id: "producer-service-2",
      status: "ACTIVE",
      informationTypesProduced: ["Observation"],
      informationTypesConsumed: [],
    },
  ]), object);

  assert.equal(decision.allowed, true);
  assert.deepEqual(decision.serviceIds, ["producer-service-2"]);
  assert.deepEqual(decision.matchedPolicyIds, ["allow-observation-service-2"]);
  stormFireAuthorization.clear();
});

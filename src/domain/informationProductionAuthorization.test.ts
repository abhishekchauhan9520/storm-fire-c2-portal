import test from "node:test";
import assert from "node:assert/strict";
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

test("production is denied when the participant has no service capable of producing the information type", () => {
  const context = {
    participantId: "participant-1",
    services: [{
      id: "consumer-service",
      status: "ACTIVE",
      informationTypesProduced: ["Message"],
      informationTypesConsumed: ["Observation"],
    }],
  } as unknown as StormFireResolvedOperationalContext;

  const decision = authorizeInformationProduction(context, object);
  assert.equal(decision.allowed, false);
  assert.deepEqual(decision.serviceIds, []);
});

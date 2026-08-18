import test from "node:test";
import assert from "node:assert/strict";
import { projectVisibleServices } from "./serviceVisibility";
import type { Service } from "../contracts/stormFireContracts";
import type { StormFireResolvedOperationalContext } from "./participantOperationalContext";

const service = (id: string, status: Service["status"] = "ACTIVE"): Service => ({
  id,
  name: id,
  version: "1.0.0",
  description: id,
  capabilities: [],
  informationTypesProduced: [],
  informationTypesConsumed: [],
  displaySurfaceIds: [],
  dependencyServiceIds: [],
  ownerParticipantId: "system",
  status,
});

test("participant service projection excludes active services outside canonical context", () => {
  const context = { services: [service("visible-service")] } as unknown as StormFireResolvedOperationalContext;
  const projected = projectVisibleServices(
    [service("visible-service"), service("hidden-service"), service("paused-service", "PAUSED")],
    context,
  );

  assert.deepEqual(projected.map((item) => item.id), ["visible-service"]);
  assert.notStrictEqual(projected[0], context.services[0]);
});

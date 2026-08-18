import test from "node:test";
import assert from "node:assert/strict";
import { stormFireServiceFabric } from "./serviceFabric";
import { stormFireParticipants } from "./participantModel";
import { StormFireServiceLifecycleManager, type ServiceIdentity } from "./serviceLifecycle";

const serviceId = "lifecycle-test-service";
const ownerId = "lifecycle-test-owner";

function setup(): StormFireServiceLifecycleManager {
  stormFireServiceFabric.register({
    id: serviceId,
    name: "Lifecycle Test Service",
    version: "1.0.0",
    description: "Lifecycle authorization regression fixture.",
    capabilities: [{ id: "DISCOVER", name: "Discover" }],
    informationTypesProduced: ["Observation"],
    informationTypesConsumed: ["Observation"],
    displaySurfaceIds: [serviceId],
    dependencyServiceIds: [],
    ownerParticipantId: ownerId,
    status: "REGISTERED",
  });

  stormFireParticipants.register({
    id: ownerId,
    name: "Lifecycle Test Owner",
    kind: "SERVICE",
    status: "ONLINE",
    canProduce: true,
    canConsume: true,
    enabled: true,
    organizationIds: [],
    roleIds: [],
    serviceIds: [serviceId],
    geographicScopeIds: [],
    informationRelationshipIds: [],
    workspaceIds: [],
  });

  return new StormFireServiceLifecycleManager();
}

test("service lifecycle authorization uses canonical service and participant context", () => {
  const manager = setup();
  manager.discover({
    id: serviceId,
    name: "Lifecycle Test Service",
    version: "1.0.0",
    description: "Lifecycle authorization regression fixture.",
    capabilities: ["DISCOVER", "CONSUME", "CONTRIBUTE", "RELATE", "PUBLISH_EVENT", "PARALLEL_ALERT"],
    consumes: ["Observation"],
    produces: ["Observation"],
    relationships: ["VERTICAL", "HORIZONTAL", "DIAGONAL"],
    enabled: true,
  });
  manager.register(serviceId);
  manager.validate(serviceId);

  const identity: ServiceIdentity = {
    serviceId,
    principal: `service:${serviceId}`,
    roles: ["SERVICE_OPERATOR"],
    trustLevel: "TRUSTED",
    issuedAt: new Date().toISOString(),
  };

  const result = manager.authorize(serviceId, identity);
  assert.equal(result.state, "AUTHORIZED");
});

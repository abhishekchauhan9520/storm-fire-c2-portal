import assert from "node:assert/strict";
import test from "node:test";
import { stormFireServiceFabric } from "./serviceFabric";
import {
  fromCanonicalService,
  getCanonicalStormFireService,
  registerStormFireService,
  stormFireServices,
  toCanonicalService,
} from "./serviceRegistry";

const artillery = stormFireServices.find((service) => service.id === "artillery-c2")!;

test("service registry configuration registers into canonical Service Fabric", () => {
  stormFireServiceFabric.clear();

  const registered = registerStormFireService(artillery);
  const canonical = getCanonicalStormFireService(artillery.id);

  assert.ok(canonical);
  assert.equal(registered.id, canonical.id);
  assert.equal(canonical.name, artillery.name);
  assert.deepEqual(canonical.informationTypesConsumed.sort(), [...artillery.consumes].sort());
  assert.deepEqual(canonical.informationTypesProduced.sort(), [...artillery.produces].sort());

  stormFireServiceFabric.clear();
});

test("re-registering an existing service does not create duplicate runtime state", () => {
  stormFireServiceFabric.clear();

  registerStormFireService(artillery);
  registerStormFireService(artillery);

  assert.equal(stormFireServiceFabric.list().length, 1);

  stormFireServiceFabric.clear();
});

test("canonical service round-trips through the compatibility adapter", () => {
  const canonical = toCanonicalService(artillery);
  const compatibility = fromCanonicalService(canonical);

  assert.equal(compatibility.id, artillery.id);
  assert.equal(compatibility.name, artillery.name);
  assert.deepEqual(compatibility.consumes.sort(), [...artillery.consumes].sort());
  assert.deepEqual(compatibility.produces.sort(), [...artillery.produces].sort());
});

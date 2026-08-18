import assert from "node:assert/strict";
import test from "node:test";
import { stormFireServiceFabric } from "./serviceFabric";
import {
  fromCanonicalService,
  registerCanonicalService,
  stormFireServiceManifests,
  toCanonicalService,
} from "./serviceManifestAdapter";

const artillery = stormFireServiceManifests.find((service) => service.id === "artillery-c2")!;

test("service manifest registers into canonical Service Fabric", () => {
  stormFireServiceFabric.clear();

  const registered = registerCanonicalService(artillery, stormFireServiceFabric);
  const canonical = stormFireServiceFabric.get(artillery.id);

  assert.ok(canonical);
  assert.equal(registered.id, canonical.id);
  assert.equal(canonical.name, artillery.name);
  assert.deepEqual(canonical.informationTypesConsumed.sort(), [...artillery.consumes].sort());
  assert.deepEqual(canonical.informationTypesProduced.sort(), [...artillery.produces].sort());

  stormFireServiceFabric.clear();
});

test("re-registering an existing manifest does not create duplicate runtime state", () => {
  stormFireServiceFabric.clear();

  registerCanonicalService(artillery, stormFireServiceFabric);
  registerCanonicalService(artillery, stormFireServiceFabric);

  assert.equal(stormFireServiceFabric.list().length, 1);

  stormFireServiceFabric.clear();
});

test("canonical service round-trips through the manifest adapter", () => {
  const canonical = toCanonicalService(artillery);
  const compatibility = fromCanonicalService(canonical);

  assert.equal(compatibility.id, artillery.id);
  assert.equal(compatibility.name, artillery.name);
  assert.deepEqual(compatibility.consumes.sort(), [...artillery.consumes].sort());
  assert.deepEqual(compatibility.produces.sort(), [...artillery.produces].sort());
});

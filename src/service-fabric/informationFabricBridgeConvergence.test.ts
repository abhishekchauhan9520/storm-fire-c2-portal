import assert from "node:assert/strict";
import test from "node:test";
import { stormFireInformationFabric as canonicalInformationFabric } from "../domain/informationFabric";
import { stormFireInformationFabric as bridge } from "./informationFabricBridge";

test("Information Fabric compatibility bridge delegates state to canonical Information Fabric", () => {
  canonicalInformationFabric.clear();
  bridge.clear();

  bridge.ingestServiceRecord("logistics", "RESOURCE", { id: "fuel-1", readiness: "READY" }, ["brigade-cdr"]);

  assert.equal(canonicalInformationFabric.historyFor("RESOURCE").length, 1);
  assert.equal(bridge.snapshot().length, 1);
  assert.equal(bridge.snapshot()[0]?.id, canonicalInformationFabric.historyFor("RESOURCE")[0]?.id);
});

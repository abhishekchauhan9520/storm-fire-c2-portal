import assert from "node:assert/strict";
import test from "node:test";
import { stormFireInformationRelationships } from "./informationRelationshipEngine";
import { stormFireRelationshipFabric } from "../service-fabric/relationshipFabric";

test("service-fabric relationship facade writes to the canonical relationship engine", () => {
  const relation = stormFireRelationshipFabric.establish({
    sourceParticipantId: "operator-intel",
    targetParticipantId: "operator-command",
    axis: "HORIZONTAL",
    informationTypes: ["Assessment"],
    enabled: true,
  });

  assert.ok(stormFireInformationRelationships.list().some((candidate) => candidate.id === relation.id));
  assert.equal(stormFireInformationRelationships.canShare("operator-intel", "operator-command", "Assessment"), true);

  assert.equal(stormFireRelationshipFabric.remove(relation.id), true);
  assert.equal(stormFireInformationRelationships.list().some((candidate) => candidate.id === relation.id), false);
});

test("canonical relationship engine supports multi-hop information paths", () => {
  const paths = stormFireInformationRelationships.pathsFrom("operator-command", "Alert", 4);
  assert.ok(paths.some((path) => path.participantIds[path.participantIds.length - 1] === "logistics-service"));
});

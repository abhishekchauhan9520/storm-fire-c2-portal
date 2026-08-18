import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { InformationFabric } from "./informationFabric";
import { buildDynamicCopFromFabric } from "./dynamicCopFromFabric";
import { stormFireAuthorization } from "./authorizationPolicy";
import { FileInformationFabricPersistence } from "../platform/persistence/informationFabricPersistence";
import type { StormFireResolvedOperationalContext } from "./participantOperationalContext";
import type { Service } from "../contracts/stormFireContracts";

test("Dynamic COP rebuilds from the persisted canonical Information Fabric", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "storm-fire-cop-"));
  const filePath = path.join(directory, "information-fabric.json");
  const policyId = `cop-persistence-${Date.now()}`;

  const service: Service = {
    id: "svc-intel",
    name: "Intelligence",
    version: "1.0.0",
    capabilities: [],
    informationTypesProduced: ["TRACK"],
    informationTypesConsumed: ["TRACK"],
    displaySurfaceIds: [],
    dependencyServiceIds: [],
    ownerParticipantId: "participant-a",
    status: "ACTIVE",
  };

  const context: StormFireResolvedOperationalContext = {
    participantId: "participant-a",
    organizationIds: ["org-a"],
    roleIds: ["role-a"],
    organizationId: "org-a",
    roleId: "role-a",
    geographicScopeIds: ["scope-a"],
    relationshipIds: [],
    informationClassification: "CONTROLLED",
    services: [service],
  };

  try {
    stormFireAuthorization.register({
      id: policyId,
      version: 1,
      effect: "ALLOW",
      participantIds: ["participant-a"],
      serviceIds: ["svc-intel"],
      informationTypes: ["TRACK"],
      classifications: ["CONTROLLED"],
      priority: 100,
      enabled: true,
    });

    const firstFabric = new InformationFabric(new FileInformationFabricPersistence(filePath));
    await firstFabric.attachPersistence(new FileInformationFabricPersistence(filePath));
    firstFabric.publish({
      id: "track-1",
      kind: "OBJECT",
      type: "TRACK",
      schemaVersion: 1,
      version: 1,
      occurredAt: "2026-08-18T00:00:00.000Z",
      producerParticipantId: "participant-a",
      classification: "CONTROLLED",
      geographicScopeIds: ["scope-a"],
      provenance: {
        sourceId: "participant-a",
        observedAt: "2026-08-18T00:00:00.000Z",
        receivedAt: "2026-08-18T00:00:00.000Z",
        confidence: 0.95,
      },
      tags: ["org:org-a", "geo:scope-a"],
      payload: { status: "ACTIVE" },
    });

    const secondFabric = new InformationFabric(new FileInformationFabricPersistence(filePath));
    await secondFabric.attachPersistence(new FileInformationFabricPersistence(filePath));
    const projection = buildDynamicCopFromFabric(context, secondFabric.historyFor());

    assert.equal(projection.participantId, "participant-a");
    assert.equal(projection.information.length, 1);
    assert.equal(projection.information[0]?.id, "track-1");
  } finally {
    stormFireAuthorization.clear();
    rmSync(directory, { recursive: true, force: true });
  }
});

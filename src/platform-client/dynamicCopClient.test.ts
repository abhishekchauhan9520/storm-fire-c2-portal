import assert from "node:assert/strict";
import test from "node:test";
import { fetchDynamicCop, projectCopTracks, type DynamicCopResponse } from "./dynamicCopClient";

test("projects canonical Track information into a UI-only map projection", () => {
  const cop: DynamicCopResponse = {
    participantId: "operator-command",
    organizationIds: ["company-a"],
    roleIds: ["COMMAND"],
    organizationId: "company-a",
    roleId: "COMMAND",
    geographicScopeIds: ["local-aor"],
    serviceIds: ["uav"],
    generatedAt: "2026-08-18T00:00:00.000Z",
    information: [
      {
        id: "track-1",
        occurredAt: "2026-08-18T00:00:00.000Z",
        informationType: "Track",
        organizationId: "company-a",
        producerParticipantId: "uav-service",
        informationPoint: { latitude: 34.15, longitude: 77.58 },
        payload: { name: "Observed Alpha", x: 61, y: 39, sensorSource: "UAV / ISR" },
      },
      {
        id: "assessment-1",
        occurredAt: "2026-08-18T00:00:00.000Z",
        informationType: "Assessment",
        organizationId: "company-a",
        payload: { title: "Not a map track" },
      },
    ],
  };

  const tracks = projectCopTracks(cop);
  assert.equal(tracks.length, 1);
  assert.equal(tracks[0].id, "track-1");
  assert.equal(tracks[0].name, "Observed Alpha");
  assert.equal(tracks[0].faction, "NEUTRAL");
  assert.equal(tracks[0].type, "AIR");
  assert.equal(tracks[0].sensorSource, "UAV / ISR");
});

test("drops track records without a renderable map position", () => {
  const cop: DynamicCopResponse = {
    participantId: "operator-command",
    organizationIds: ["company-a"],
    roleIds: ["COMMAND"],
    organizationId: "company-a",
    roleId: "COMMAND",
    geographicScopeIds: ["local-aor"],
    serviceIds: ["uav"],
    generatedAt: "2026-08-18T00:00:00.000Z",
    information: [{
      id: "track-no-position",
      occurredAt: "2026-08-18T00:00:00.000Z",
      informationType: "Track",
      organizationId: "company-a",
      payload: { name: "Observed Without Position" },
    }],
  };

  assert.deepEqual(projectCopTracks(cop), []);
});

test("rejects a Dynamic COP response when participant context does not match the request", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    data: {
      participantId: "operator-intel",
      information: [],
    },
  }), { status: 200, headers: { "content-type": "application/json" } });

  try {
    await assert.rejects(
      fetchDynamicCop("operator-command"),
      /participant context mismatch/i,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects a Dynamic COP response without an information projection", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    data: { participantId: "operator-command" },
  }), { status: 200, headers: { "content-type": "application/json" } });

  try {
    await assert.rejects(
      fetchDynamicCop("operator-command"),
      /information projection is invalid/i,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

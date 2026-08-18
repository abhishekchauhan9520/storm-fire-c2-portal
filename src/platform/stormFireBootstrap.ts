import type { OrganizationNode, OrganizationRelationship, Policy, Service } from "../contracts/stormFireContracts";
import { stormFireOrganizationGraph } from "../domain/organizationGraph";
import { stormFireParticipantContexts } from "../domain/participantContext";
import { stormFireGeographicScopes } from "../domain/geographicScopeEngine";
import { stormFireAuthorization } from "../domain/authorizationPolicy";
import { stormFireInformationFabric } from "../domain/informationFabric";
import { InformationRelationshipEngine } from "../domain/informationRelationshipEngine";
import { stormFireServiceFabric } from "../service-fabric/serviceFabric";
import { stormFireParticipants } from "../service-fabric/participantModel";

const DEVELOPMENT_ORGANIZATIONS: OrganizationNode[] = [
  { id: "brigade-a", name: "Storm Fire Brigade A", kind: "BRIGADE", status: "ACTIVE", parentIds: [], childIds: ["company-a"], relationshipIds: [], areaOfResponsibilityIds: ["local-aor"], serviceIds: ["logistics", "uav", "intelligence", "ew"], metadata: { environment: "development" } },
  { id: "company-a", name: "Storm Fire Company A", kind: "COMPANY", status: "ACTIVE", parentIds: ["brigade-a"], childIds: [], relationshipIds: [], areaOfResponsibilityIds: ["local-aor"], serviceIds: ["logistics", "uav"], metadata: { environment: "development" } },
  { id: "intel-cell", name: "Storm Fire Intelligence Cell", kind: "SPECIALIST", status: "ACTIVE", parentIds: ["brigade-a"], childIds: [], relationshipIds: [], areaOfResponsibilityIds: ["local-aor"], serviceIds: ["intelligence", "ew"], metadata: { environment: "development" } },
];

const DEVELOPMENT_ORG_RELATIONSHIPS: OrganizationRelationship[] = [
  { id: "org-command-1", fromOrganizationId: "brigade-a", toOrganizationId: "company-a", kind: "COMMAND", enabled: true },
  { id: "org-functional-1", fromOrganizationId: "intel-cell", toOrganizationId: "company-a", kind: "FUNCTIONAL", enabled: true },
];

const DEVELOPMENT_SERVICES: Service[] = [
  { id: "logistics", name: "Logistics", version: "1.0.0", description: "Logistics reference vertical.", capabilities: [{ id: "REQUEST", name: "Request" }, { id: "STATUS", name: "Status" }], informationTypesProduced: ["LogisticsRequest", "LogisticsAlert", "Track", "ResourceStatus"], informationTypesConsumed: ["Track", "Alert", "Requirement", "Context"], displaySurfaceIds: ["logistics"], dependencyServiceIds: [], ownerParticipantId: "logistics-service", status: "ACTIVE" },
  { id: "uav", name: "UAV / ISR", version: "1.0.0", description: "ISR observation and asset-state capability.", capabilities: [{ id: "OBSERVE", name: "Observe" }, { id: "STATUS", name: "Status" }], informationTypesProduced: ["Observation", "Track", "Telemetry", "Alert"], informationTypesConsumed: ["Task", "Track", "Context"], displaySurfaceIds: ["uav"], dependencyServiceIds: [], ownerParticipantId: "uav-service", status: "ACTIVE" },
  { id: "intelligence", name: "Intelligence", version: "1.0.0", description: "Observation, correlation and assessment support.", capabilities: [{ id: "ANALYZE", name: "Analyze" }, { id: "ASSESS", name: "Assess" }], informationTypesProduced: ["Assessment", "Finding", "Observation"], informationTypesConsumed: ["Observation", "Track", "Alert", "Context"], displaySurfaceIds: ["intelligence"], dependencyServiceIds: [], ownerParticipantId: "operator-intel", status: "ACTIVE" },
  { id: "ew", name: "Electronic Warfare", version: "1.0.0", description: "Spectrum observations and EW event context.", capabilities: [{ id: "OBSERVE", name: "Observe" }, { id: "ALERT", name: "Alert" }], informationTypesProduced: ["EWObservation", "Alert"], informationTypesConsumed: ["Observation", "Track", "Context"], displaySurfaceIds: ["ew"], dependencyServiceIds: [], ownerParticipantId: "operator-intel", status: "ACTIVE" },
];

const DEVELOPMENT_POLICIES: Policy[] = [
  { id: "dev-company-track", version: 1, effect: "ALLOW", participantIds: ["operator-command"], organizationIds: ["company-a"], roleIds: ["COMMAND"], serviceIds: ["logistics", "uav"], informationTypes: ["Track", "Observation", "Telemetry", "LogisticsRequest", "LogisticsAlert", "ResourceStatus"], geographicScopeIds: ["local-aor"], classifications: ["CONTROLLED", "MISSION"], priority: 100, enabled: true },
  { id: "dev-company-context", version: 1, effect: "ALLOW", participantIds: ["operator-command"], organizationIds: ["company-a"], roleIds: ["COMMAND"], serviceIds: ["logistics", "uav"], informationTypes: ["Context", "Alert"], geographicScopeIds: ["local-aor"], classifications: ["PUBLIC", "CONTROLLED", "MISSION"], priority: 100, enabled: true },
  { id: "dev-intel-information", version: 1, effect: "ALLOW", participantIds: ["operator-intel"], organizationIds: ["brigade-a", "intel-cell"], roleIds: ["INTELLIGENCE"], serviceIds: ["intelligence", "ew"], informationTypes: ["Observation", "Track", "Assessment", "Finding", "EWObservation", "Alert"], geographicScopeIds: ["local-aor"], classifications: ["CONTROLLED", "MISSION"], priority: 100, enabled: true },
];

export const stormFireDevelopmentInformationRelationships = new InformationRelationshipEngine();

function registerIfMissing<T>(get: (id: string) => T | undefined, register: (item: T) => unknown, item: T & { id: string }): void {
  if (!get(item.id)) register(item);
}

export function bootstrapStormFireDevelopmentScenario(): void {
  for (const service of DEVELOPMENT_SERVICES) registerIfMissing(stormFireServiceFabric.get.bind(stormFireServiceFabric), stormFireServiceFabric.register.bind(stormFireServiceFabric), service);
  for (const organization of DEVELOPMENT_ORGANIZATIONS) registerIfMissing(stormFireOrganizationGraph.get.bind(stormFireOrganizationGraph), stormFireOrganizationGraph.register.bind(stormFireOrganizationGraph), organization);
  for (const relationship of DEVELOPMENT_ORG_RELATIONSHIPS) {
    if (!stormFireOrganizationGraph.relationship(relationship.id)) stormFireOrganizationGraph.registerRelationship(relationship);
  }

  if (!stormFireGeographicScopes.get("local-aor")) {
    stormFireGeographicScopes.register({ id: "local-aor", name: "Development Local AOR", center: { latitude: 34.15, longitude: 77.58 }, radiusKm: 80, enabled: true });
  }

  stormFireParticipants.update("operator-command", { organizationIds: ["company-a"], roleIds: ["COMMAND"], serviceIds: ["logistics", "uav"], geographicScopeIds: ["local-aor"], informationRelationshipIds: ["info-command-intel", "info-command-uav"], workspaceIds: ["company-cop"], canProduce: true, canConsume: true });
  stormFireParticipants.update("operator-intel", { organizationIds: ["intel-cell"], roleIds: ["INTELLIGENCE"], serviceIds: ["intelligence", "ew"], geographicScopeIds: ["local-aor"], informationRelationshipIds: ["info-command-intel", "info-intel-logistics"], workspaceIds: ["intel-workspace"], canProduce: true, canConsume: true });
  stormFireParticipants.update("uav-service", { organizationIds: ["company-a"], serviceIds: ["uav"], geographicScopeIds: ["local-aor"], informationRelationshipIds: ["info-command-uav"], workspaceIds: ["uav-service"], canProduce: true, canConsume: true });
  stormFireParticipants.update("logistics-service", { organizationIds: ["company-a"], serviceIds: ["logistics"], geographicScopeIds: ["local-aor"], informationRelationshipIds: ["info-intel-logistics"], workspaceIds: ["logistics-service"], canProduce: true, canConsume: true });

  stormFireParticipantContexts.assign({ participantId: "operator-command", organizationIds: ["company-a"], roleIds: ["COMMAND"], serviceIds: ["logistics", "uav"], geographicScopeIds: ["local-aor"], informationRelationshipIds: ["info-command-intel", "info-command-uav"], workspaceIds: ["company-cop"], policyIds: ["dev-company-track", "dev-company-context"], classification: "CONTROLLED" });
  stormFireParticipantContexts.assign({ participantId: "operator-intel", organizationIds: ["intel-cell"], roleIds: ["INTELLIGENCE"], serviceIds: ["intelligence", "ew"], geographicScopeIds: ["local-aor"], informationRelationshipIds: ["info-command-intel", "info-intel-logistics"], workspaceIds: ["intel-workspace"], policyIds: ["dev-intel-information"], classification: "CONTROLLED" });

  const addRelationship = (id: string, from: string, to: string, direction: "VERTICAL" | "HORIZONTAL" | "DIAGONAL", allowedInformationTypes: string[]) => {
    if (stormFireDevelopmentInformationRelationships.list().some((relationship) => relationship.id === id)) return;
    stormFireDevelopmentInformationRelationships.register({ id, fromParticipantId: from, toParticipantId: to, direction, allowedInformationTypes, enabled: true });
  };

  addRelationship("info-command-intel", "operator-command", "operator-intel", "HORIZONTAL", ["Observation", "Track", "Assessment", "Alert", "Context"]);
  addRelationship("info-command-uav", "operator-command", "uav-service", "VERTICAL", ["Task", "Track", "Telemetry", "Alert", "Observation"]);
  addRelationship("info-intel-logistics", "operator-intel", "logistics-service", "DIAGONAL", ["Context", "Requirement", "LogisticsRequest", "LogisticsAlert"]);

  for (const policy of DEVELOPMENT_POLICIES) {
    if (!stormFireAuthorization.list().some((existing) => existing.id === policy.id)) stormFireAuthorization.register(policy);
  }

  if (stormFireInformationFabric.historyFor().length === 0) {
    const now = new Date().toISOString();
    const seed = [
      { id: "dev-track-1", type: "Track", organizationId: "company-a", producer: "uav-service", payload: { name: "ISR Track Alpha", faction: "UNKNOWN", x: 58, y: 34, coordinates: "34.15,77.58", status: "ACTIVE", sensorSource: "UAV / ISR", confidence: 0.86 } },
      { id: "dev-track-2", type: "Track", organizationId: "company-a", producer: "uav-service", payload: { name: "ISR Track Bravo", faction: "UNKNOWN", x: 74, y: 46, coordinates: "34.11,77.65", status: "ACTIVE", sensorSource: "Airborne observation", confidence: 0.72 } },
      { id: "dev-observation-1", type: "Observation", organizationId: "intel-cell", producer: "operator-intel", payload: { title: "Cross-functional observation", detail: "Development scenario observation linked through a horizontal relationship." } },
    ];

    for (const item of seed) {
      stormFireInformationFabric.publish({
        id: item.id,
        kind: "OBJECT",
        type: item.type,
        schemaVersion: 1,
        version: 1,
        occurredAt: now,
        producerServiceId: item.producer === "uav-service" ? "uav" : "intelligence",
        producerParticipantId: item.producer,
        classification: "CONTROLLED",
        geographicScopeIds: ["local-aor"],
        provenance: { sourceId: item.producer, producerId: item.producer, observedAt: now, receivedAt: now, confidence: item.payload.confidence ?? 0.8, quality: "MEDIUM" },
        payload: item.payload,
        tags: [`org:${item.organizationId}`, "geo:local-aor", item.producer === "operator-intel" ? "rel:info-command-intel" : "rel:info-command-uav"],
      });
    }
  }
}

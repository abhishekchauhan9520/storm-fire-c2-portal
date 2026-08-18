import type { OrganizationNode, Participant, Policy, Service } from "../contracts/stormFireContracts";
import { stormFireAuthorization } from "./authorizationPolicy";
import { stormFireOrganizationGraph } from "./organizationGraph";
import { stormFireParticipantContexts } from "./participantContext";
import { stormFireParticipants } from "../service-fabric/participantModel";
import { stormFireServiceFabric } from "../service-fabric/serviceFabric";
import { resolveParticipantOperationalContext } from "./participantOperationalContext";
import { resolveStormFireDynamicCop, type StormFireOperationalInformation } from "./dynamicCopResolver";

function ensureService(service: Service): void {
  if (!stormFireServiceFabric.get(service.id)) stormFireServiceFabric.register(service);
}

function ensureOrganization(node: OrganizationNode): void {
  if (!stormFireOrganizationGraph.get(node.id)) stormFireOrganizationGraph.register(node);
}

function ensureParticipant(participant: Participant): void {
  if (!stormFireParticipants.get(participant.id)) stormFireParticipants.register(participant);
}

function ensurePolicy(policy: Policy): void {
  if (!stormFireAuthorization.list().some((existing) => existing.id === policy.id)) stormFireAuthorization.register(policy);
}

/**
 * Reference scenario proving that different participant contexts can project
 * different COPs from the same shared information environment under the
 * canonical policy engine.
 */
export function runDynamicCopScenario() {
  ensureService({ id: "logistics", name: "Logistics", version: "scenario", description: "Scenario logistics service", capabilities: [{ id: "logistics:view", name: "Logistics view" }], informationTypesProduced: ["LOGISTICS_READINESS_CHANGED"], informationTypesConsumed: ["LOGISTICS_READINESS_CHANGED"], displaySurfaceIds: ["logistics"], dependencyServiceIds: [], ownerParticipantId: "system", status: "ACTIVE" });
  ensureService({ id: "uav", name: "UAV / ISR", version: "scenario", description: "Scenario UAV service", capabilities: [{ id: "uav:view", name: "UAV view" }], informationTypesProduced: ["UAV_STATUS"], informationTypesConsumed: ["UAV_STATUS"], displaySurfaceIds: ["uav"], dependencyServiceIds: [], ownerParticipantId: "system", status: "ACTIVE" });
  ensureService({ id: "ew", name: "Electronic Warfare", version: "scenario", description: "Scenario EW service", capabilities: [{ id: "ew:view", name: "EW view" }], informationTypesProduced: ["EW_EVENT"], informationTypesConsumed: ["EW_EVENT"], displaySurfaceIds: ["ew"], dependencyServiceIds: [], ownerParticipantId: "system", status: "ACTIVE" });
  ensureService({ id: "air-defence", name: "Air Defence", version: "scenario", description: "Scenario air-defence service", capabilities: [{ id: "air-defence:view", name: "Air defence view" }], informationTypesProduced: ["AIR_TRACK"], informationTypesConsumed: ["AIR_TRACK"], displaySurfaceIds: ["air-defence"], dependencyServiceIds: [], ownerParticipantId: "system", status: "ACTIVE" });

  ensureOrganization({ id: "company-alpha", name: "Company Alpha", kind: "COMPANY", status: "ACTIVE", parentIds: [], childIds: [], relationshipIds: [], areaOfResponsibilityIds: ["sector-20km"], serviceIds: ["logistics", "uav"] });
  ensureOrganization({ id: "brigade-alpha", name: "Brigade Alpha", kind: "BRIGADE", status: "ACTIVE", parentIds: [], childIds: [], relationshipIds: [], areaOfResponsibilityIds: ["sector-20km", "sector-80km"], serviceIds: ["logistics", "uav", "ew", "air-defence"] });

  ensureParticipant({ id: "company-cdr", name: "Company Commander", kind: "OPERATOR", status: "ONLINE", canProduce: true, canConsume: true, enabled: true, organizationIds: ["company-alpha"], roleIds: ["company-commander"], serviceIds: ["logistics", "uav"], geographicScopeIds: ["sector-20km"], informationRelationshipIds: ["brigade-logistics"], workspaceIds: [] });
  ensureParticipant({ id: "brigade-cdr", name: "Brigade Commander", kind: "OPERATOR", status: "ONLINE", canProduce: true, canConsume: true, enabled: true, organizationIds: ["brigade-alpha"], roleIds: ["brigade-commander"], serviceIds: ["logistics", "uav", "ew", "air-defence"], geographicScopeIds: ["sector-20km", "sector-80km"], informationRelationshipIds: ["brigade-logistics", "brigade-ew", "brigade-air-defence"], workspaceIds: [] });

  stormFireParticipantContexts.assign({ participantId: "company-cdr", organizationIds: ["company-alpha"], roleIds: ["company-commander"], serviceIds: ["logistics", "uav"], geographicScopeIds: ["sector-20km"], informationRelationshipIds: ["brigade-logistics"], workspaceIds: [], classification: "CONTROLLED" });
  stormFireParticipantContexts.assign({ participantId: "brigade-cdr", organizationIds: ["brigade-alpha"], roleIds: ["brigade-commander"], serviceIds: ["logistics", "uav", "ew", "air-defence"], geographicScopeIds: ["sector-20km", "sector-80km"], informationRelationshipIds: ["brigade-logistics", "brigade-ew", "brigade-air-defence"], workspaceIds: [], classification: "CONTROLLED" });

  ensurePolicy({ id: "scenario-company-logistics", version: 1, effect: "ALLOW", participantIds: ["company-cdr"], serviceIds: ["logistics"], organizationIds: ["company-alpha"], roleIds: ["company-commander"], relationshipIds: ["brigade-logistics"], informationTypes: ["LOGISTICS_READINESS_CHANGED"], geographicScopeIds: ["sector-20km"], classifications: ["CONTROLLED"], priority: 100, enabled: true });
  ensurePolicy({ id: "scenario-brigade-logistics", version: 1, effect: "ALLOW", participantIds: ["brigade-cdr"], serviceIds: ["logistics"], organizationIds: ["company-alpha"], roleIds: ["brigade-commander"], relationshipIds: ["brigade-logistics"], informationTypes: ["LOGISTICS_READINESS_CHANGED"], geographicScopeIds: ["sector-20km"], classifications: ["CONTROLLED"], priority: 100, enabled: true });
  ensurePolicy({ id: "scenario-brigade-ew", version: 1, effect: "ALLOW", participantIds: ["brigade-cdr"], serviceIds: ["ew"], organizationIds: ["brigade-alpha"], roleIds: ["brigade-commander"], relationshipIds: ["brigade-ew"], informationTypes: ["EW_EVENT"], geographicScopeIds: ["sector-80km"], classifications: ["CONTROLLED"], priority: 100, enabled: true });

  const company = resolveParticipantOperationalContext("company-cdr");
  const brigade = resolveParticipantOperationalContext("brigade-cdr");

  const event: StormFireOperationalInformation = { id: "logistics-readiness-001", occurredAt: new Date().toISOString(), informationType: "LOGISTICS_READINESS_CHANGED", organizationId: "company-alpha", geographicScopeId: "sector-20km", relationshipId: "brigade-logistics", classification: "CONTROLLED", payload: { assetId: "truck-17", readiness: "ready" } };
  const brigadeOnly: StormFireOperationalInformation = { id: "ew-event-001", occurredAt: event.occurredAt, informationType: "EW_EVENT", organizationId: "brigade-alpha", geographicScopeId: "sector-80km", relationshipId: "brigade-ew", classification: "CONTROLLED", payload: { status: "observed" } };

  const companyCop = resolveStormFireDynamicCop(company, [event, brigadeOnly], event.occurredAt);
  const brigadeCop = resolveStormFireDynamicCop(brigade, [event, brigadeOnly], event.occurredAt);

  if (companyCop.information.length !== 1) throw new Error("Company COP should contain only the logistics event.");
  if (brigadeCop.information.length !== 2) throw new Error("Brigade COP should contain logistics and EW events.");
  return { companyCop, brigadeCop };
}

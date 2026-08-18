import type { Service } from "../contracts/stormFireContracts";
import { stormFireServiceFabric } from "../service-fabric/serviceFabric";

const definitions: Service[] = [
  { id: "logistics", name: "Logistics", version: "0.1.0", description: "Supply, inventory, movement and sustainment information.", capabilities: [{ id: "logistics:view", name: "Logistics view" }], informationTypesProduced: ["LOGISTICS_REQUEST", "LOGISTICS_READINESS_CHANGED", "LOGISTICS_MOVEMENT_CHANGED"], informationTypesConsumed: ["LOGISTICS_REQUEST", "LOGISTICS_READINESS_CHANGED", "LOGISTICS_MOVEMENT_CHANGED"], displaySurfaceIds: ["logistics"], dependencyServiceIds: [], ownerParticipantId: "system", status: "ACTIVE" },
  { id: "uav", name: "UAV / ISR", version: "0.1.0", description: "Unmanned-system and ISR operational information.", capabilities: [{ id: "uav:view", name: "UAV view" }], informationTypesProduced: ["UAV_STATUS", "ISR_OBSERVATION"], informationTypesConsumed: ["UAV_STATUS", "ISR_OBSERVATION"], displaySurfaceIds: ["uav"], dependencyServiceIds: [], ownerParticipantId: "system", status: "ACTIVE" },
  { id: "ew", name: "Electronic Warfare", version: "0.1.0", description: "Electromagnetic activity and EW situational information.", capabilities: [{ id: "ew:view", name: "EW view" }], informationTypesProduced: ["EW_EVENT", "SPECTRUM_ACTIVITY"], informationTypesConsumed: ["EW_EVENT", "SPECTRUM_ACTIVITY"], displaySurfaceIds: ["ew"], dependencyServiceIds: [], ownerParticipantId: "system", status: "ACTIVE" },
  { id: "air-defence", name: "Air Defence", version: "0.1.0", description: "Air situation and air-defence operational information.", capabilities: [{ id: "air-defence:view", name: "Air defence view" }], informationTypesProduced: ["AIR_TRACK", "AIR_THREAT"], informationTypesConsumed: ["AIR_TRACK", "AIR_THREAT"], displaySurfaceIds: ["air-defence"], dependencyServiceIds: [], ownerParticipantId: "system", status: "ACTIVE" },
  { id: "intelligence", name: "Intelligence", version: "0.1.0", description: "Intelligence observations, products and assessments.", capabilities: [{ id: "intelligence:view", name: "Intelligence view" }], informationTypesProduced: ["INTELLIGENCE_PRODUCT", "INTELLIGENCE_OBSERVATION"], informationTypesConsumed: ["INTELLIGENCE_PRODUCT", "INTELLIGENCE_OBSERVATION"], displaySurfaceIds: ["intelligence"], dependencyServiceIds: [], ownerParticipantId: "system", status: "ACTIVE" },
];

export function registerStormFireDefaultServices(): void {
  for (const definition of definitions) {
    const current = stormFireServiceFabric.get(definition.id);
    if (!current) stormFireServiceFabric.register(definition);
  }
}

registerStormFireDefaultServices();

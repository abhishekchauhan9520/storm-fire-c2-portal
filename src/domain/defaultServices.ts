import { stormFireServiceRegistry } from "./serviceRegistry";

const definitions = [
  { id: "logistics", name: "Logistics", description: "Supply, inventory, movement and sustainment information.", workspaceKey: "logistics", informationTypes: ["LOGISTICS_REQUEST", "LOGISTICS_READINESS_CHANGED", "LOGISTICS_MOVEMENT_CHANGED"], requiredCapabilities: ["logistics:view"] },
  { id: "uav", name: "UAV / ISR", description: "Unmanned-system and ISR operational information.", workspaceKey: "uav", informationTypes: ["UAV_STATUS", "ISR_OBSERVATION"], requiredCapabilities: ["uav:view"] },
  { id: "ew", name: "Electronic Warfare", description: "Electromagnetic activity and EW situational information.", workspaceKey: "ew", informationTypes: ["EW_EVENT", "SPECTRUM_ACTIVITY"], requiredCapabilities: ["ew:view"] },
  { id: "air-defence", name: "Air Defence", description: "Air situation and air-defence operational information.", workspaceKey: "air-defence", informationTypes: ["AIR_TRACK", "AIR_THREAT"], requiredCapabilities: ["air-defence:view"] },
  { id: "intelligence", name: "Intelligence", description: "Intelligence observations, products and assessments.", workspaceKey: "intelligence", informationTypes: ["INTELLIGENCE_PRODUCT", "INTELLIGENCE_OBSERVATION"], requiredCapabilities: ["intelligence:view"] },
];

export function registerStormFireDefaultServices(): void {
  for (const definition of definitions) {
    if (!stormFireServiceRegistry.get(definition.id)) stormFireServiceRegistry.register({ ...definition, enabled: true });
  }
}

registerStormFireDefaultServices();

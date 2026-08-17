import { stormFireServiceFabric } from "../service-fabric/serviceFabric";
import type { Service } from "../contracts/stormFireContracts";

/**
 * Compatibility facade retained for older callers. The Service Fabric is the
 * only authoritative registry; this file contains no independent state.
 */
export interface StormFireServiceDefinition {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  informationTypes: string[];
  requiredCapabilities: string[];
  workspaceKey: string;
}

export interface StormFireParticipantServiceContext {
  participantId: string;
  serviceIds: string[];
  capabilities: string[];
}

function toService(definition: StormFireServiceDefinition): Service {
  return {
    id: definition.id,
    name: definition.name,
    version: "1.0.0",
    description: definition.description,
    capabilities: definition.requiredCapabilities.map((id) => ({ id, name: id })),
    informationTypesProduced: [...definition.informationTypes],
    informationTypesConsumed: [...definition.informationTypes],
    displaySurfaceIds: [definition.workspaceKey],
    dependencyServiceIds: [],
    ownerParticipantId: "system",
    status: definition.enabled ? "ACTIVE" : "PAUSED",
  };
}

function toDefinition(service: Service): StormFireServiceDefinition {
  return {
    id: service.id,
    name: service.name,
    description: service.description ?? "",
    enabled: service.status === "ACTIVE" || service.status === "REGISTERED",
    informationTypes: [...new Set([...service.informationTypesProduced, ...service.informationTypesConsumed])],
    requiredCapabilities: service.capabilities.map((capability) => capability.id),
    workspaceKey: service.displaySurfaceIds[0] ?? service.id,
  };
}

export class StormFireServiceRegistry {
  register(service: StormFireServiceDefinition): void {
    if (!stormFireServiceFabric.get(service.id)) stormFireServiceFabric.register(toService(service));
  }
  get(id: string): StormFireServiceDefinition | undefined {
    const service = stormFireServiceFabric.get(id);
    return service ? toDefinition(service) : undefined;
  }
  listEnabled(): StormFireServiceDefinition[] {
    return stormFireServiceFabric.list("ACTIVE").map(toDefinition);
  }
  resolveForParticipant(context: StormFireParticipantServiceContext): StormFireServiceDefinition[] {
    return context.serviceIds
      .map((id) => stormFireServiceFabric.get(id))
      .filter((service): service is Service => Boolean(service && service.status === "ACTIVE"))
      .filter((service) => service.capabilities.every((capability) => context.capabilities.includes(capability.id)))
      .map(toDefinition);
  }
}

export const stormFireServiceRegistry = new StormFireServiceRegistry();

import type { Service } from "../contracts/stormFireContracts";
import { stormFireServiceFabric } from "../service-fabric/serviceFabric";

export interface StormFireWorkspaceDescriptor {
  serviceId: string;
  workspaceKey: string;
  name: string;
  informationTypes: string[];
}

export interface StormFireParticipantServiceContext {
  participantId: string;
  serviceIds: string[];
  capabilities?: string[];
}

function workspaceFromService(service: Service): StormFireWorkspaceDescriptor {
  return {
    serviceId: service.id,
    workspaceKey: service.displaySurfaceIds[0] ?? service.id,
    name: service.name,
    informationTypes: [...new Set([...service.informationTypesProduced, ...service.informationTypesConsumed])],
  };
}

/** Resolves participant service surfaces from the canonical Service Fabric without a second service registry. */
export function resolveParticipantWorkspaces(context: StormFireParticipantServiceContext): StormFireWorkspaceDescriptor[] {
  const allowedCapabilities = new Set(context.capabilities ?? []);
  return context.serviceIds
    .map((serviceId) => stormFireServiceFabric.get(serviceId))
    .filter((service): service is Service => Boolean(service && service.status === "ACTIVE"))
    .filter((service) => service.capabilities.every((capability) => allowedCapabilities.size === 0 || allowedCapabilities.has(capability.id)))
    .map(workspaceFromService);
}

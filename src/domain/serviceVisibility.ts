import type { Service } from "../contracts/stormFireContracts";
import type { StormFireResolvedOperationalContext } from "./participantOperationalContext";

/** Participant-scoped service projection. Discovery never exposes services outside canonical context. */
export function projectVisibleServices(
  services: Service[],
  context: StormFireResolvedOperationalContext,
): Service[] {
  const visibleServiceIds = new Set(context.services.map((service) => service.id));
  return services
    .filter((service) => service.status === "ACTIVE" || service.status === "REGISTERED")
    .filter((service) => visibleServiceIds.has(service.id))
    .map((service) => ({
      ...service,
      capabilities: service.capabilities.map((capability) => ({ ...capability })),
      informationTypesConsumed: [...service.informationTypesConsumed],
      informationTypesProduced: [...service.informationTypesProduced],
      displaySurfaceIds: [...service.displaySurfaceIds],
      dependencyServiceIds: [...service.dependencyServiceIds],
    }));
}

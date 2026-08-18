import { stormFireServiceManifests, registerCanonicalService, fromCanonicalService, type StormFireServiceManifest } from "./serviceManifestAdapter";
import { stormFireServiceLifecycle, type ServiceLifecycleRecord } from "./serviceLifecycle";
import { stormFireServiceFabric } from "./serviceFabric";

export interface ServiceInventoryEntry extends ServiceLifecycleRecord {
  contractValid: boolean;
  contractErrors: string[];
}

/**
 * Transitional lifecycle tooling. Service Fabric remains the sole authoritative
 * service registry; lifecycle records are operational metadata layered on top.
 */
export class StormFireServiceRegistryRuntime {
  bootstrap(services?: StormFireServiceManifest[]): ServiceInventoryEntry[] {
    const source = services ?? stormFireServiceFabric.list().map(fromCanonicalService);
    const fallback = source.length > 0 ? source : stormFireServiceManifests;
    return fallback.map((service) => {
      const errors: string[] = [];
      let registered: StormFireServiceManifest = service;
      try {
        registered = registerCanonicalService(service, stormFireServiceFabric);
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }

      const existing = stormFireServiceLifecycle.get(service.id);
      const record = existing ?? stormFireServiceLifecycle.discover(registered);
      return {
        ...record,
        contractValid: errors.length === 0,
        contractErrors: errors,
      };
    });
  }

  inventory(): ServiceInventoryEntry[] {
    return stormFireServiceFabric.list().map((service) => {
      const lifecycle = stormFireServiceLifecycle.get(service.id);
      return {
        ...(lifecycle ?? {
          service: fromCanonicalService(service),
          state: service.status === "ACTIVE" ? "ENABLED" : service.status === "PAUSED" ? "DISABLED" : "DISCOVERED",
          updatedAt: new Date().toISOString(),
        }),
        service: fromCanonicalService(service),
        contractValid: lifecycle?.compatibility?.compatible ?? true,
        contractErrors: lifecycle?.compatibility?.errors ?? [],
      };
    });
  }
}

export const stormFireServiceRegistryRuntime = new StormFireServiceRegistryRuntime();

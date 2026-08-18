import { stormFireServiceManifests, registerCanonicalService, type StormFireServiceManifest } from "./serviceManifestAdapter";
import { stormFireServiceLifecycle, type ServiceLifecycleRecord } from "./serviceLifecycle";
import { stormFireServiceFabric } from "./serviceFabric";

export interface ServiceInventoryEntry extends ServiceLifecycleRecord {
  contractValid: boolean;
  contractErrors: string[];
}

/**
 * Runtime inventory for service manifest/lifecycle tooling.
 * Canonical runtime state remains in Service Fabric; lifecycle records are metadata.
 */
export class StormFireServiceRegistryRuntime {
  bootstrap(services: StormFireServiceManifest[] = stormFireServiceManifests): ServiceInventoryEntry[] {
    return services.map((service) => {
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
    return stormFireServiceLifecycle.list().map((record) => ({
      ...record,
      contractValid: record.compatibility?.compatible ?? false,
      contractErrors: record.compatibility?.errors ?? [],
    }));
  }
}

export const stormFireServiceRegistryRuntime = new StormFireServiceRegistryRuntime();

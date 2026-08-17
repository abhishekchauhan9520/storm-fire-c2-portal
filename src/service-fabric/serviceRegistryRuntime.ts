import { stormFireServices, registerStormFireService, type StormFireServiceManifest } from "./serviceRegistry";
import { stormFireServiceLifecycle, type ServiceLifecycleRecord } from "./serviceLifecycle";

export interface ServiceInventoryEntry extends ServiceLifecycleRecord {
  contractValid: boolean;
  contractErrors: string[];
}

/**
 * Runtime inventory for the compatibility service manifest layer.
 * Registration itself is delegated to the canonical Service Fabric; lifecycle
 * records are operational metadata and are not a second service-state store.
 */
export class StormFireServiceRegistryRuntime {
  bootstrap(services: StormFireServiceManifest[] = stormFireServices): ServiceInventoryEntry[] {
    return services.map((service) => {
      const errors: string[] = [];
      let registered: StormFireServiceManifest = service;
      try {
        registered = registerStormFireService(service);
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

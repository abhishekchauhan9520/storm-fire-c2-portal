import { stormFireServices, registerStormFireService, type StormFireServiceManifest } from "./serviceRegistry";
import { stormFireServiceLifecycle, type ServiceLifecycleRecord } from "./serviceLifecycle";

export interface ServiceInventoryEntry extends ServiceLifecycleRecord {
  contractValid: boolean;
  contractErrors: string[];
}

/** Runtime inventory that turns declared service manifests into lifecycle-managed services. */
export class StormFireServiceRegistryRuntime {
  bootstrap(services: StormFireServiceManifest[] = stormFireServices): ServiceInventoryEntry[] {
    return services.map((service) => {
      const errors: string[] = [];
      try {
        registerStormFireService(service);
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }

      const existing = stormFireServiceLifecycle.get(service.id);
      const record = existing ?? stormFireServiceLifecycle.discover(service);
      return {
        ...record,
        contractValid: errors.length === 0,
        contractErrors: errors,
      };
    });
  }

  inventory(): ServiceInventoryEntry[] {
    return stormFireServiceLifecycle.list().map((record) => {
      const errors: string[] = [];
      try { registerStormFireService(record.service); }
      catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
      return { ...record, contractValid: errors.length === 0, contractErrors: errors };
    });
  }
}

export const stormFireServiceRegistryRuntime = new StormFireServiceRegistryRuntime();

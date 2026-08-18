import type { StormFireServiceManifest } from "./serviceManifestAdapter";
import { discoverServiceCapabilities, validateServiceCompatibility, type CompatibilityResult, type ServiceCapabilityDescriptor } from "./serviceCompatibility";

export interface ServiceDiscoveryRecord {
  discoveredAt: string;
  descriptor: ServiceCapabilityDescriptor;
  compatibility: CompatibilityResult;
}

export class StormFireServiceDiscovery {
  private records = new Map<string, ServiceDiscoveryRecord>();

  discover(manifest: StormFireServiceManifest): ServiceDiscoveryRecord {
    const record: ServiceDiscoveryRecord = {
      discoveredAt: new Date().toISOString(),
      descriptor: discoverServiceCapabilities(manifest),
      compatibility: validateServiceCompatibility(manifest),
    };
    this.records.set(manifest.id, record);
    return record;
  }

  get(serviceId: string): ServiceDiscoveryRecord | undefined {
    return this.records.get(serviceId);
  }

  list(): ServiceDiscoveryRecord[] {
    return [...this.records.values()];
  }
}

export const stormFireServiceDiscovery = new StormFireServiceDiscovery();

import type { ServiceAdapter, ServiceAdapterFactory } from "./serviceAdapter";
import type { StormFireServiceManifest } from "./serviceRegistry";
import { stormFireServiceLifecycle } from "./serviceLifecycle";
import { stormFireServiceDiscovery, type ServiceDiscoveryRecord } from "./serviceDiscovery";

export class StormFireServiceManager {
  private factories = new Map<string, ServiceAdapterFactory>();
  private adapters = new Map<string, ServiceAdapter>();
  private discovery = new Map<string, ServiceDiscoveryRecord>();

  registerFactory(serviceId: string, factory: ServiceAdapterFactory): void {
    if (!serviceId) throw new Error("Service factory requires a service id.");
    if (this.factories.has(serviceId)) throw new Error(`Factory already registered: ${serviceId}`);
    this.factories.set(serviceId, factory);
  }

  unregisterFactory(serviceId: string): boolean {
    this.adapters.delete(serviceId);
    this.discovery.delete(serviceId);
    return this.factories.delete(serviceId);
  }

  discover(manifest: StormFireServiceManifest): ServiceDiscoveryRecord {
    const record = stormFireServiceDiscovery.discover(manifest);
    this.discovery.set(manifest.id, record);
    return record;
  }

  install(manifest: StormFireServiceManifest): ServiceAdapter {
    const record = this.discover(manifest);
    if (!record.compatibility.compatible) {
      throw new Error(`Service compatibility check failed for ${manifest.id}: ${record.compatibility.errors.join("; ")}`);
    }

    const factory = this.factories.get(manifest.id);
    if (!factory) throw new Error(`No adapter factory registered for service: ${manifest.id}`);

    const adapter = factory(manifest);
    adapter.install();
    this.adapters.set(manifest.id, adapter);
    return adapter;
  }

  installRegistered(manifests: StormFireServiceManifest[]): ServiceAdapter[] {
    return manifests.filter((manifest) => manifest.enabled).flatMap((manifest) => {
      try {
        return [this.install(manifest)];
      } catch (error) {
        console.warn(`[Service Fabric] Installation rejected for ${manifest.id}:`, error);
        return [];
      }
    });
  }

  getAdapter(serviceId: string): ServiceAdapter | undefined {
    return this.adapters.get(serviceId);
  }

  listAdapters(): ServiceAdapter[] {
    return [...this.adapters.values()];
  }

  getDiscovery(serviceId: string): ServiceDiscoveryRecord | undefined {
    return this.discovery.get(serviceId);
  }

  listDiscovery(): ServiceDiscoveryRecord[] {
    return [...this.discovery.values()];
  }

  lifecycle(serviceId: string) {
    return stormFireServiceLifecycle.get(serviceId);
  }
}

export const stormFireServiceManager = new StormFireServiceManager();

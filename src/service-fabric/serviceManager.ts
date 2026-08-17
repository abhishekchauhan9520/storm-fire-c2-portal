import type { ServiceAdapter, ServiceAdapterFactory } from "./serviceAdapter";
import type { StormFireServiceManifest } from "./serviceRegistry";
import { stormFireServiceLifecycle } from "./serviceLifecycle";
import { stormFireServiceDiscovery, type ServiceDiscoveryRecord } from "./serviceDiscovery";
import { stormFireServiceObservability } from "./serviceObservability";

export class StormFireServiceManager {
  private factories = new Map<string, ServiceAdapterFactory>();
  private adapters = new Map<string, ServiceAdapter>();
  private discovery = new Map<string, ServiceDiscoveryRecord>();

  registerFactory(serviceId: string, factory: ServiceAdapterFactory): void {
    if (!serviceId) throw new Error("Service factory requires a service id.");
    if (this.factories.has(serviceId)) throw new Error(`Factory already registered: ${serviceId}`);
    this.factories.set(serviceId, factory);
    stormFireServiceObservability.record({ serviceId, type: "ADAPTER", action: "FACTORY_REGISTERED", success: true });
  }

  unregisterFactory(serviceId: string): boolean {
    this.adapters.delete(serviceId);
    this.discovery.delete(serviceId);
    const removed = this.factories.delete(serviceId);
    stormFireServiceObservability.record({ serviceId, type: "ADAPTER", action: "FACTORY_UNREGISTERED", success: removed });
    return removed;
  }

  discover(manifest: StormFireServiceManifest): ServiceDiscoveryRecord {
    const record = stormFireServiceDiscovery.discover(manifest);
    this.discovery.set(manifest.id, record);
    stormFireServiceObservability.record({
      serviceId: manifest.id,
      type: "DISCOVERY",
      action: "SERVICE_DISCOVERED",
      success: true,
      metadata: { version: manifest.version },
    });
    stormFireServiceObservability.record({
      serviceId: manifest.id,
      type: "COMPATIBILITY",
      action: "COMPATIBILITY_CHECK",
      success: record.compatibility.compatible,
      message: record.compatibility.errors.join("; ") || record.compatibility.warnings.join("; "),
    });
    return record;
  }

  install(manifest: StormFireServiceManifest): ServiceAdapter {
    const record = this.discover(manifest);
    if (!record.compatibility.compatible) {
      stormFireServiceObservability.record({ serviceId: manifest.id, type: "ERROR", action: "INSTALL_REJECTED", success: false, message: "Compatibility check failed." });
      throw new Error(`Service compatibility check failed for ${manifest.id}: ${record.compatibility.errors.join("; ")}`);
    }

    const factory = this.factories.get(manifest.id);
    if (!factory) {
      stormFireServiceObservability.record({ serviceId: manifest.id, type: "ERROR", action: "FACTORY_NOT_FOUND", success: false });
      throw new Error(`No adapter factory registered for service: ${manifest.id}`);
    }

    try {
      const adapter = factory(manifest);
      adapter.install();
      this.adapters.set(manifest.id, adapter);
      stormFireServiceObservability.record({ serviceId: manifest.id, type: "ADAPTER", action: "ADAPTER_INSTALLED", success: true });
      return adapter;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      stormFireServiceObservability.record({ serviceId: manifest.id, type: "ERROR", action: "INSTALL_FAILED", success: false, message });
      throw error;
    }
  }

  installRegistered(manifests: StormFireServiceManifest[]): ServiceAdapter[] {
    return manifests.filter((manifest) => manifest.enabled).flatMap((manifest) => {
      try { return [this.install(manifest)]; }
      catch (error) { console.warn(`[Service Fabric] Installation rejected for ${manifest.id}:`, error); return []; }
    });
  }

  getAdapter(serviceId: string): ServiceAdapter | undefined { return this.adapters.get(serviceId); }
  listAdapters(): ServiceAdapter[] { return [...this.adapters.values()]; }
  getDiscovery(serviceId: string): ServiceDiscoveryRecord | undefined { return this.discovery.get(serviceId); }
  listDiscovery(): ServiceDiscoveryRecord[] { return [...this.discovery.values()]; }
  lifecycle(serviceId: string) { return stormFireServiceLifecycle.get(serviceId); }
}

export const stormFireServiceManager = new StormFireServiceManager();

import type { ServiceAdapter, ServiceAdapterFactory } from "./serviceAdapter";
import type { StormFireServiceManifest } from "./serviceRegistry";
import { stormFireServiceLifecycle } from "./serviceLifecycle";

export class StormFireServiceManager {
  private factories = new Map<string, ServiceAdapterFactory>();
  private adapters = new Map<string, ServiceAdapter>();

  registerFactory(serviceId: string, factory: ServiceAdapterFactory): void {
    if (!serviceId) throw new Error("Service factory requires a service id.");
    if (this.factories.has(serviceId)) throw new Error(`Factory already registered: ${serviceId}`);
    this.factories.set(serviceId, factory);
  }

  unregisterFactory(serviceId: string): boolean {
    this.adapters.delete(serviceId);
    return this.factories.delete(serviceId);
  }

  install(manifest: StormFireServiceManifest): ServiceAdapter {
    const factory = this.factories.get(manifest.id);
    if (!factory) throw new Error(`No adapter factory registered for service: ${manifest.id}`);

    const adapter = factory(manifest);
    adapter.install();
    this.adapters.set(manifest.id, adapter);
    return adapter;
  }

  installRegistered(manifests: StormFireServiceManifest[]): ServiceAdapter[] {
    return manifests.filter((manifest) => manifest.enabled).map((manifest) => this.install(manifest));
  }

  getAdapter(serviceId: string): ServiceAdapter | undefined {
    return this.adapters.get(serviceId);
  }

  listAdapters(): ServiceAdapter[] {
    return [...this.adapters.values()];
  }

  lifecycle(serviceId: string) {
    return stormFireServiceLifecycle.get(serviceId);
  }
}

export const stormFireServiceManager = new StormFireServiceManager();

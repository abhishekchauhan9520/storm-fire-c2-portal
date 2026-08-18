import type { Service, ServiceStatus } from "../contracts/stormFireContracts";
import { stormFireDisplayFabric } from "./displayFabric";

export type StormFireServiceManifest = Service;

/**
 * Canonical Service Fabric registry. Services advertise capabilities and
 * information contracts; they do not own an isolated operational state model.
 */
export class ServiceFabric {
  private services = new Map<string, Service>();

  register(manifest: Service): Service {
    if (!manifest.id || !manifest.name || !manifest.version) throw new Error("Service requires id, name and version.");
    if (this.services.has(manifest.id)) throw new Error(`Service ${manifest.id} is already registered.`);
    const normalized = this.clone(manifest);
    this.services.set(manifest.id, normalized);
    return this.clone(normalized);
  }

  update(id: string, patch: Partial<Service>): Service {
    const current = this.require(id);
    const next = this.clone({ ...current, ...patch, id: current.id });
    this.services.set(id, next);
    return this.clone(next);
  }

  activate(id: string): boolean { return this.setStatus(id, "ACTIVE"); }
  pause(id: string): boolean { return this.setStatus(id, "PAUSED"); }
  offline(id: string): boolean { return this.setStatus(id, "OFFLINE"); }

  get(id: string): Service | undefined {
    const service = this.services.get(id);
    return service ? this.clone(service) : undefined;
  }

  list(status?: ServiceStatus): Service[] {
    return [...this.services.values()]
      .filter((service) => !status || service.status === status)
      .map((service) => this.clone(service));
  }

  consumersOf(type: string): Service[] {
    return this.list("ACTIVE").filter((service) => service.informationTypesConsumed.includes(type));
  }

  producersOf(type: string): Service[] {
    return this.list("ACTIVE").filter((service) => service.informationTypesProduced.includes(type));
  }

  canUseDisplay(serviceId: string, surfaceId: string): boolean {
    const service = this.services.get(serviceId);
    return Boolean(service && service.status === "ACTIVE" && service.displaySurfaceIds.includes(surfaceId) && stormFireDisplayFabric.getSurface(surfaceId));
  }

  hasInformationPath(serviceId: string, type: string): boolean {
    const service = this.services.get(serviceId);
    return Boolean(service && service.status === "ACTIVE" && (service.informationTypesProduced.includes(type) || service.informationTypesConsumed.includes(type)));
  }

  clear(): void { this.services.clear(); }

  private require(id: string): Service {
    const service = this.services.get(id);
    if (!service) throw new Error(`Service ${id} was not found.`);
    return service;
  }

  private setStatus(id: string, status: ServiceStatus): boolean {
    const service = this.services.get(id);
    if (!service) return false;
    service.status = status;
    return true;
  }

  private clone(service: Service): Service {
    return {
      ...service,
      capabilities: service.capabilities.map((capability) => ({ ...capability })),
      informationTypesProduced: [...service.informationTypesProduced],
      informationTypesConsumed: [...service.informationTypesConsumed],
      displaySurfaceIds: [...service.displaySurfaceIds],
      dependencyServiceIds: [...service.dependencyServiceIds],
    };
  }
}

export const stormFireServiceFabric = new ServiceFabric();

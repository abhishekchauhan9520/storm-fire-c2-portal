import { stormFireDisplayFabric } from "./displayFabric";

export type ServiceStatus = "REGISTERED" | "ACTIVE" | "PAUSED" | "OFFLINE";
export interface StormFireServiceManifest {
  id: string; name: string; version: string; description?: string;
  capabilities: string[]; informationTypesProduced: string[]; informationTypesConsumed: string[];
  displaySurfaceIds?: string[]; status: ServiceStatus; ownerParticipantId: string;
}

/** Services participate in the shared information environment; they do not create isolated operational data fabrics. */
export class ServiceFabric {
  private services = new Map<string, StormFireServiceManifest>();
  register(manifest: StormFireServiceManifest): StormFireServiceManifest {
    if (this.services.has(manifest.id)) throw new Error(`Service ${manifest.id} is already registered.`);
    const normalized = { ...manifest, capabilities: [...manifest.capabilities], informationTypesProduced: [...manifest.informationTypesProduced], informationTypesConsumed: [...manifest.informationTypesConsumed], displaySurfaceIds: [...(manifest.displaySurfaceIds ?? [])] };
    this.services.set(manifest.id, normalized); return this.get(manifest.id)!;
  }
  activate(id: string): boolean { return this.setStatus(id, "ACTIVE"); }
  pause(id: string): boolean { return this.setStatus(id, "PAUSED"); }
  offline(id: string): boolean { return this.setStatus(id, "OFFLINE"); }
  get(id: string): StormFireServiceManifest | undefined { const s = this.services.get(id); return s ? this.copy(s) : undefined; }
  list(status?: ServiceStatus): StormFireServiceManifest[] { return [...this.services.values()].filter(s => !status || s.status === status).map(s => this.copy(s)); }
  consumersOf(type: string): StormFireServiceManifest[] { return this.list("ACTIVE").filter(s => s.informationTypesConsumed.includes(type)); }
  producersOf(type: string): StormFireServiceManifest[] { return this.list("ACTIVE").filter(s => s.informationTypesProduced.includes(type)); }
  canUseDisplay(serviceId: string, surfaceId: string): boolean { const s = this.services.get(serviceId); return !!s && s.status === "ACTIVE" && s.displaySurfaceIds?.includes(surfaceId) === true && !!stormFireDisplayFabric.getSurface(surfaceId); }
  hasInformationPath(serviceId: string, type: string): boolean { const s = this.services.get(serviceId); return !!s && s.status === "ACTIVE" && (s.informationTypesProduced.includes(type) || s.informationTypesConsumed.includes(type)); }
  clear(): void { this.services.clear(); }
  private setStatus(id: string, status: ServiceStatus): boolean { const s = this.services.get(id); if (!s) return false; s.status = status; return true; }
  private copy(s: StormFireServiceManifest): StormFireServiceManifest { return { ...s, capabilities: [...s.capabilities], informationTypesProduced: [...s.informationTypesProduced], informationTypesConsumed: [...s.informationTypesConsumed], displaySurfaceIds: [...(s.displaySurfaceIds ?? [])] }; }
}
export const stormFireServiceFabric = new ServiceFabric();

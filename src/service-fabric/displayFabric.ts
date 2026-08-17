import type { CanonicalInformationRecord } from "./informationAdapter";

export type DisplaySurfaceType = "COP" | "MAP" | "VIDEO" | "WEATHER" | "SPACE" | "EW" | "LOGISTICS" | "COMMUNICATIONS" | "INTELLIGENCE" | "CUSTOM";
export interface DisplaySurface { id: string; name: string; type: DisplaySurfaceType; participantId: string; informationTypes: string[]; active: boolean; }
export interface DisplayBinding { surfaceId: string; informationId: string; boundAt: string; }

/** Presentation boundary: operational screens consume canonical information without owning it. */
export class DisplayFabric {
  private surfaces = new Map<string, DisplaySurface>();
  private bindings = new Map<string, DisplayBinding[]>();
  registerSurface(surface: DisplaySurface): DisplaySurface { this.surfaces.set(surface.id, { ...surface, informationTypes: [...surface.informationTypes] }); return this.getSurface(surface.id)!; }
  getSurface(surfaceId: string): DisplaySurface | undefined { const surface = this.surfaces.get(surfaceId); return surface ? { ...surface, informationTypes: [...surface.informationTypes] } : undefined; }
  listSurfaces(): DisplaySurface[] { return Array.from(this.surfaces.values()).map((surface) => ({ ...surface, informationTypes: [...surface.informationTypes] })); }
  bind(surfaceId: string, record: CanonicalInformationRecord): DisplayBinding | undefined {
    const surface = this.surfaces.get(surfaceId);
    if (!surface || !surface.active || !surface.informationTypes.includes(record.kind)) return undefined;
    const binding: DisplayBinding = { surfaceId, informationId: record.id, boundAt: new Date().toISOString() };
    const current = this.bindings.get(surfaceId) ?? [];
    if (!current.some((item) => item.informationId === record.id)) current.push(binding);
    this.bindings.set(surfaceId, current); return binding;
  }
  bindingsFor(surfaceId: string): DisplayBinding[] { return [...(this.bindings.get(surfaceId) ?? [])]; }
  clear(): void { this.surfaces.clear(); this.bindings.clear(); }
}
export const stormFireDisplayFabric = new DisplayFabric();

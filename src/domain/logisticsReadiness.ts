export type StormFireReadinessState = "READY" | "DEGRADED" | "MAINTENANCE" | "NON_OPERATIONAL";
export interface StormFireLogisticsAssetReadiness { assetId: string; assetType: string; ownerParticipantId: string; state: StormFireReadinessState; availableFrom?: string; maintenanceDueAt?: string; locationScopeId: string; }
export class LogisticsReadinessService {
  private readonly assets = new Map<string, StormFireLogisticsAssetReadiness>();
  register(asset: StormFireLogisticsAssetReadiness): void { if (!asset.assetId || !asset.ownerParticipantId || !asset.locationScopeId) throw new Error("Readiness record requires asset, owner and location scope."); if (this.assets.has(asset.assetId)) throw new Error(`Readiness asset ${asset.assetId} already exists.`); this.assets.set(asset.assetId, { ...asset }); }
  get(assetId: string): StormFireLogisticsAssetReadiness | undefined { const asset = this.assets.get(assetId); return asset ? { ...asset } : undefined; }
  updateState(assetId: string, state: StormFireReadinessState, availableFrom?: string): StormFireLogisticsAssetReadiness { const asset = this.assets.get(assetId); if (!asset) throw new Error(`Readiness asset ${assetId} not found.`); asset.state = state; asset.availableFrom = availableFrom; return { ...asset }; }
  canAllocate(assetId: string): boolean { return this.assets.get(assetId)?.state === "READY"; }
  listByScope(scopeId: string): StormFireLogisticsAssetReadiness[] { return [...this.assets.values()].filter(a => a.locationScopeId === scopeId).map(a => ({ ...a })); }
}
export const stormFireLogisticsReadiness = new LogisticsReadinessService();

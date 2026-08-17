export interface StormFireScopePoint { latitude: number; longitude: number; }

export interface StormFireGeographicScope { id: string; name: string; polygon?: StormFireScopePoint[]; radiusKm?: number; center?: StormFireScopePoint; enabled: boolean; }

/** Evaluates coarse operational-area membership. Polygon uses a ray-casting test; radius uses great-circle distance. */
export class GeographicScopeEngine {
  private readonly scopes = new Map<string, StormFireGeographicScope>();

  register(scope: StormFireGeographicScope): void {
    if (!scope.id) throw new Error("Geographic scope requires an id.");
    if (this.scopes.has(scope.id)) throw new Error(`Geographic scope ${scope.id} already exists.`);
    if (!scope.polygon && !(scope.center && scope.radiusKm !== undefined)) throw new Error("Scope requires a polygon or center/radius.");
    this.scopes.set(scope.id, { ...scope, polygon: scope.polygon ? [...scope.polygon] : undefined });
  }

  get(id: string): StormFireGeographicScope | undefined { return this.scopes.get(id); }

  contains(scopeId: string, point: StormFireScopePoint): boolean {
    const scope = this.scopes.get(scopeId);
    if (!scope || !scope.enabled) return false;
    if (scope.center && scope.radiusKm !== undefined && this.distanceKm(scope.center, point) <= scope.radiusKm) return true;
    if (!scope.polygon || scope.polygon.length < 3) return false;
    let inside = false;
    for (let i = 0, j = scope.polygon.length - 1; i < scope.polygon.length; j = i++) {
      const a = scope.polygon[i], b = scope.polygon[j];
      const crosses = (a.longitude > point.longitude) !== (b.longitude > point.longitude);
      if (crosses && point.latitude < ((b.latitude - a.latitude) * (point.longitude - a.longitude)) / (b.longitude - a.longitude) + a.latitude) inside = !inside;
    }
    return inside;
  }

  private distanceKm(a: StormFireScopePoint, b: StormFireScopePoint): number {
    const rad = (value: number) => value * Math.PI / 180;
    const dLat = rad(b.latitude - a.latitude), dLon = rad(b.longitude - a.longitude);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }
}

export const stormFireGeographicScopes = new GeographicScopeEngine();

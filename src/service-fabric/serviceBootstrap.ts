import { stormFireServiceManager } from "./serviceManager";
import { ArtilleryC2ServiceAdapter } from "./artilleryC2Adapter";
import type { StormFireServiceManifest } from "./serviceManifestAdapter";

/**
 * Registers domain adapters with the generic Service Fabric manager.
 * The bootstrap layer is the only place that maps a service id to an adapter.
 */
export function registerStormFireServiceAdapters(): void {
  stormFireServiceManager.registerFactory(
    "artillery-c2",
    (manifest: StormFireServiceManifest) => new ArtilleryC2ServiceAdapter(manifest),
  );
}

export function installStormFireServices(manifests: StormFireServiceManifest[]) {
  registerStormFireServiceAdapters();
  return stormFireServiceManager.installRegistered(manifests);
}

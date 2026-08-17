import type { StormFireServiceManifest } from "./serviceRegistry";

export const STORM_FIRE_SERVICE_API_VERSION = "1.0";

export interface ServiceCapabilityDescriptor {
  id: string;
  version: string;
  capabilities: string[];
  consumes: string[];
  produces: string[];
  relationshipAxes: Array<"VERTICAL" | "HORIZONTAL" | "DIAGONAL">;
  stormFireApiVersion: string;
}

export interface CompatibilityResult {
  compatible: boolean;
  errors: string[];
  warnings: string[];
  descriptor: ServiceCapabilityDescriptor;
}

export function discoverServiceCapabilities(manifest: StormFireServiceManifest): ServiceCapabilityDescriptor {
  return {
    id: manifest.id,
    version: manifest.version,
    capabilities: [...manifest.capabilities],
    consumes: [...manifest.consumes],
    produces: [...manifest.produces],
    relationshipAxes: [...manifest.relationshipAxes],
    stormFireApiVersion: STORM_FIRE_SERVICE_API_VERSION,
  };
}

export function validateServiceCompatibility(
  manifest: StormFireServiceManifest,
  supportedApiVersion = STORM_FIRE_SERVICE_API_VERSION,
): CompatibilityResult {
  const descriptor = discoverServiceCapabilities(manifest);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!manifest.id || !manifest.name || !manifest.version) errors.push("Service identity/version is incomplete.");
  if (manifest.capabilities.length === 0) errors.push("Service declares no capabilities.");
  if (descriptor.stormFireApiVersion !== supportedApiVersion) {
    errors.push(`Unsupported Storm Fire service API version: ${descriptor.stormFireApiVersion}`);
  }
  if (manifest.consumes.length === 0 && manifest.produces.length === 0) {
    warnings.push("Service neither consumes nor produces declared information classes.");
  }
  if (manifest.relationshipAxes.length === 0) {
    warnings.push("Service declares no relationship axes.");
  }

  return { compatible: errors.length === 0, errors, warnings, descriptor };
}

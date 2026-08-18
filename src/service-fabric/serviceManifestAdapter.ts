import type { Service } from "../contracts/stormFireContracts";

export type RelationshipAxis = "VERTICAL" | "HORIZONTAL" | "DIAGONAL";
export type ServiceCapability = "DISCOVER" | "CONSUME" | "CONTRIBUTE" | "RELATE" | "PUBLISH_EVENT" | "PARALLEL_ALERT";

/**
 * Transitional manifest shape for lifecycle/compatibility tooling.
 * It contains no authoritative runtime state; canonical Service state lives in Service Fabric.
 */
export interface StormFireServiceManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  capabilities: ServiceCapability[];
  consumes: string[];
  produces: string[];
  relationships: RelationshipAxis[];
  enabled: boolean;
}

export function validateServiceContract(service: StormFireServiceManifest): string[] {
  const errors: string[] = [];
  const required: ServiceCapability[] = ["DISCOVER", "CONSUME", "CONTRIBUTE", "RELATE", "PUBLISH_EVENT", "PARALLEL_ALERT"];
  for (const capability of required) {
    if (!service.capabilities.includes(capability)) errors.push(`Missing required capability: ${capability}`);
  }
  if (!service.consumes.length) errors.push("Service must consume shared information.");
  if (!service.produces.length) errors.push("Service must contribute shared information.");
  if (!service.relationships.length) errors.push("Service must support flexible relationships.");
  return errors;
}

export const stormFireServiceManifests: StormFireServiceManifest[] = [
  {
    id: "artillery-c2",
    name: "Artillery C2",
    version: "0.1.0",
    description: "Specialist capability connected to the common Storm Fire information environment.",
    capabilities: ["DISCOVER", "CONSUME", "CONTRIBUTE", "RELATE", "PUBLISH_EVENT", "PARALLEL_ALERT"],
    consumes: ["Participant", "Resource", "Observation", "Track", "Mission", "Context"],
    produces: ["Task", "Assessment", "Alert", "ServiceEvent"],
    relationships: ["VERTICAL", "HORIZONTAL", "DIAGONAL"],
    enabled: true,
  },
  {
    id: "strix",
    name: "STRIX",
    version: "core",
    description: "Decision-support capability operating on shared Storm Fire context.",
    capabilities: ["DISCOVER", "CONSUME", "CONTRIBUTE", "RELATE", "PUBLISH_EVENT", "PARALLEL_ALERT"],
    consumes: ["Evidence", "Track", "Mission", "Context"],
    produces: ["Finding", "AssessmentSupport", "ServiceEvent"],
    relationships: ["VERTICAL", "HORIZONTAL", "DIAGONAL"],
    enabled: true,
  },
  {
    id: "kavach",
    name: "KAVACH",
    version: "core",
    description: "Collaboration capability operating inside the common identity and policy boundary.",
    capabilities: ["DISCOVER", "CONSUME", "CONTRIBUTE", "RELATE", "PUBLISH_EVENT", "PARALLEL_ALERT"],
    consumes: ["Participant", "Context", "Alert"],
    produces: ["MessageEvent", "ContextUpdate", "Alert"],
    relationships: ["VERTICAL", "HORIZONTAL", "DIAGONAL"],
    enabled: true,
  },
];

export function toCanonicalService(manifest: StormFireServiceManifest): Service {
  return {
    id: manifest.id,
    name: manifest.name,
    version: manifest.version,
    description: manifest.description,
    capabilities: manifest.capabilities.map((id) => ({ id, name: id })),
    informationTypesProduced: [...new Set(manifest.produces)],
    informationTypesConsumed: [...new Set(manifest.consumes)],
    displaySurfaceIds: [manifest.id],
    dependencyServiceIds: [],
    ownerParticipantId: "system",
    status: manifest.enabled ? "ACTIVE" : "PAUSED",
  };
}

export function fromCanonicalService(service: Service): StormFireServiceManifest {
  const knownCapabilities = new Set<ServiceCapability>([
    "DISCOVER",
    "CONSUME",
    "CONTRIBUTE",
    "RELATE",
    "PUBLISH_EVENT",
    "PARALLEL_ALERT",
  ]);

  return {
    id: service.id,
    name: service.name,
    version: service.version,
    description: service.description ?? "",
    capabilities: service.capabilities
      .map((capability) => capability.id)
      .filter((id): id is ServiceCapability => knownCapabilities.has(id as ServiceCapability)),
    consumes: [...service.informationTypesConsumed],
    produces: [...service.informationTypesProduced],
    relationships: ["VERTICAL", "HORIZONTAL", "DIAGONAL"],
    enabled: service.status === "ACTIVE" || service.status === "REGISTERED",
  };
}

export function registerCanonicalService(
  manifest: StormFireServiceManifest,
  serviceFabric: { get(id: string): Service | undefined; register(service: Service): Service },
): StormFireServiceManifest {
  const errors = validateServiceContract(manifest);
  if (errors.length) throw new Error(`Storm Fire service contract rejected: ${errors.join("; ")}`);

  const current = serviceFabric.get(manifest.id);
  if (!current) serviceFabric.register(toCanonicalService(manifest));
  return fromCanonicalService(serviceFabric.get(manifest.id)!);
}

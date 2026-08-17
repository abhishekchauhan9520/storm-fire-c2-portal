import type { Service } from "../contracts/stormFireContracts";
import { stormFireServiceFabric } from "./serviceFabric";

export type RelationshipAxis = "VERTICAL" | "HORIZONTAL" | "DIAGONAL";
export type ServiceCapability = "DISCOVER" | "CONSUME" | "CONTRIBUTE" | "RELATE" | "PUBLISH_EVENT" | "PARALLEL_ALERT";

/**
 * Legacy service contract retained only as an adapter/configuration shape.
 * The authoritative runtime state lives in the canonical Service Fabric.
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
  required.forEach((capability) => {
    if (!service.capabilities.includes(capability)) errors.push(`Missing required capability: ${capability}`);
  });
  if (!service.consumes.length) errors.push("Service must consume shared information.");
  if (!service.produces.length) errors.push("Service must contribute shared information.");
  if (!service.relationships.length) errors.push("Service must support flexible relationships.");
  return errors;
}

export const stormFireServices: StormFireServiceManifest[] = [
  {
    id: "artillery-c2", name: "Artillery C2", version: "0.1.0",
    description: "Specialist capability connected to the common Storm Fire information environment.",
    capabilities: ["DISCOVER", "CONSUME", "CONTRIBUTE", "RELATE", "PUBLISH_EVENT", "PARALLEL_ALERT"],
    consumes: ["Participant", "Resource", "Observation", "Track", "Mission", "Context"],
    produces: ["Task", "Assessment", "Alert", "ServiceEvent"],
    relationships: ["VERTICAL", "HORIZONTAL", "DIAGONAL"], enabled: true,
  },
  {
    id: "strix", name: "STRIX", version: "core",
    description: "Decision-support capability operating on shared Storm Fire context.",
    capabilities: ["DISCOVER", "CONSUME", "CONTRIBUTE", "RELATE", "PUBLISH_EVENT", "PARALLEL_ALERT"],
    consumes: ["Evidence", "Track", "Mission", "Context"], produces: ["Finding", "AssessmentSupport", "ServiceEvent"],
    relationships: ["VERTICAL", "HORIZONTAL", "DIAGONAL"], enabled: true,
  },
  {
    id: "kavach", name: "KAVACH", version: "core",
    description: "Collaboration capability operating inside the common identity and policy boundary.",
    capabilities: ["DISCOVER", "CONSUME", "CONTRIBUTE", "RELATE", "PUBLISH_EVENT", "PARALLEL_ALERT"],
    consumes: ["Participant", "Context", "Alert"], produces: ["MessageEvent", "ContextUpdate", "Alert"],
    relationships: ["VERTICAL", "HORIZONTAL", "DIAGONAL"], enabled: true,
  },
];

/** Convert the compatibility/configuration manifest into the canonical Service contract. */
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

/** Convert canonical runtime state back to the compatibility shape for legacy callers. */
export function fromCanonicalService(service: Service): StormFireServiceManifest {
  const knownCapabilities = new Set<ServiceCapability>(["DISCOVER", "CONSUME", "CONTRIBUTE", "RELATE", "PUBLISH_EVENT", "PARALLEL_ALERT"]);
  return {
    id: service.id,
    name: service.name,
    version: service.version,
    description: service.description ?? "",
    capabilities: service.capabilities.map((capability) => capability.id).filter((id): id is ServiceCapability => knownCapabilities.has(id as ServiceCapability)),
    consumes: [...service.informationTypesConsumed],
    produces: [...service.informationTypesProduced],
    relationships: ["VERTICAL", "HORIZONTAL", "DIAGONAL"],
    enabled: service.status === "ACTIVE" || service.status === "REGISTERED",
  };
}

/**
 * Register configuration into the authoritative Service Fabric.
 * Re-registering an existing service is idempotent and never creates a second store.
 */
export function registerStormFireService(service: StormFireServiceManifest): StormFireServiceManifest {
  const errors = validateServiceContract(service);
  if (errors.length) throw new Error(`Storm Fire service contract rejected: ${errors.join("; ")}`);

  const current = stormFireServiceFabric.get(service.id);
  if (!current) {
    return fromCanonicalService(stormFireServiceFabric.register(toCanonicalService(service)));
  }

  return fromCanonicalService(current);
}

export function getCanonicalStormFireService(id: string): Service | undefined {
  return stormFireServiceFabric.get(id);
}

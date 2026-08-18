import type { StormFireServiceManifest, RelationshipAxis } from "./serviceManifestAdapter";
import { stormFireRelationshipEngine, type StormFireRelationship } from "./relationshipEngine";

export interface RelationshipRequest {
  from: string;
  to: string;
  axis: RelationshipAxis;
  relation: string;
}

export function connectRelationship(
  service: StormFireServiceManifest,
  request: RelationshipRequest,
): StormFireRelationship {
  if (!service.enabled) throw new Error(`Service is disabled: ${service.id}`);
  if (!service.capabilities.includes("RELATE")) {
    throw new Error(`${service.id} is not authorized to create relationships`);
  }

  return stormFireRelationshipEngine.connect({
    ...request,
    source: service.id,
  });
}

export function queryRelationships(
  service: StormFireServiceManifest,
  participantId?: string,
  axis?: RelationshipAxis,
): StormFireRelationship[] {
  if (!service.enabled) throw new Error(`Service is disabled: ${service.id}`);
  if (!service.capabilities.includes("RELATE")) {
    throw new Error(`${service.id} is not authorized to query relationships`);
  }

  return stormFireRelationshipEngine.query({ participantId, axis, activeOnly: true });
}

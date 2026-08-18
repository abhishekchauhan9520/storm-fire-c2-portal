import type { InformationClassification, ParticipantContext, Service } from "../contracts/stormFireContracts";
import { stormFireParticipantContexts } from "./participantContext";
import { stormFireServiceFabric } from "../service-fabric/serviceFabric";

/**
 * Transitional input shape retained for existing scenario/test callers.
 * None of these fields are authoritative; they must agree with canonical
 * ParticipantContext when supplied.
 */
export interface StormFireParticipantOperationalContext {
  participantId: string;
  organizationId?: string;
  roleId?: string;
  serviceIds?: string[];
  capabilities?: string[];
  geographicScopeIds?: string[];
  relationshipIds?: string[];
  informationClassification?: InformationClassification;
}

export interface StormFireResolvedOperationalContext {
  participantId: string;
  organizationIds: string[];
  roleIds: string[];
  organizationId: string;
  roleId: string;
  geographicScopeIds: string[];
  relationshipIds: string[];
  informationClassification?: InformationClassification;
  services: Service[];
}

function assertSubset(name: string, requested: string[] | undefined, canonical: string[]): void {
  if (!requested) return;
  const canonicalSet = new Set(canonical);
  const invalid = requested.filter((value) => !canonicalSet.has(value));
  if (invalid.length) throw new Error(`${name} is not part of the canonical participant context: ${invalid.join(", ")}`);
}

function resolveContext(input: string | StormFireParticipantOperationalContext): ParticipantContext | undefined {
  return stormFireParticipantContexts.resolve(typeof input === "string" ? input : input.participantId);
}

/**
 * Resolves a projection of canonical ParticipantContext for Dynamic COP and
 * other operational consumers. It never maintains an independent context store.
 */
export function resolveParticipantOperationalContext(input: string | StormFireParticipantOperationalContext): StormFireResolvedOperationalContext {
  const canonical = resolveContext(input);
  if (!canonical) {
    const participantId = typeof input === "string" ? input : input.participantId;
    throw new Error(`Canonical participant context was not found or participant is disabled: ${participantId}`);
  }

  if (typeof input !== "string") {
    if (input.organizationId && !canonical.organizationIds.includes(input.organizationId)) throw new Error(`Organization ${input.organizationId} is not assigned to participant ${canonical.participantId}.`);
    if (input.roleId && !canonical.roleIds.includes(input.roleId)) throw new Error(`Role ${input.roleId} is not assigned to participant ${canonical.participantId}.`);
    assertSubset("serviceIds", input.serviceIds, canonical.serviceIds);
    assertSubset("geographicScopeIds", input.geographicScopeIds, canonical.geographicScopeIds);
    assertSubset("relationshipIds", input.relationshipIds, canonical.informationRelationshipIds);
    if (input.informationClassification && canonical.classification && input.informationClassification !== canonical.classification) {
      throw new Error("Information classification conflicts with canonical participant context.");
    }
  }

  const organizationId = canonical.organizationIds[0];
  const roleId = canonical.roleIds[0];
  if (!organizationId || !roleId) throw new Error(`Participant ${canonical.participantId} requires at least one organization and one role for an operational projection.`);

  const services = canonical.serviceIds
    .map((serviceId) => stormFireServiceFabric.get(serviceId))
    .filter((service): service is Service => Boolean(service && service.status === "ACTIVE"));

  return {
    participantId: canonical.participantId,
    organizationIds: [...canonical.organizationIds],
    roleIds: [...canonical.roleIds],
    organizationId,
    roleId,
    geographicScopeIds: [...canonical.geographicScopeIds],
    relationshipIds: [...canonical.informationRelationshipIds],
    informationClassification: canonical.classification,
    services,
  };
}

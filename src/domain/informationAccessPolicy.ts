import { stormFireParticipantContexts } from "./participantContext";
import { stormFireServiceFabric } from "../service-fabric/serviceFabric";
import { stormFireInformationFabric, type StormFireInformationEnvelope } from "./informationFabric";

export interface StormFireInformationAccessResult { visible: StormFireInformationEnvelope[]; filteredCount: number; }

/** First-pass COP visibility policy: active service + information type + declared scope/relationship tags. */
export function resolveStormFireInformationForCop(participantId: string): StormFireInformationAccessResult {
  const context = stormFireParticipantContexts.resolve(participantId);
  if (!context) return { visible: [], filteredCount: 0 };
  const activeServices = context.serviceIds.map(id => stormFireServiceFabric.get(id)).filter(service => service?.status === "ACTIVE");
  const allowedTypes = new Set(activeServices.flatMap(service => service?.informationTypesProduced ?? []));
  const allowedScopes = new Set(context.geographicScopeIds.map(id => `scope:${id}`));
  const allowedRelationships = new Set(context.informationRelationshipIds.map(id => `relationship:${id}`));
  const all = stormFireInformationFabric.historyFor();
  const visible = all.filter(message => {
    if (!allowedTypes.has(message.type)) return false;
    const tags = new Set(message.tags ?? []);
    const scopes = [...tags].filter(tag => tag.startsWith("scope:"));
    const relationships = [...tags].filter(tag => tag.startsWith("relationship:"));
    return (scopes.length === 0 || scopes.some(tag => allowedScopes.has(tag))) && (relationships.length === 0 || relationships.some(tag => allowedRelationships.has(tag)));
  });
  return { visible, filteredCount: all.length - visible.length };
}

import { stormFireInformationFabric, type StormFireInformationEnvelope } from "./informationFabric";
import type { StormFireResolvedOperationalContext } from "./participantOperationalContext";
import { resolveStormFireDynamicCop, type StormFireOperationalInformation, type StormFireDynamicCop } from "./dynamicCopResolver";

export interface StormFireDynamicCopSubscription { id: string; context: StormFireResolvedOperationalContext; informationTypes: string[]; onUpdate: (cop: StormFireDynamicCop) => void; }

function tagValue(tags: string[] | undefined, prefix: string): string | undefined {
  return tags?.find((tag) => tag.startsWith(prefix))?.slice(prefix.length);
}

function pointFromTags(tags: string[] | undefined) {
  const latitude = Number(tagValue(tags, "lat:"));
  const longitude = Number(tagValue(tags, "lon:"));
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return undefined;
  return { latitude, longitude };
}

export function buildDynamicCopFromFabric<T>(context: StormFireResolvedOperationalContext, information?: StormFireInformationEnvelope<T>[], generatedAt = new Date().toISOString()): StormFireDynamicCop<T> {
  const source = information ?? stormFireInformationFabric.historyFor() as StormFireInformationEnvelope<T>[];
  const operationalInformation: StormFireOperationalInformation<T>[] = source.map((message) => ({
    id: message.id,
    occurredAt: message.occurredAt,
    informationType: message.type,
    organizationId: tagValue(message.tags, "org:") ?? message.provenance.sourceId,
    producerParticipantId: message.producerParticipantId,
    geographicScopeId: tagValue(message.tags, "geo:") ?? message.geographicScopeIds[0],
    informationPoint: pointFromTags(message.tags),
    relationshipId: tagValue(message.tags, "rel:"),
    classification: message.classification,
    payload: message.payload as T,
  }));
  return resolveStormFireDynamicCop(context, operationalInformation, generatedAt);
}

export function subscribeDynamicCopToFabric<T>(subscription: StormFireDynamicCopSubscription): () => void {
  const handler = (_message: StormFireInformationEnvelope) => subscription.onUpdate(buildDynamicCopFromFabric(subscription.context));
  stormFireInformationFabric.subscribe({ id: subscription.id, participantId: subscription.context.participantId, informationTypes: subscription.informationTypes, enabled: true, handler });
  return () => stormFireInformationFabric.unsubscribe(subscription.id);
}

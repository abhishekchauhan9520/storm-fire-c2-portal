import { stormFireInformationFabric, type StormFireInformationEnvelope } from "./informationFabric";
import type { StormFireResolvedOperationalContext } from "./participantOperationalContext";
import { resolveStormFireDynamicCop, type StormFireOperationalInformation, type StormFireDynamicCop } from "./dynamicCopResolver";

export interface StormFireDynamicCopSubscription { id: string; context: StormFireResolvedOperationalContext; informationTypes: string[]; onUpdate: (cop: StormFireDynamicCop) => void; }

export function buildDynamicCopFromFabric<T>(context: StormFireResolvedOperationalContext, information?: StormFireInformationEnvelope<T>[], generatedAt = new Date().toISOString()): StormFireDynamicCop<T> {
  const source = information ?? stormFireInformationFabric.historyFor();
  const operationalInformation: StormFireOperationalInformation<T>[] = source.map(message => ({ id: message.id, occurredAt: message.occurredAt, informationType: message.type, organizationId: message.producerParticipantId ?? message.provenance.sourceId, geographicScopeId: message.tags?.find(tag => tag.startsWith("geo:"))?.slice(4), relationshipId: message.tags?.find(tag => tag.startsWith("rel:"))?.slice(4), classification: message.tags?.find(tag => tag.startsWith("classification:"))?.slice(14), payload: message.payload }));
  return resolveStormFireDynamicCop(context, operationalInformation, generatedAt);
}

export function subscribeDynamicCopToFabric<T>(subscription: StormFireDynamicCopSubscription): () => void {
  const handler = (_message: StormFireInformationEnvelope) => subscription.onUpdate(buildDynamicCopFromFabric(subscription.context));
  stormFireInformationFabric.subscribe({ id: subscription.id, participantId: subscription.context.participantId, informationTypes: subscription.informationTypes, handler });
  return () => stormFireInformationFabric.unsubscribe(subscription.id);
}

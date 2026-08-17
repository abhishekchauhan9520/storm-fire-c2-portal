import { resolveStormFireCopContext, StormFireCopContext } from "./dynamicCopContext";
import { StormFireInformationEnvelope, stormFireInformationFabric } from "./informationFabric";

export interface OperationalInformationView {
  participantId: string;
  context: StormFireCopContext;
  information: StormFireInformationEnvelope[];
}

/** Builds a participant-scoped operational view from shared information, rather than maintaining separate COP data stores. */
export function buildOperationalInformationView(participantId: string, informationTypes: string[] = ["*"]): OperationalInformationView | undefined {
  const context = resolveStormFireCopContext(participantId);
  if (!context) return undefined;

  const allowed = new Set(informationTypes);
  const information = stormFireInformationFabric.historyFor().filter(message =>
    (allowed.has("*") || allowed.has(message.type)) && context.activeServiceIds.includes(message.producerServiceId),
  );

  return { participantId, context, information };
}

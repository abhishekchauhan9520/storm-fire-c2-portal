import type { StormFireDynamicCop } from "./dynamicCopResolver";

export interface StormFireAdvisoryContext {
  participantId: string;
  services: string[];
  informationCount: number;
  informationTypes: string[];
  unresolvedAlertCount: number;
  generatedAt: string;
}

/**
 * Bounded AI/decision-support input. It is deliberately derived from an
 * already-authorized participant COP rather than receiving frontend state.
 */
export function buildStormFireAdvisoryContext(cop: StormFireDynamicCop): StormFireAdvisoryContext {
  const informationTypes = [...new Set(cop.information.map((item) => item.informationType))].sort();
  const unresolvedAlertCount = cop.information.filter(
    (item) => item.informationType === "Alert" &&
      (item.payload as { state?: string } | undefined)?.state !== "RESOLVED",
  ).length;

  return {
    participantId: cop.participantId,
    services: [...cop.serviceIds],
    informationCount: cop.information.length,
    informationTypes,
    unresolvedAlertCount,
    generatedAt: cop.generatedAt,
  };
}

export function generateBoundedAdvisory(context: StormFireAdvisoryContext, question: string): string {
  return [
    `Storm Fire decision-support context for participant ${context.participantId}.`,
    `Authorized services: ${context.services.join(", ") || "none"}.`,
    `Current authorized information objects: ${context.informationCount}.`,
    `Visible information types: ${context.informationTypes.join(", ") || "none"}.`,
    `Unresolved alerts in this projection: ${context.unresolvedAlertCount}.`,
    `Context generated: ${context.generatedAt}.`,
    `Operator question received: ${question || "none"}.`,
    "This response is bounded to the participant-specific authorized information projection. It does not issue operational commands, select weapons, or authorize action.",
  ].join(" ");
}

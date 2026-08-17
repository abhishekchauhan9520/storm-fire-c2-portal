import { resolveParticipantOperationalContext, type StormFireParticipantOperationalContext } from "./participantOperationalContext";
import { resolveStormFireDynamicCop, type StormFireOperationalInformation } from "./dynamicCopResolver";

export function runDynamicCopScenario() {
  const companyContext: StormFireParticipantOperationalContext = { participantId: "company-cdr", organizationId: "company-alpha", roleId: "company-commander", serviceIds: ["logistics", "uav"], capabilities: ["logistics:view", "uav:view"], geographicScopeIds: ["sector-20km"], relationshipIds: ["brigade-logistics"], informationClassification: "operational" };
  const brigadeContext: StormFireParticipantOperationalContext = { participantId: "brigade-cdr", organizationId: "brigade-alpha", roleId: "brigade-commander", serviceIds: ["logistics", "uav", "ew", "air-defence"], capabilities: ["logistics:view", "uav:view", "ew:view", "air-defence:view"], geographicScopeIds: ["sector-20km", "sector-80km"], relationshipIds: ["brigade-logistics", "brigade-ew", "brigade-air-defence"], informationClassification: "operational" };
  const company = resolveParticipantOperationalContext(companyContext);
  const brigade = resolveParticipantOperationalContext(brigadeContext);
  const event: StormFireOperationalInformation = { id: "logistics-readiness-001", occurredAt: new Date().toISOString(), informationType: "LOGISTICS_READINESS_CHANGED", organizationId: "company-alpha", geographicScopeId: "sector-20km", relationshipId: "brigade-logistics", classification: "operational", payload: { assetId: "truck-17", readiness: "ready" } };
  const brigadeOnly: StormFireOperationalInformation = { id: "ew-event-001", occurredAt: event.occurredAt, informationType: "EW_EVENT", organizationId: "brigade-alpha", geographicScopeId: "sector-80km", relationshipId: "brigade-ew", classification: "operational", payload: { status: "observed" } };
  const companyCop = resolveStormFireDynamicCop(company, [event, brigadeOnly], event.occurredAt);
  const brigadeCop = resolveStormFireDynamicCop(brigade, [event, brigadeOnly], event.occurredAt);
  if (companyCop.information.length !== 1) throw new Error("Company COP should contain only the logistics event.");
  if (brigadeCop.information.length !== 2) throw new Error("Brigade COP should contain logistics and EW events.");
  return { companyCop, brigadeCop };
}

import type { InformationClassification } from "../contracts/stormFireContracts";
import type { StormFireLogisticsAssetReadiness } from "./logisticsReadiness";
import { publishSecuredLogisticsReadiness, type StormFireLogisticsRecipient } from "./logisticsSecuredEvents";

export interface StormFireLogisticsVisibilityMetadata { geographicScopeId: string; relationshipIds: string[]; classification?: InformationClassification; }

/** Adds explicit dissemination metadata before a logistics readiness event enters the secured fabric. */
export function publishLogisticsReadinessWithVisibility(asset: StormFireLogisticsAssetReadiness, metadata: StormFireLogisticsVisibilityMetadata, occurredAt: string, recipients: StormFireLogisticsRecipient[]) {
  const enrichedAsset = { ...asset, dissemination: { geographicScopeId: metadata.geographicScopeId, relationshipIds: [...metadata.relationshipIds], classification: metadata.classification } };
  const enrichedRecipients = recipients.map((recipient): StormFireLogisticsRecipient => ({ ...recipient, geographicScopeId: recipient.geographicScopeId || metadata.geographicScopeId, classification: recipient.classification || metadata.classification }));
  return publishSecuredLogisticsReadiness(enrichedAsset, occurredAt, enrichedRecipients);
}

import { stormFireEventBus, type StormFireEvent } from "./serviceEventBus";
import { stormFireParticipants } from "./participantModel";
import { stormFireRelationshipFabric } from "./relationshipFabric";

export type AlertPriority = "INFO" | "LOW" | "MEDIUM" | "WARNING" | "HIGH" | "CRITICAL";
export interface ParallelAlertPolicy { id: string; source: string; priority: AlertPriority; recipients: string[]; relationshipAxes: Array<"VERTICAL" | "HORIZONTAL" | "DIAGONAL">; enabled: boolean; }
export interface ParallelAlertResult { eventId: string; priority: AlertPriority; recipientIds: string[]; delivered: boolean; }
export interface StormFireParallelAlert { id: string; sourceParticipantId: string; title: string; message: string; priority: AlertPriority; recipientIds: string[]; createdAt: string; }

class ParallelAlertFabric {
  private readonly policies = new Map<string, ParallelAlertPolicy>();
  resolveRecipients(sourceParticipantId: string, informationType: string): string[] {
    return stormFireRelationshipFabric.forParticipant(sourceParticipantId).filter((relationship) => relationship.enabled && relationship.informationTypes.includes(informationType)).map((relationship) => relationship.sourceParticipantId === sourceParticipantId ? relationship.targetParticipantId : relationship.sourceParticipantId).filter((id, index, ids) => ids.indexOf(id) === index).filter((id) => stormFireParticipants.get(id)?.enabled);
  }
  registerPolicy(policy: ParallelAlertPolicy): void { this.policies.set(policy.id, { ...policy, recipients: [...policy.recipients], relationshipAxes: [...policy.relationshipAxes] }); }
  listPolicies(source?: string): ParallelAlertPolicy[] { return [...this.policies.values()].filter((policy) => !source || policy.source === source).map((policy) => ({ ...policy, recipients: [...policy.recipients], relationshipAxes: [...policy.relationshipAxes] })); }
  publish(input: Omit<StormFireParallelAlert, "id" | "createdAt">): StormFireParallelAlert {
    if (!stormFireParticipants.get(input.sourceParticipantId)) throw new Error("Alert source participant is not registered.");
    const recipients = input.recipientIds.filter((id) => stormFireParticipants.get(id)?.enabled);
    if (!recipients.length) throw new Error("Parallel alert has no enabled recipients.");
    const alert: StormFireParallelAlert = { ...input, recipientIds: [...new Set(recipients)], id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString() };
    stormFireEventBus.publish({ type: "ALERT", sourceService: input.sourceParticipantId, payload: { title: input.title, message: input.message, priority: input.priority, distributionMode: "PARALLEL", recipientCount: alert.recipientIds.length }, recipients: alert.recipientIds });
    return alert;
  }
  dispatch(event: StormFireEvent, priority: AlertPriority): ParallelAlertResult {
    const alert = this.publish({ sourceParticipantId: event.sourceService, title: "Service alert", message: typeof event.payload === "string" ? event.payload : "Service event requires operator review.", priority, recipientIds: event.recipients });
    return { eventId: event.id, priority, recipientIds: alert.recipientIds, delivered: alert.recipientIds.length > 0 };
  }
  publishToRelatedParticipants(input: Omit<StormFireParallelAlert, "id" | "createdAt" | "recipientIds"> & { informationType: string }): StormFireParallelAlert { return this.publish({ ...input, recipientIds: this.resolveRecipients(input.sourceParticipantId, input.informationType) }); }
}
export const stormFireParallelAlertFabric = new ParallelAlertFabric();
export const parallelAlertFabric = stormFireParallelAlertFabric;

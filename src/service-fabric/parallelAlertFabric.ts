import { stormFireEventBus } from "./serviceEventBus";
import { stormFireParticipants } from "./participantModel";
import { stormFireRelationshipFabric } from "./relationshipFabric";

export type AlertPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface StormFireParallelAlert {
  id: string;
  sourceParticipantId: string;
  title: string;
  message: string;
  priority: AlertPriority;
  recipientIds: string[];
  createdAt: string;
}

class ParallelAlertFabric {
  resolveRecipients(sourceParticipantId: string, informationType: string): string[] {
    const relationships = stormFireRelationshipFabric.forParticipant(sourceParticipantId);
    return relationships
      .filter((relationship) => relationship.enabled && relationship.informationTypes.includes(informationType))
      .map((relationship) => relationship.sourceParticipantId === sourceParticipantId ? relationship.targetParticipantId : relationship.sourceParticipantId)
      .filter((id, index, ids) => ids.indexOf(id) === index)
      .filter((id) => stormFireParticipants.get(id)?.enabled);
  }

  publish(input: Omit<StormFireParallelAlert, "id" | "createdAt">): StormFireParallelAlert {
    if (!stormFireParticipants.get(input.sourceParticipantId)) throw new Error("Alert source participant is not registered.");
    if (!input.recipientIds.length) throw new Error("Parallel alert requires at least one recipient.");

    const recipients = input.recipientIds.filter((id) => stormFireParticipants.get(id)?.enabled);
    if (!recipients.length) throw new Error("Parallel alert has no enabled recipients.");

    const alert: StormFireParallelAlert = {
      ...input,
      recipientIds: [...new Set(recipients)],
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };

    stormFireEventBus.publish({
      type: "ALERT",
      sourceService: input.sourceParticipantId,
      payload: {
        title: input.title,
        message: input.message,
        priority: input.priority,
        distributionMode: "PARALLEL",
        recipientCount: alert.recipientIds.length,
      },
      recipients: alert.recipientIds,
    });

    return alert;
  }

  publishToRelatedParticipants(input: Omit<StormFireParallelAlert, "id" | "createdAt" | "recipientIds"> & { informationType: string }): StormFireParallelAlert {
    const recipientIds = this.resolveRecipients(input.sourceParticipantId, input.informationType);
    return this.publish({ ...input, recipientIds });
  }
}

export const stormFireParallelAlertFabric = new ParallelAlertFabric();

import { stormFireEventBus } from "./serviceEventBus";

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
  publish(input: Omit<StormFireParallelAlert, "id" | "createdAt">): StormFireParallelAlert {
    if (!input.recipientIds.length) throw new Error("Parallel alert requires at least one recipient.");
    const alert: StormFireParallelAlert = {
      ...input,
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
        recipientCount: input.recipientIds.length,
      },
      recipients: input.recipientIds,
    });

    return alert;
  }
}

export const stormFireParallelAlertFabric = new ParallelAlertFabric();

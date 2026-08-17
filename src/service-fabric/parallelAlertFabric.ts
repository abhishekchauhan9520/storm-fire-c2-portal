import type { StormFireEvent } from "./serviceEventBus";
import { stormFireEventBus } from "./serviceEventBus";
import { stormFireRelationshipEngine } from "./relationshipEngine";

export type AlertPriority = "INFO" | "WARNING" | "CRITICAL";

export interface ParallelAlertPolicy {
  id: string;
  source: string;
  priority: AlertPriority;
  recipients: string[];
  relationshipAxes?: Array<"VERTICAL" | "HORIZONTAL" | "DIAGONAL">;
  enabled: boolean;
}

export interface AlertDelivery {
  alertId: string;
  recipient: string;
  priority: AlertPriority;
  deliveredAt: string;
  status: "DELIVERED" | "SKIPPED";
}

export interface ParallelAlertResult {
  alertId: string;
  source: string;
  priority: AlertPriority;
  deliveries: AlertDelivery[];
}

/**
 * Parallel alert distribution for the shared information environment.
 * This is a delivery/orchestration layer; it does not perform operational
 * action or weapon/fire-control decisions.
 */
export class ParallelAlertFabric {
  private policies = new Map<string, ParallelAlertPolicy>();

  registerPolicy(policy: ParallelAlertPolicy): void {
    if (!policy.id || !policy.source || policy.recipients.length === 0) {
      throw new Error("Alert policy requires an id, source, and at least one recipient.");
    }
    this.policies.set(policy.id, policy);
  }

  removePolicy(id: string): boolean {
    return this.policies.delete(id);
  }

  listPolicies(): ParallelAlertPolicy[] {
    return [...this.policies.values()];
  }

  dispatch(event: StormFireEvent, priority: AlertPriority): ParallelAlertResult {
    const alertId = `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const matchingPolicies = [...this.policies.values()].filter(
      (policy) => policy.enabled && policy.source === event.sourceService && policy.priority === priority,
    );

    const recipients = new Set<string>();
    matchingPolicies.forEach((policy) => policy.recipients.forEach((recipient) => recipients.add(recipient)));

    // Optional relationship expansion: a policy can include participants connected
    // through one or more approved relationship axes.
    matchingPolicies.forEach((policy) => {
      (policy.relationshipAxes ?? []).forEach((axis) => {
        stormFireRelationshipEngine.query({ axis, activeOnly: true }).forEach((relationship) => {
          recipients.add(relationship.from === event.sourceService ? relationship.to : relationship.from);
        });
      });
    });

    const deliveries: AlertDelivery[] = [...recipients].map((recipient) => ({
      alertId,
      recipient,
      priority,
      deliveredAt: new Date().toISOString(),
      status: "DELIVERED",
    }));

    // The alert remains an event in the shared spine so other subscribed
    // application components can observe the same alert independently.
    stormFireEventBus.publish({
      type: "ALERT",
      sourceService: event.sourceService,
      payload: { alertId, priority, originalEventId: event.id },
      recipients: deliveries.map((delivery) => delivery.recipient),
    });

    return { alertId, source: event.sourceService, priority, deliveries };
  }
}

export const parallelAlertFabric = new ParallelAlertFabric();

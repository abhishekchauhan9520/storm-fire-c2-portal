import type { ServiceLifecycleState } from "./serviceLifecycle";

export type ServiceAuditEventType =
  | "DISCOVERY"
  | "COMPATIBILITY"
  | "LIFECYCLE"
  | "AUTHORIZATION"
  | "ADAPTER"
  | "RELATIONSHIP"
  | "INFORMATION"
  | "ALERT"
  | "ERROR";

export interface ServiceAuditEvent {
  id: string;
  timestamp: string;
  serviceId: string;
  type: ServiceAuditEventType;
  action: string;
  state?: ServiceLifecycleState;
  success: boolean;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface ServiceHealthSnapshot {
  serviceId: string;
  state?: ServiceLifecycleState;
  compatible: boolean;
  eventCount: number;
  lastEventAt?: string;
  lastErrorAt?: string;
  healthy: boolean;
}

export class StormFireServiceObservability {
  private events: ServiceAuditEvent[] = [];

  record(input: Omit<ServiceAuditEvent, "id" | "timestamp">): ServiceAuditEvent {
    const event: ServiceAuditEvent = {
      ...input,
      id: `svc-audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
    };
    this.events.unshift(event);
    if (this.events.length > 5000) this.events.length = 5000;
    return event;
  }

  list(serviceId?: string, limit = 100): ServiceAuditEvent[] {
    const filtered = serviceId ? this.events.filter((event) => event.serviceId === serviceId) : this.events;
    return filtered.slice(0, Math.max(1, limit));
  }

  health(serviceId: string, state?: ServiceLifecycleState, compatible = true): ServiceHealthSnapshot {
    const events = this.events.filter((event) => event.serviceId === serviceId);
    const lastError = events.find((event) => event.type === "ERROR" || !event.success);
    return {
      serviceId,
      state,
      compatible,
      eventCount: events.length,
      lastEventAt: events[0]?.timestamp,
      lastErrorAt: lastError?.timestamp,
      healthy: compatible && state !== "QUARANTINED" && state !== "DISABLED" && !lastError,
    };
  }
}

export const stormFireServiceObservability = new StormFireServiceObservability();

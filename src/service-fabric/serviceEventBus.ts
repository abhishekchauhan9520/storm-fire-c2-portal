export type StormFireEventType = "SERVICE_EVENT" | "CONTEXT_UPDATE" | "ALERT" | "TASK" | "ASSESSMENT";

export interface StormFireEvent<T = unknown> {
  id: string;
  type: StormFireEventType;
  sourceService: string;
  timestamp: string;
  payload: T;
  correlationId: string;
  recipients: string[];
}

type EventHandler = (event: StormFireEvent) => void;

function makeId(prefix: string): string {
  const cryptoApi = globalThis.crypto as Crypto | undefined;
  return cryptoApi?.randomUUID ? `${prefix}-${cryptoApi.randomUUID()}` : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export class StormFireEventBus {
  private handlers = new Set<EventHandler>();
  subscribe(handler: EventHandler): () => void { this.handlers.add(handler); return () => this.handlers.delete(handler); }
  publish<T>(event: Omit<StormFireEvent<T>, "id" | "timestamp" | "correlationId">): StormFireEvent<T> {
    const complete: StormFireEvent<T> = { ...event, id: makeId("evt"), timestamp: new Date().toISOString(), correlationId: makeId("corr") };
    this.handlers.forEach((handler) => handler(complete));
    return complete;
  }
}

export const stormFireEventBus = new StormFireEventBus();

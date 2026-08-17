export interface ParticipantStreamEvent {
  type: string;
  eventId: string;
  participantId: string;
  correlationId?: string;
  payload?: unknown;
}

type Listener = (event: ParticipantStreamEvent) => void;

/**
 * Lightweight participant-scoped realtime boundary. Transport is intentionally
 * separate from the Event Spine so SSE/WebSocket can be replaced later.
 */
export class ParticipantEventStream {
  private readonly listeners = new Map<string, Set<Listener>>();

  subscribe(participantId: string, listener: Listener): () => void {
    if (!participantId) throw new Error("Participant stream requires a participant id.");
    const listeners = this.listeners.get(participantId) ?? new Set<Listener>();
    listeners.add(listener);
    this.listeners.set(participantId, listeners);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) this.listeners.delete(participantId);
    };
  }

  publish(event: ParticipantStreamEvent): void {
    for (const listener of this.listeners.get(event.participantId) ?? []) listener(event);
  }

  listenerCount(participantId?: string): number {
    if (participantId) return this.listeners.get(participantId)?.size ?? 0;
    let count = 0;
    for (const listeners of this.listeners.values()) count += listeners.size;
    return count;
  }
}

export const stormFireParticipantEventStream = new ParticipantEventStream();

export type StormFireParticipantKind = "OPERATOR" | "UNIT" | "SERVICE" | "SENSOR" | "SYSTEM" | "APPLICATION";

export interface StormFireParticipant {
  id: string;
  name: string;
  kind: StormFireParticipantKind;
  canProduce: boolean;
  canConsume: boolean;
  enabled: boolean;
  metadata?: Record<string, string>;
}

class ParticipantRegistry {
  private participants = new Map<string, StormFireParticipant>();

  register(participant: StormFireParticipant): StormFireParticipant {
    if (!participant.id || !participant.name) throw new Error("Participant requires id and name.");
    if (!participant.canProduce && !participant.canConsume) throw new Error("Participant must be a source, consumer, or both.");
    this.participants.set(participant.id, participant);
    return participant;
  }

  get(id: string): StormFireParticipant | undefined { return this.participants.get(id); }
  list(): StormFireParticipant[] { return Array.from(this.participants.values()); }
  remove(id: string): boolean { return this.participants.delete(id); }
}

export const stormFireParticipants = new ParticipantRegistry();

// Baseline participants used by the information-centric demo/runtime.
stormFireParticipants.register({ id: "operator-command", name: "Command Operator", kind: "OPERATOR", canProduce: true, canConsume: true, enabled: true });
stormFireParticipants.register({ id: "operator-intel", name: "Intelligence Operator", kind: "OPERATOR", canProduce: true, canConsume: true, enabled: true });
stormFireParticipants.register({ id: "uav-service", name: "UAV Service", kind: "SERVICE", canProduce: true, canConsume: true, enabled: true });
stormFireParticipants.register({ id: "logistics-service", name: "Logistics Service", kind: "SERVICE", canProduce: true, canConsume: true, enabled: true });

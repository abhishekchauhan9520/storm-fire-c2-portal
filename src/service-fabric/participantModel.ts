import type { Participant, ParticipantKind, ParticipantStatus } from "../contracts/stormFireContracts";

export type StormFireParticipantKind = ParticipantKind;
export type StormFireParticipant = Participant;

class ParticipantRegistry {
  private participants = new Map<string, Participant>();

  register(participant: Participant): Participant {
    if (!participant.id || !participant.name) throw new Error("Participant requires id and name.");
    if (!participant.canProduce && !participant.canConsume) throw new Error("Participant must be a source, consumer, or both.");
    if (this.participants.has(participant.id)) throw new Error(`Participant ${participant.id} is already registered.`);
    const normalized = this.clone(participant);
    this.participants.set(participant.id, normalized);
    return this.clone(normalized);
  }

  update(id: string, patch: Partial<Participant>): Participant {
    const current = this.require(id);
    const next = this.clone({ ...current, ...patch, id: current.id });
    if (!next.canProduce && !next.canConsume) throw new Error("Participant must remain a producer, consumer, or both.");
    this.participants.set(id, next);
    return this.clone(next);
  }

  setStatus(id: string, status: ParticipantStatus): boolean {
    const current = this.participants.get(id);
    if (!current) return false;
    current.status = status;
    return true;
  }

  get(id: string): Participant | undefined {
    const participant = this.participants.get(id);
    return participant ? this.clone(participant) : undefined;
  }

  list(): Participant[] { return [...this.participants.values()].map((participant) => this.clone(participant)); }
  remove(id: string): boolean { return this.participants.delete(id); }
  clear(): void { this.participants.clear(); }

  private require(id: string): Participant {
    const participant = this.participants.get(id);
    if (!participant) throw new Error(`Participant ${id} was not found.`);
    return participant;
  }

  private clone(participant: Participant): Participant {
    return {
      ...participant,
      organizationIds: [...participant.organizationIds],
      roleIds: [...participant.roleIds],
      serviceIds: [...participant.serviceIds],
      geographicScopeIds: [...participant.geographicScopeIds],
      informationRelationshipIds: [...participant.informationRelationshipIds],
      workspaceIds: [...participant.workspaceIds],
      ...(participant.metadata ? { metadata: { ...participant.metadata } } : {}),
    };
  }
}

export const stormFireParticipants = new ParticipantRegistry();

// Baseline participants used by the information-centric runtime.
const baselineParticipants: Participant[] = [
  { id: "operator-command", name: "Command Operator", kind: "OPERATOR", status: "ONLINE", canProduce: true, canConsume: true, enabled: true, organizationIds: [], roleIds: ["COMMAND"], serviceIds: [], geographicScopeIds: [], informationRelationshipIds: [], workspaceIds: [] },
  { id: "operator-intel", name: "Intelligence Operator", kind: "OPERATOR", status: "ONLINE", canProduce: true, canConsume: true, enabled: true, organizationIds: [], roleIds: ["INTELLIGENCE"], serviceIds: [], geographicScopeIds: [], informationRelationshipIds: [], workspaceIds: [] },
  { id: "uav-service", name: "UAV Service", kind: "SERVICE", status: "ONLINE", canProduce: true, canConsume: true, enabled: true, organizationIds: [], roleIds: [], serviceIds: ["uav"], geographicScopeIds: [], informationRelationshipIds: [], workspaceIds: [] },
  { id: "logistics-service", name: "Logistics Service", kind: "SERVICE", status: "ONLINE", canProduce: true, canConsume: true, enabled: true, organizationIds: [], roleIds: [], serviceIds: ["logistics"], geographicScopeIds: [], informationRelationshipIds: [], workspaceIds: [] },
];

for (const participant of baselineParticipants) stormFireParticipants.register(participant);

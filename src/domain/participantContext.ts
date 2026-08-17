import { stormFireOrganizationGraph, type StormFireParticipantContext } from "./organizationGraph";
import { stormFireParticipants } from "../service-fabric/participantModel";
import { stormFireServiceFabric } from "../service-fabric/serviceFabric";

export interface ParticipantAssignment {
  participantId: string;
  organizationIds: string[];
  roleIds: string[];
  geographicScopeIds: string[];
  informationRelationshipIds: string[];
  workspaceIds: string[];
}

export class ParticipantContextRegistry {
  private assignments = new Map<string, ParticipantAssignment>();

  assign(assignment: ParticipantAssignment): StormFireParticipantContext {
    if (!stormFireParticipants.get(assignment.participantId)) throw new Error(`Participant ${assignment.participantId} is not registered.`);
    for (const organizationId of assignment.organizationIds) {
      if (!stormFireOrganizationGraph.get(organizationId)) throw new Error(`Organization ${organizationId} was not found.`);
    }
    for (const serviceId of this.serviceIdsFor(assignment)) {
      if (!stormFireServiceFabric.get(serviceId)) throw new Error(`Service ${serviceId} is not registered.`);
    }
    this.assignments.set(assignment.participantId, {
      ...assignment,
      organizationIds: [...assignment.organizationIds], roleIds: [...assignment.roleIds],
      geographicScopeIds: [...assignment.geographicScopeIds], informationRelationshipIds: [...assignment.informationRelationshipIds], workspaceIds: [...assignment.workspaceIds],
    });
    return this.resolve(assignment.participantId)!;
  }

  getAssignment(participantId: string): ParticipantAssignment | undefined {
    const assignment = this.assignments.get(participantId);
    return assignment ? { ...assignment, organizationIds: [...assignment.organizationIds], roleIds: [...assignment.roleIds], geographicScopeIds: [...assignment.geographicScopeIds], informationRelationshipIds: [...assignment.informationRelationshipIds], workspaceIds: [...assignment.workspaceIds] } : undefined;
  }

  resolve(participantId: string): StormFireParticipantContext | undefined {
    const assignment = this.assignments.get(participantId);
    const participant = stormFireParticipants.get(participantId);
    if (!assignment || !participant) return undefined;
    return { participantId, organizationIds: [...assignment.organizationIds], roleIds: [...assignment.roleIds], serviceIds: this.serviceIdsFor(assignment), geographicScopeIds: [...assignment.geographicScopeIds], informationRelationshipIds: [...assignment.informationRelationshipIds], workspaceIds: [...assignment.workspaceIds] };
  }

  effectiveOrganizations(participantId: string): ReturnType<typeof stormFireOrganizationGraph.list> {
    const context = this.resolve(participantId); if (!context) return [];
    const nodes = new Map<string, ReturnType<typeof stormFireOrganizationGraph.list>[number]>();
    for (const id of context.organizationIds) {
      const node = stormFireOrganizationGraph.get(id); if (!node) continue;
      nodes.set(node.id, node);
      for (const ancestor of stormFireOrganizationGraph.ancestorsOf(id)) nodes.set(ancestor.id, ancestor);
    }
    return [...nodes.values()];
  }

  clear(): void { this.assignments.clear(); }
  private serviceIdsFor(assignment: ParticipantAssignment): string[] {
    const ids = new Set<string>();
    for (const organizationId of assignment.organizationIds) {
      const node = stormFireOrganizationGraph.get(organizationId);
      for (const serviceId of node?.serviceIds ?? []) ids.add(serviceId);
    }
    return [...ids];
  }
}

export const stormFireParticipantContexts = new ParticipantContextRegistry();

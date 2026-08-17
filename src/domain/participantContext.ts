import type { ParticipantContext } from "../contracts/stormFireContracts";
import { stormFireOrganizationGraph } from "./organizationGraph";
import { stormFireParticipants } from "../service-fabric/participantModel";
import { stormFireServiceFabric } from "../service-fabric/serviceFabric";

export interface ParticipantAssignment {
  participantId: string;
  organizationIds: string[];
  roleIds: string[];
  serviceIds?: string[];
  geographicScopeIds: string[];
  informationRelationshipIds: string[];
  subscriptionIds?: string[];
  workspaceIds: string[];
  policyIds?: string[];
}

/** Resolves the participant-specific operational environment from canonical state. */
export class ParticipantContextRegistry {
  private assignments = new Map<string, ParticipantAssignment>();

  assign(assignment: ParticipantAssignment): ParticipantContext {
    if (!stormFireParticipants.get(assignment.participantId)) throw new Error(`Participant ${assignment.participantId} is not registered.`);
    for (const organizationId of assignment.organizationIds) {
      if (!stormFireOrganizationGraph.get(organizationId)) throw new Error(`Organization ${organizationId} was not found.`);
    }
    for (const serviceId of this.serviceIdsFor(assignment)) {
      if (!stormFireServiceFabric.get(serviceId)) throw new Error(`Service ${serviceId} is not registered.`);
    }
    const normalized: ParticipantAssignment = {
      ...assignment,
      organizationIds: [...assignment.organizationIds],
      roleIds: [...assignment.roleIds],
      serviceIds: [...(assignment.serviceIds ?? [])],
      geographicScopeIds: [...assignment.geographicScopeIds],
      informationRelationshipIds: [...assignment.informationRelationshipIds],
      subscriptionIds: [...(assignment.subscriptionIds ?? [])],
      workspaceIds: [...assignment.workspaceIds],
      policyIds: [...(assignment.policyIds ?? [])],
    };
    this.assignments.set(assignment.participantId, normalized);
    return this.resolve(assignment.participantId)!;
  }

  getAssignment(participantId: string): ParticipantAssignment | undefined {
    const assignment = this.assignments.get(participantId);
    return assignment ? this.cloneAssignment(assignment) : undefined;
  }

  resolve(participantId: string): ParticipantContext | undefined {
    const assignment = this.assignments.get(participantId);
    const participant = stormFireParticipants.get(participantId);
    if (!assignment || !participant) return undefined;
    return {
      participantId,
      organizationIds: [...assignment.organizationIds],
      roleIds: [...assignment.roleIds],
      serviceIds: this.serviceIdsFor(assignment),
      geographicScopeIds: [...assignment.geographicScopeIds],
      informationRelationshipIds: [...assignment.informationRelationshipIds],
      subscriptionIds: [...(assignment.subscriptionIds ?? [])],
      workspaceIds: [...assignment.workspaceIds],
      policyIds: [...(assignment.policyIds ?? [])],
      resolvedAt: new Date().toISOString(),
    };
  }

  effectiveOrganizations(participantId: string): ReturnType<typeof stormFireOrganizationGraph.list> {
    const context = this.resolve(participantId);
    if (!context) return [];
    const nodes = new Map<string, ReturnType<typeof stormFireOrganizationGraph.list>[number]>();
    for (const id of context.organizationIds) {
      const node = stormFireOrganizationGraph.get(id);
      if (!node) continue;
      nodes.set(node.id, node);
      for (const ancestor of stormFireOrganizationGraph.ancestorsOf(id)) nodes.set(ancestor.id, ancestor);
    }
    return [...nodes.values()];
  }

  clear(): void { this.assignments.clear(); }

  private serviceIdsFor(assignment: ParticipantAssignment): string[] {
    const ids = new Set(assignment.serviceIds ?? []);
    for (const organizationId of assignment.organizationIds) {
      const node = stormFireOrganizationGraph.get(organizationId);
      for (const serviceId of node?.serviceIds ?? []) ids.add(serviceId);
    }
    return [...ids];
  }

  private cloneAssignment(assignment: ParticipantAssignment): ParticipantAssignment {
    return {
      ...assignment,
      organizationIds: [...assignment.organizationIds],
      roleIds: [...assignment.roleIds],
      serviceIds: [...(assignment.serviceIds ?? [])],
      geographicScopeIds: [...assignment.geographicScopeIds],
      informationRelationshipIds: [...assignment.informationRelationshipIds],
      subscriptionIds: [...(assignment.subscriptionIds ?? [])],
      workspaceIds: [...assignment.workspaceIds],
      policyIds: [...(assignment.policyIds ?? [])],
    };
  }
}

export const stormFireParticipantContexts = new ParticipantContextRegistry();

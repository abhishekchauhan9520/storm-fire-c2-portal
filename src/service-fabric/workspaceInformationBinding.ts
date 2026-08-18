import type { CanonicalInformationRecord } from "./informationAdapter";
import { canonicalEnvelopeToRecord } from "./informationAdapter";
import { stormFireInformationFabric } from "../domain/informationFabric";
import { stormFireDisplayFabric } from "./displayFabric";
import { stormFireWorkspaceFabric } from "./workspaceFabric";

export interface WorkspaceInformationDelivery {
  workspaceId: string;
  surfaceId: string;
  informationId: string;
  participantId: string;
  deliveredAt: string;
}

/** Connects workspace surfaces directly to the canonical Information Fabric. */
export class WorkspaceInformationBinding {
  private deliveries = new Map<string, WorkspaceInformationDelivery>();
  private unsubscribers = new Map<string, () => void>();

  bindWorkspace(workspaceId: string): () => void {
    this.unbindWorkspace(workspaceId);
    const workspace = stormFireWorkspaceFabric.getWorkspace(workspaceId);
    if (!workspace) throw new Error(`Workspace ${workspaceId} was not found.`);
    const subscriptionId = `workspace-information-${workspaceId}`;
    stormFireInformationFabric.subscribe({
      id: subscriptionId,
      participantId: workspace.participantId,
      informationTypes: this.workspaceInformationTypes(workspaceId),
      enabled: true,
      handler: (message) => this.route(workspaceId, canonicalEnvelopeToRecord(message)),
    });
    const unsubscribe = () => stormFireInformationFabric.unsubscribe(subscriptionId);
    this.unsubscribers.set(workspaceId, unsubscribe);
    return () => this.unbindWorkspace(workspaceId);
  }

  private workspaceInformationTypes(workspaceId: string): string[] {
    const types = new Set<string>();
    for (const surface of stormFireWorkspaceFabric.surfacesFor(workspaceId)) for (const type of surface.informationTypes) types.add(type);
    return [...types];
  }

  private route(workspaceId: string, record: CanonicalInformationRecord): void {
    const workspace = stormFireWorkspaceFabric.getWorkspace(workspaceId);
    if (!workspace) return;
    for (const placement of workspace.surfaces.filter((item) => item.visible)) {
      const surface = stormFireDisplayFabric.getSurface(placement.surfaceId);
      if (!surface || !surface.informationTypes.includes(record.kind)) continue;
      const binding = stormFireDisplayFabric.bind(surface.id, record);
      if (!binding) continue;
      this.deliveries.set(`${workspaceId}:${surface.id}:${record.id}`, { workspaceId, surfaceId: surface.id, informationId: record.id, participantId: workspace.participantId, deliveredAt: binding.boundAt });
    }
  }

  deliveriesFor(workspaceId?: string): WorkspaceInformationDelivery[] { return [...this.deliveries.values()].filter((delivery) => !workspaceId || delivery.workspaceId === workspaceId); }
  unbindWorkspace(workspaceId: string): void { this.unsubscribers.get(workspaceId)?.(); this.unsubscribers.delete(workspaceId); }
  clear(): void { for (const workspaceId of [...this.unsubscribers.keys()]) this.unbindWorkspace(workspaceId); this.deliveries.clear(); }
}

export const stormFireWorkspaceInformationBinding = new WorkspaceInformationBinding();

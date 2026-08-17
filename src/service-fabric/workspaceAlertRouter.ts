import type { CanonicalInformationRecord } from "./informationAdapter";
import { stormFireInformationFabric } from "./informationFabricBridge";
import { stormFireWorkspaceFabric } from "./workspaceFabric";
import { stormFireDisplayFabric } from "./displayFabric";

export interface WorkspaceAlertDelivery { workspaceId: string; participantId: string; surfaceIds: string[]; informationId: string; informationKind: string; deliveredAt: string; }

/** Routes alert-like canonical information to all matching visible surfaces in parallel. */
export class WorkspaceAlertRouter {
  private deliveries: WorkspaceAlertDelivery[] = [];
  private unsubscribe?: () => void;
  start(): void { this.stop(); this.unsubscribe = stormFireInformationFabric.subscribe((records) => { for (const record of records) this.route(record); }); }
  private route(record: CanonicalInformationRecord): void {
    if (!this.isAlertLike(record)) return;
    for (const workspace of stormFireWorkspaceFabric.listWorkspaces().filter((item) => item.active)) {
      if (!stormFireInformationFabric.isAuthorizedConsumer(record, workspace.participantId)) continue;
      const surfaceIds = workspace.surfaces.filter((placement) => placement.visible).map((placement) => placement.surfaceId).filter((surfaceId) => { const surface = stormFireDisplayFabric.getSurface(surfaceId); return !!surface && surface.informationTypes.includes(record.kind); });
      if (!surfaceIds.length) continue;
      for (const surfaceId of surfaceIds) stormFireDisplayFabric.bind(surfaceId, record);
      this.deliveries.push({ workspaceId: workspace.id, participantId: workspace.participantId, surfaceIds, informationId: record.id, informationKind: record.kind, deliveredAt: new Date().toISOString() });
    }
  }
  private isAlertLike(record: CanonicalInformationRecord): boolean { return record.kind === "ALERT" || record.kind === "EVENT" || record.severity === "CRITICAL" || record.severity === "HIGH"; }
  history(workspaceId?: string): WorkspaceAlertDelivery[] { return this.deliveries.filter((item) => !workspaceId || item.workspaceId === workspaceId).map((item) => ({ ...item, surfaceIds: [...item.surfaceIds] })); }
  clear(): void { this.deliveries = []; }
  stop(): void { this.unsubscribe?.(); this.unsubscribe = undefined; }
}

export const stormFireWorkspaceAlertRouter = new WorkspaceAlertRouter();

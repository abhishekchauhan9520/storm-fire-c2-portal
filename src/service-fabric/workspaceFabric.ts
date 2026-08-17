import type { DisplaySurface } from "./displayFabric";
import { stormFireDisplayFabric } from "./displayFabric";

export interface WorkspaceSurfacePlacement { surfaceId: string; order: number; region?: string; visible: boolean; }
export interface OperationalWorkspace { id: string; name: string; participantId: string; surfaces: WorkspaceSurfacePlacement[]; active: boolean; }

/** Workspace composition boundary. Workspaces arrange display consumers; they do not own canonical information. */
export class WorkspaceFabric {
  private workspaces = new Map<string, OperationalWorkspace>();
  registerWorkspace(workspace: OperationalWorkspace): OperationalWorkspace { const normalized = { ...workspace, surfaces: [...workspace.surfaces] }; this.workspaces.set(workspace.id, normalized); return this.getWorkspace(workspace.id)!; }
  getWorkspace(workspaceId: string): OperationalWorkspace | undefined { const workspace = this.workspaces.get(workspaceId); return workspace ? { ...workspace, surfaces: [...workspace.surfaces] } : undefined; }
  listWorkspaces(): OperationalWorkspace[] { return Array.from(this.workspaces.values()).map((workspace) => ({ ...workspace, surfaces: [...workspace.surfaces] })); }
  addSurface(workspaceId: string, placement: WorkspaceSurfacePlacement): boolean { const workspace = this.workspaces.get(workspaceId); if (!workspace || !workspace.active || !stormFireDisplayFabric.getSurface(placement.surfaceId)) return false; if (workspace.surfaces.some((item) => item.surfaceId === placement.surfaceId)) return false; workspace.surfaces.push({ ...placement }); return true; }
  removeSurface(workspaceId: string, surfaceId: string): boolean { const workspace = this.workspaces.get(workspaceId); if (!workspace) return false; const before = workspace.surfaces.length; workspace.surfaces = workspace.surfaces.filter((item) => item.surfaceId !== surfaceId); return workspace.surfaces.length !== before; }
  surfacesFor(workspaceId: string): DisplaySurface[] { const workspace = this.workspaces.get(workspaceId); if (!workspace) return []; return workspace.surfaces.filter((placement) => placement.visible).sort((a, b) => a.order - b.order).map((placement) => stormFireDisplayFabric.getSurface(placement.surfaceId)).filter((surface): surface is DisplaySurface => Boolean(surface)); }
  clear(): void { this.workspaces.clear(); }
}

export const stormFireWorkspaceFabric = new WorkspaceFabric();

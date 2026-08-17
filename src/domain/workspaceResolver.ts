import { stormFireServiceRegistry, type StormFireParticipantServiceContext } from "./serviceRegistry";
export interface StormFireWorkspaceDescriptor { serviceId: string; workspaceKey: string; name: string; informationTypes: string[]; }
/** Resolves participant service surfaces without hard-coding rank-specific COP layouts. */
export function resolveParticipantWorkspaces(context: StormFireParticipantServiceContext): StormFireWorkspaceDescriptor[] { return stormFireServiceRegistry.resolveForParticipant(context).map(service => ({ serviceId: service.id, workspaceKey: service.workspaceKey, name: service.name, informationTypes: [...service.informationTypes] })); }

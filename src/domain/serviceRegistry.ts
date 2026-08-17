export interface StormFireServiceDefinition { id: string; name: string; description: string; enabled: boolean; informationTypes: string[]; requiredCapabilities: string[]; workspaceKey: string; }
export interface StormFireParticipantServiceContext { participantId: string; serviceIds: string[]; capabilities: string[]; }

export class StormFireServiceRegistry {
  private readonly services = new Map<string, StormFireServiceDefinition>();
  register(service: StormFireServiceDefinition): void { if (!service.id) throw new Error("Service requires an id."); if (this.services.has(service.id)) throw new Error(`Service ${service.id} already exists.`); this.services.set(service.id, { ...service, informationTypes: [...service.informationTypes], requiredCapabilities: [...service.requiredCapabilities] }); }
  get(id: string): StormFireServiceDefinition | undefined { const service = this.services.get(id); return service ? this.clone(service) : undefined; }
  listEnabled(): StormFireServiceDefinition[] { return [...this.services.values()].filter(s => s.enabled).map(s => this.clone(s)); }
  resolveForParticipant(context: StormFireParticipantServiceContext): StormFireServiceDefinition[] { return context.serviceIds.map(id => this.services.get(id)).filter((s): s is StormFireServiceDefinition => Boolean(s && s.enabled)).filter(s => s.requiredCapabilities.every(c => context.capabilities.includes(c))).map(s => this.clone(s)); }
  private clone(s: StormFireServiceDefinition): StormFireServiceDefinition { return { ...s, informationTypes: [...s.informationTypes], requiredCapabilities: [...s.requiredCapabilities] }; }
}

export const stormFireServiceRegistry = new StormFireServiceRegistry();

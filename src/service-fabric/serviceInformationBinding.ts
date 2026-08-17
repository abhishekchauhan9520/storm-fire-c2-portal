import type { CanonicalInformationRecord } from "./informationAdapter";
import { stormFireInformationFabric } from "./informationFabricBridge";
import { stormFireServiceFabric, type StormFireServiceManifest } from "./serviceFabric";

export interface ServiceInformationDelivery { serviceId: string; participantId: string; informationId: string; informationKind: string; direction: "PRODUCED" | "CONSUMED"; deliveredAt: string; }

/** Transitional binding between legacy service surfaces and the shared Information Fabric. */
export class ServiceInformationBinding {
  private subscriptions = new Map<string, () => void>();
  private deliveries: ServiceInformationDelivery[] = [];
  bind(serviceId: string): () => void {
    this.unbind(serviceId);
    const service = this.requireActive(serviceId);
    const unsubscribe = stormFireInformationFabric.subscribeParticipant(service.ownerParticipantId, service.informationTypesConsumed, (record) => this.recordConsumed(service, record));
    this.subscriptions.set(serviceId, unsubscribe);
    return () => this.unbind(serviceId);
  }
  recordProduced(serviceId: string, record: CanonicalInformationRecord): ServiceInformationDelivery | undefined {
    const service = stormFireServiceFabric.get(serviceId);
    if (!service || service.status !== "ACTIVE" || !service.informationTypesProduced.includes(record.kind)) return undefined;
    const delivery: ServiceInformationDelivery = { serviceId, participantId: service.ownerParticipantId, informationId: record.id, informationKind: record.kind, direction: "PRODUCED", deliveredAt: new Date().toISOString() };
    this.deliveries.push(delivery); return { ...delivery };
  }
  list(serviceId?: string): ServiceInformationDelivery[] { return this.deliveries.filter((item) => !serviceId || item.serviceId === serviceId).map((item) => ({ ...item })); }
  unbind(serviceId: string): void { this.subscriptions.get(serviceId)?.(); this.subscriptions.delete(serviceId); }
  clear(): void { for (const serviceId of [...this.subscriptions.keys()]) this.unbind(serviceId); this.deliveries = []; }
  private recordConsumed(service: StormFireServiceManifest, record: CanonicalInformationRecord): void { if (!service.informationTypesConsumed.includes(record.kind)) return; this.deliveries.push({ serviceId: service.id, participantId: service.ownerParticipantId, informationId: record.id, informationKind: record.kind, direction: "CONSUMED", deliveredAt: new Date().toISOString() }); }
  private requireActive(serviceId: string): StormFireServiceManifest { const service = stormFireServiceFabric.get(serviceId); if (!service || service.status !== "ACTIVE") throw new Error(`Active service ${serviceId} was not found.`); return service; }
}
export const stormFireServiceInformationBinding = new ServiceInformationBinding();

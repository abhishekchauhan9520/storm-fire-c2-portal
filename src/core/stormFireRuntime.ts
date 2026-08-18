import type { Event, InformationObject, Participant, Service, Workspace } from "../contracts/stormFireContracts";
import { stormFireOrganizationGraph } from "../domain/organizationGraph";
import { stormFireParticipantContexts } from "../domain/participantContext";
import { InformationFabric, stormFireInformationFabric } from "../domain/informationFabric";
import { stormFireParticipants } from "../service-fabric/participantModel";
import { stormFireServiceFabric } from "../service-fabric/serviceFabric";
import { stormFireEventSpine } from "../platform/event-spine/eventSpine";
import type { CanonicalOperationalObject, InformationEvent, InformationRelationship, OperationalAlert } from "../types";

export interface StormFireRuntimeState {
  participants: Participant[];
  relationships: InformationRelationship[];
  objects: CanonicalOperationalObject[];
  events: InformationEvent[];
  alerts: OperationalAlert[];
  services: Service[];
  workspaces: Workspace[];
}

/** Runtime composition root; public state is a projection, not authoritative storage. */
export function createStormFireRuntime(
  initial: Partial<StormFireRuntimeState> = {},
  informationFabric: InformationFabric = new InformationFabric(),
) {
  const events: Event[] = [];
  const relationships = [...(initial.relationships ?? [])];
  const workspaces = [...(initial.workspaces ?? [])];
  let sequence = 0;

  for (const participant of initial.participants ?? []) if (!stormFireParticipants.get(participant.id)) stormFireParticipants.register(participant);
  for (const service of initial.services ?? []) if (!stormFireServiceFabric.get(service.id)) stormFireServiceFabric.register(service);

  const projectObject = (object: InformationObject): CanonicalOperationalObject => ({
    id: object.id,
    kind: object.type,
    version: object.version,
    timestamp: object.occurredAt,
    sourceParticipantId: object.producerParticipantId ?? object.producerServiceId ?? "unknown",
    domains: ["JOINT"],
    classification: object.classification,
    confidence: object.provenance.confidence ?? 0,
    attributes: typeof object.payload === "object" && object.payload !== null ? object.payload as Record<string, unknown> : { value: object.payload },
  });

  const projectEvent = (event: Event): InformationEvent => ({
    id: event.metadata.eventId,
    type: event.metadata.eventType,
    occurredAt: event.metadata.timestamp,
    participantId: event.metadata.producer,
    sequence: Number(event.metadata.correlationId?.replace("seq-", "") ?? 0),
    payload: event.payload as Record<string, unknown>,
  });

  const projectAlert = (message: InformationObject): OperationalAlert | undefined => {
    if (message.type !== "operational.alert" || typeof message.payload !== "object" || message.payload === null) return undefined;
    const payload = message.payload as OperationalAlert;
    if (!payload.id || !payload.objectId || !payload.severity || !payload.state || !payload.createdAt || !payload.updatedAt || !Array.isArray(payload.recipients)) return undefined;
    return {
      id: payload.id,
      objectId: payload.objectId,
      severity: payload.severity,
      state: payload.state,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
      recipients: [...payload.recipients],
    };
  };

  const state = {
    get participants() { return stormFireParticipants.list(); },
    relationships,
    get objects() { return informationFabric.historyFor().filter((item) => item.kind === "OBJECT").map(projectObject); },
    get events() { return events.map(projectEvent); },
    get alerts() {
      const latestById = new Map<string, OperationalAlert>();
      for (const message of informationFabric.historyFor("operational.alert")) {
        const alert = projectAlert(message);
        if (alert) latestById.set(alert.id, alert);
      }
      return [...latestById.values()];
    },
    get services() { return stormFireServiceFabric.list(); },
    workspaces,
  } as StormFireRuntimeState;

  for (const object of initial.objects ?? []) {
    informationFabric.publish<unknown>({
      id: object.id,
      kind: "OBJECT",
      type: object.kind,
      schemaVersion: 1,
      version: object.version,
      occurredAt: object.timestamp,
      producerParticipantId: object.sourceParticipantId,
      classification: object.classification,
      geographicScopeIds: [],
      provenance: { sourceId: object.sourceParticipantId, observedAt: object.timestamp, receivedAt: object.timestamp, confidence: object.confidence },
      payload: object.attributes,
    });
  }

  for (const alert of initial.alerts ?? []) {
    informationFabric.publish<OperationalAlert>({
      id: `alert:${alert.id}`,
      kind: "OBJECT",
      type: "operational.alert",
      schemaVersion: 1,
      version: 1,
      occurredAt: alert.updatedAt,
      producerParticipantId: "system",
      classification: "CONTROLLED",
      geographicScopeIds: [],
      provenance: { sourceId: "system", observedAt: alert.createdAt, receivedAt: alert.updatedAt },
      payload: { ...alert, recipients: [...alert.recipients] },
    });
  }

  return {
    state,
    informationFabric,
    ingestObject(object: CanonicalOperationalObject) {
      const current = informationFabric.historyFor().find((item) => item.id === object.id && item.kind === "OBJECT");
      if (current && object.version <= current.version) {
        sequence += 1;
        return projectEvent({
          metadata: {
            eventId: `evt-${sequence}`,
            eventType: "OBJECT_IGNORED_STALE",
            schemaVersion: 1,
            source: object.sourceParticipantId,
            producer: object.sourceParticipantId,
            timestamp: new Date().toISOString(),
            correlationId: `seq-${sequence}`,
            provenance: { sourceId: object.sourceParticipantId, observedAt: object.timestamp, receivedAt: new Date().toISOString() },
            classification: object.classification,
            geographicScopeIds: [],
          },
          payload: { objectId: object.id, version: object.version },
        });
      }

      const canonical: InformationObject = {
        id: object.id,
        kind: "OBJECT",
        type: object.kind,
        schemaVersion: 1,
        version: object.version,
        occurredAt: object.timestamp,
        producerParticipantId: object.sourceParticipantId,
        classification: object.classification,
        geographicScopeIds: [],
        provenance: { sourceId: object.sourceParticipantId, observedAt: object.timestamp, receivedAt: new Date().toISOString(), confidence: object.confidence },
        payload: object.attributes,
      };
      informationFabric.publish(canonical);

      sequence += 1;
      const event: Event = {
        metadata: {
          eventId: `evt-${sequence}`,
          eventType: current ? "OBJECT_UPDATED" : "OBJECT_CREATED",
          schemaVersion: 1,
          source: object.sourceParticipantId,
          producer: object.sourceParticipantId,
          timestamp: new Date().toISOString(),
          correlationId: `seq-${sequence}`,
          provenance: canonical.provenance,
          classification: canonical.classification,
          geographicScopeIds: canonical.geographicScopeIds,
        },
        payload: { objectId: object.id, kind: object.kind, version: object.version },
      };
      events.push(event);
      void stormFireEventSpine.publish(event);
      return projectEvent(event);
    },
    publishAlert(alert: OperationalAlert) {
      const canonical: InformationObject<OperationalAlert> = {
        id: `alert:${alert.id}`,
        kind: "OBJECT",
        type: "operational.alert",
        schemaVersion: 1,
        version: 1,
        occurredAt: alert.updatedAt,
        producerParticipantId: "system",
        classification: "CONTROLLED",
        geographicScopeIds: [],
        provenance: { sourceId: "system", observedAt: alert.createdAt, receivedAt: alert.updatedAt },
        payload: { ...alert, recipients: [...alert.recipients] },
      };

      const current = informationFabric.historyFor("operational.alert").find((item) => item.id === canonical.id);
      const next = current ? { ...canonical, version: current.version + 1 } : canonical;
      informationFabric.publish(next);
      return alert;
    },
    resolveWorkspace(id: string) { return workspaces.find((workspace) => workspace.id === id); },
    resolveParticipantContext(id: string) { return stormFireParticipantContexts.resolve(id); },
    organizationGraph: stormFireOrganizationGraph,
  };
}

/** Production composition uses the canonical shared Information Fabric. */
export const defaultStormFireRuntime = createStormFireRuntime({}, stormFireInformationFabric);

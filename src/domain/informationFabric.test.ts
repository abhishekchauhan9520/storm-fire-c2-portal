import { InformationFabric } from "./informationFabric";

describe("InformationFabric", () => {
  const event = () => ({
    id: "evt-1", kind: "EVENT" as const, type: "logistics.alert", version: 1,
    occurredAt: "2026-08-17T00:00:00.000Z", producerServiceId: "logistics", producerParticipantId: "company-a",
    provenance: { sourceId: "logistics", observedAt: "2026-08-17T00:00:00.000Z", receivedAt: "2026-08-17T00:00:00.000Z" }, payload: { requestId: "req-1" }
  });

  it("does not dispatch duplicate events", () => {
    const fabric = new InformationFabric();
    let deliveries = 0;
    fabric.subscribe({ id: "sub-1", participantId: "brigade-a", informationTypes: ["logistics.alert"], handler: () => deliveries++ });
    fabric.publish(event());
    fabric.publish(event());
    expect(deliveries).toBe(1);
    expect(fabric.historyFor("logistics.alert")).toHaveLength(1);
  });

  it("allows a different event version", () => {
    const fabric = new InformationFabric();
    const first = event();
    const second = { ...first, version: 2 };
    fabric.publish(first);
    fabric.publish(second);
    expect(fabric.historyFor("logistics.alert")).toHaveLength(2);
  });
});

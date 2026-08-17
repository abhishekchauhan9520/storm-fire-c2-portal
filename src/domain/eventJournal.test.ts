import { InMemoryEventJournal } from "./eventJournal";

describe("InMemoryEventJournal", () => {
  it("retains event identity across repeated checks", async () => {
    const journal = new InMemoryEventJournal();
    const event = {
      id: "evt-1", kind: "EVENT" as const, type: "logistics.alert", version: 1,
      occurredAt: "2026-08-17T00:00:00.000Z", producerServiceId: "logistics",
      provenance: { sourceId: "logistics", observedAt: "2026-08-17T00:00:00.000Z", receivedAt: "2026-08-17T00:00:00.000Z" },
      payload: { requestId: "req-1" }
    };
    expect(await journal.has(event)).toBe(false);
    await journal.append(event);
    expect(await journal.has(event)).toBe(true);
    expect(await journal.has({ ...event, version: 2 })).toBe(false);
  });
});

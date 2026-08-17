import { EventIdempotencyStore } from "./eventIdempotency";

describe("EventIdempotencyStore", () => {
  it("accepts an event once and rejects a retry", () => {
    const store = new EventIdempotencyStore();
    const event = { id: "evt-1", type: "logistics.alert", version: 1 };
    expect(store.markProcessed(event)).toBe(true);
    expect(store.markProcessed(event)).toBe(false);
    expect(store.has(event)).toBe(true);
  });

  it("treats versions as distinct event identities", () => {
    const store = new EventIdempotencyStore();
    expect(store.markProcessed({ id: "evt-1", type: "logistics.alert", version: 1 })).toBe(true);
    expect(store.markProcessed({ id: "evt-1", type: "logistics.alert", version: 2 })).toBe(true);
  });
});

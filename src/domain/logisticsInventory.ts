export interface StormFireInventoryItem { id: string; category: string; name: string; unit: string; onHand: number; reserved: number; reorderPoint: number; locationScopeId: string; }

export class LogisticsInventoryService {
  private readonly items = new Map<string, StormFireInventoryItem>();
  register(item: StormFireInventoryItem): void {
    if (!item.id || item.onHand < 0 || item.reserved < 0 || item.reserved > item.onHand) throw new Error("Invalid inventory item.");
    if (this.items.has(item.id)) throw new Error(`Inventory item ${item.id} already exists.`);
    this.items.set(item.id, { ...item });
  }
  get(id: string): StormFireInventoryItem | undefined { const item = this.items.get(id); return item ? { ...item } : undefined; }
  available(id: string): number { const item = this.items.get(id); return item ? item.onHand - item.reserved : 0; }
  reserve(id: string, quantity: number): StormFireInventoryItem {
    const item = this.items.get(id); if (!item || quantity <= 0 || this.available(id) < quantity) throw new Error("Insufficient inventory availability.");
    item.reserved += quantity; return { ...item };
  }
  consume(id: string, quantity: number): StormFireInventoryItem {
    const item = this.items.get(id); if (!item || quantity <= 0 || item.reserved < quantity) throw new Error("Insufficient reserved inventory.");
    item.onHand -= quantity; item.reserved -= quantity; return { ...item };
  }
  needsReorder(id: string): boolean { const item = this.items.get(id); return Boolean(item && this.available(id) <= item.reorderPoint); }
  listByScope(scopeId: string): StormFireInventoryItem[] { return [...this.items.values()].filter(item => item.locationScopeId === scopeId).map(item => ({ ...item })); }
}

export const stormFireLogisticsInventory = new LogisticsInventoryService();

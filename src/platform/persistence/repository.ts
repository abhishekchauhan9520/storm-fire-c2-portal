/** Generic persistence boundary used by domain services. Adapters may target PostgreSQL, another durable store, or test doubles. */
export interface Repository<T extends { id: string }> {
  get(id: string): Promise<T | undefined>;
  list(): Promise<T[]>;
  save(value: T): Promise<T>;
  delete(id: string): Promise<boolean>;
}

export class InMemoryRepository<T extends { id: string }> implements Repository<T> {
  private readonly values = new Map<string, T>();

  async get(id: string): Promise<T | undefined> { return this.values.get(id); }
  async list(): Promise<T[]> { return [...this.values.values()].map((value) => ({ ...value })); }
  async save(value: T): Promise<T> { this.values.set(value.id, value); return value; }
  async delete(id: string): Promise<boolean> { return this.values.delete(id); }
}

import type { Service } from "../contracts/stormFireContracts";

export interface LogisticsResource {
  id: string;
  name: string;
  kind: "SUPPLY" | "FUEL" | "EQUIPMENT" | "TRANSPORT" | "OTHER";
  quantity: number;
  unit: string;
  locationId?: string;
  readiness?: "READY" | "LIMITED" | "UNAVAILABLE";
}

async function readData<T>(response: Response, label: string): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `${label} request failed with HTTP ${response.status}.`);
  }
  const body = await response.json() as { data?: unknown };
  if (!body.data) throw new Error(`${label} response did not contain data.`);
  return body.data as T;
}

export async function fetchServices(signal?: AbortSignal): Promise<Service[]> {
  const response = await fetch("/api/services", {
    signal,
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  return readData<Service[]>(response, "Service Fabric");
}

export async function fetchLogisticsResources(signal?: AbortSignal): Promise<LogisticsResource[]> {
  const response = await fetch("/api/logistics/resources", {
    signal,
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  return readData<LogisticsResource[]>(response, "Logistics service");
}

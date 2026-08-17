import { InMemoryLogisticsRepository } from "./logisticsRepository";
import { LogisticsService } from "./logisticsService";

/** Composition root for the Logistics bounded context. Keeps one service/repository instance per application process. */
export const logisticsRepository = new InMemoryLogisticsRepository();
export const logisticsService = new LogisticsService(logisticsRepository);

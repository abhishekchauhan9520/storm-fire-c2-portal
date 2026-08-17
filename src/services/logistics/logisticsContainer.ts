import { PersistentLogisticsRepository } from "./logisticsPersistence";
import { InMemoryLogisticsRepository } from "./logisticsRepository";
import { FileLogisticsPersistenceAdapter } from "./fileLogisticsPersistence";
import { LogisticsService } from "./logisticsService";

/**
 * Composition root for the Logistics bounded context. The domain service uses
 * the repository interface; persistence is selected at the infrastructure
 * boundary instead of inside the domain.
 */
const inMemoryDelegate = new InMemoryLogisticsRepository();
const persistenceAdapter = new FileLogisticsPersistenceAdapter();
export const logisticsRepository = new PersistentLogisticsRepository(inMemoryDelegate, persistenceAdapter);
export const logisticsRepositoryReady = logisticsRepository.hydrate();
export const logisticsService = new LogisticsService(logisticsRepository);

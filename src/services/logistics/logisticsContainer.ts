import { PersistentLogisticsRepository } from "./logisticsPersistence";
import { InMemoryLogisticsRepository } from "./logisticsRepository";
import { FileLogisticsPersistenceAdapter } from "./fileLogisticsPersistence";
import { LogisticsLifecycle } from "./logisticsLifecycle";
import { LogisticsService } from "./logisticsService";

/**
 * Composition root for the Logistics bounded context. The domain service uses
 * the repository interface; persistence and lifecycle eventing are selected at
 * the application/infrastructure boundary.
 */
const inMemoryDelegate = new InMemoryLogisticsRepository();
const persistenceAdapter = new FileLogisticsPersistenceAdapter();
export const logisticsRepository = new PersistentLogisticsRepository(inMemoryDelegate, persistenceAdapter);
export const logisticsRepositoryReady = logisticsRepository.hydrate();
export const logisticsService = new LogisticsService(logisticsRepository);
export const logisticsLifecycle = new LogisticsLifecycle(logisticsService);

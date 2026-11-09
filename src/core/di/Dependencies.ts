// src/core/di/Dependencies.ts

import { SQLiteDeliveryRepository } from '../../infrastructure/storage/SQLiteDeliveryRepository';
// (Imaginons que tu as ces classes pour ton backend et ton service métier)
// import { ConvexBackendService } from '../../infrastructure/backend/ConvexBackendService';
// import { DeliveryService } from '../services/DeliveryService';
import { SyncService } from '../services/SyncService';
import { RouteOptimizationService } from '../services/RouteOptimizationService';

// 1. Initialisation des Repositories (Infrastructure)
const deliveryRepository = new SQLiteDeliveryRepository();
// const backendService = new ConvexBackendService(); // Ton implémentation Convex

// 2. Initialisation des Services (Core Domain)
// On injecte l'infrastructure dans les services métier
// const deliveryService = new DeliveryService(deliveryRepository);
// const syncService = new SyncService(deliveryRepository, backendService);
const routeOptimizationService = new RouteOptimizationService();

// 3. Export du conteneur global
export const Dependencies = {
  deliveryRepository,
  // backendService,
  // deliveryService,
  // syncService,
  routeOptimizationService,
};
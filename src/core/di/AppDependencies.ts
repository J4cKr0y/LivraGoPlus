// src/core/di/AppDependencies.ts

import { DeliveryService } from '../services/DeliveryService';
import { SyncService } from '../services/SyncService';
import { SQLiteDeliveryRepository } from '../../infrastructure/storage/SQLiteDeliveryRepository';
import { BatchConvexBackendService } from '../../infrastructure/backend/BatchConvexBackendService';
import { ExpoGeocodingService } from '../../infrastructure/geocoding/ExpoGeocodingService';
import { MlKitOcrService } from '../../infrastructure/ocr/MlKitOcrService';
import { ReactNativeMapService } from '../../infrastructure/map/ReactNativeMapService';
import { HaversineDistanceProvider } from '../routing/DistanceProvider';
import { OsrmDistanceProvider } from '../routing/OsrmDistanceProvider';
import { RouteOptimizer } from '../routing/RouteOptimizer';

export const initDependencies = () => {
  // 1. Repositories & Backend
  const repository = new SQLiteDeliveryRepository();
  const backendService = new BatchConvexBackendService();
  
  // 2. Services d'infrastructure
  const ocrService = new MlKitOcrService();
  const mapService = new ReactNativeMapService();
  const geocodingService = new ExpoGeocodingService();
  
  // 3. Services métier
  const deliveryService = new DeliveryService(repository, ocrService, geocodingService);
  const syncService = new SyncService(repository, backendService);
  
  // 4. Calcul de routage et optimisation
  const haversineProvider = new HaversineDistanceProvider();
  const osrmProvider = new OsrmDistanceProvider(haversineProvider);
  const routeOptimizer = new RouteOptimizer(osrmProvider);

  return {
    deliveryService,
    syncService, 
    mapService,
    routeOptimizer,
  };
};

export type AppDependencies = ReturnType<typeof initDependencies>;
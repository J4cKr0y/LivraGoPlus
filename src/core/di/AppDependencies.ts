import { DeliveryService } from '../services/DeliveryService';
//import { InMemoryDeliveryRepository } from '../../infrastructure/storage/InMemoryDeliveryRepository';
import { SQLiteDeliveryRepository } from '../../infrastructure/storage/SQLiteDeliveryRepository';
//import { FakeOcrService } from '../../infrastructure/ocr/FakeOcrService';
//import { FakeMapService } from '../../infrastructure/map/FakeMapService';
//import { FakeGeocodingService } from '../../infrastructure/geocoding/FakeGeocodingService';
import { ExpoGeocodingService } from '../../infrastructure/geocoding/ExpoGeocodingService';
import { MlKitOcrService } from '../../infrastructure/ocr/MlKitOcrService';
import { ReactNativeMapService } from '../../infrastructure/map/ReactNativeMapService';
import { HaversineDistanceProvider } from '../routing/DistanceProvider';
import { OsrmDistanceProvider } from '../routing/OsrmDistanceProvider';
import { RouteOptimizer } from '../routing/RouteOptimizer';


export const initDependencies = () => {
 // const repository = new InMemoryDeliveryRepository();
const repository = new SQLiteDeliveryRepository();
  
//  const ocrService = new FakeOcrService("123 Avenue de la République\n83000 Toulon");
 
const ocrService = new MlKitOcrService();
  
//  const mapService = new FakeMapService();
const mapService = new ReactNativeMapService();
const geocodingService = new ExpoGeocodingService();
  
  const deliveryService = new DeliveryService(repository, ocrService, geocodingService);
  
  // 1. On instancie le calculateur "Vol d'oiseau"
  const haversineProvider = new HaversineDistanceProvider();
  
  // 2. On instancie OSRM en lui donnant Haversine comme parachute de secours
  const osrmProvider = new OsrmDistanceProvider(haversineProvider);
  
  // 3. On donne le provider global au moteur d'optimisation
  const routeOptimizer = new RouteOptimizer(osrmProvider);

  return {
    deliveryService,
    mapService,
    routeOptimizer,
  };
};
  
  
export type AppDependencies = ReturnType<typeof initDependencies>;

import { DeliveryService } from '../services/DeliveryService';
import { InMemoryDeliveryRepository } from '../../infrastructure/storage/InMemoryDeliveryRepository';
import { FakeOcrService } from '../../infrastructure/ocr/FakeOcrService';
import { FakeMapService } from '../../infrastructure/map/FakeMapService';
import { FakeGeocodingService } from '../../infrastructure/geocoding/FakeGeocodingService';

export const initDependencies = () => {
  const repository = new InMemoryDeliveryRepository();
  
  const ocrService = new FakeOcrService("123 Avenue de la République\n83000 Toulon");
  
  const mapService = new FakeMapService();
  const geocodingService = new FakeGeocodingService(); 

  const deliveryService = new DeliveryService(repository, ocrService, geocodingService);

  return {
    deliveryService,
    mapService,
  };
};

export type AppDependencies = ReturnType<typeof initDependencies>;

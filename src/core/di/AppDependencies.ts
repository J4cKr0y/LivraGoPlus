import { DeliveryService } from '../services/DeliveryService';
import { InMemoryDeliveryRepository } from '../../infrastructure/storage/InMemoryDeliveryRepository';
import { FakeOcrService } from '../../infrastructure/ocr/FakeOcrService';
import { FakeMapService } from '../../infrastructure/map/FakeMapService';

// C'est ici qu'on "assemble" l'application.
// Plus tard, on pourra remplacer InMemory par SQLite ici sans toucher aux écrans.
export const initDependencies = () => {
  const repository = new InMemoryDeliveryRepository();
  
  // On met un texte par défaut pour le FakeOCR pour tester l'UI
  const ocrService = new FakeOcrService("123 Rue de la République\n75001 Paris");
  
  const mapService = new FakeMapService();
  
  const deliveryService = new DeliveryService(repository, ocrService);

  return {
    deliveryService,
    mapService,
  };
};

// On définit le type pour l'utiliser dans le Context React
export type AppDependencies = ReturnType<typeof initDependencies>;

import { DeliveryService } from '../DeliveryService';
import { InMemoryDeliveryRepository } from '../../../infrastructure/storage/InMemoryDeliveryRepository';
import { FakeOcrService } from '../../../infrastructure/ocr/FakeOcrService';
import { FakeGeocodingService } from '../../../infrastructure/geocoding/FakeGeocodingService';

jest.mock('expo-crypto', () => ({
  randomUUID: () => 'uuid-test-123-456'
}));

describe('DeliveryService Integration', () => {
  let service: DeliveryService;
  let repository: InMemoryDeliveryRepository;
  let ocr: FakeOcrService;
  let geocoding: FakeGeocodingService;

  beforeEach(() => {
    repository = new InMemoryDeliveryRepository();
    ocr = new FakeOcrService("15 boulevard de Strasbourg\n83000 Toulon");
    geocoding = new FakeGeocodingService();
    
    // On passe bien les 3 arguments au constructeur
    service = new DeliveryService(repository, ocr, geocoding);
  });

  it('should process a scan and store it in the database', async () => {
    const fakeImageUri = 'file://camera/photo.jpg';

    const createdDelivery = await service.addDeliveryFromScan(fakeImageUri);

    // Vérifications
    expect(createdDelivery.id).toBe('uuid-test-123-456');
    expect(createdDelivery.address.fullText).toContain('Strasbourg');
    expect(createdDelivery.syncStatus).toBe('PENDING_UPLOAD');
    
    // Vérification des coordonnées (Le Fake renvoie Paris)
    expect(createdDelivery.address.coordinates).toBeDefined();
    expect(createdDelivery.address.coordinates?.latitude).toBe(48.8566);

    // Vérification en DB
    const all = await repository.getAll();
    expect(all.length).toBe(1);
  });
});

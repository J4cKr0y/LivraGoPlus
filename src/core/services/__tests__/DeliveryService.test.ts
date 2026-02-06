import { DeliveryService } from '../DeliveryService';
import { InMemoryDeliveryRepository } from '../../../infrastructure/storage/InMemoryDeliveryRepository';
import { FakeOcrService } from '../../../infrastructure/ocr/FakeOcrService';

// Mock simple pour expo-crypto car jest ne l'a pas par défaut en environnement node pur
jest.mock('expo-crypto', () => ({
  randomUUID: () => 'uuid-test-123-456'
}));

describe('DeliveryService Integration', () => {
  let service: DeliveryService;
  let repository: InMemoryDeliveryRepository;
  let ocr: FakeOcrService;

  beforeEach(() => {
    // 1. On prépare les briques réelles (ou fake pour l'externe)
    repository = new InMemoryDeliveryRepository();
    ocr = new FakeOcrService("15 Avenue des Champs-Élysées\n75008 Paris");
    
    // 2. On les injecte dans le service
    service = new DeliveryService(repository, ocr);
  });

  it('should process a scan and store it in the database', async () => {
    // --- Scénario ---
    
    // 1. L'utilisateur prend une photo (simulé par l'URI)
    const fakeImageUri = 'file://camera/photo.jpg';

    // 2. Le service fait le travail
    const createdDelivery = await service.addDeliveryFromScan(fakeImageUri);

    // 3. Vérifications immédiates
    expect(createdDelivery.id).toBe('uuid-test-123-456');
    expect(createdDelivery.address.fullText).toContain('Champs-Élysées');
    expect(createdDelivery.syncStatus).toBe('PENDING_UPLOAD'); // Doit être prêt à synchroniser

    // 4. Vérification collatérale : Est-ce que c'est bien dans la BDD ?
    const allDeliveries = await repository.getAll();
    expect(allDeliveries).toHaveLength(1);
    expect(allDeliveries[0].rawScannedText).toBe("15 Avenue des Champs-Élysées\n75008 Paris");
  });
});

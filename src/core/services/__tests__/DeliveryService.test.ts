import { DeliveryService } from '../DeliveryService';
import { IDeliveryRepository } from '../../interfaces/IDeliveryRepository';
import { IOcrService } from '../../interfaces/IOcrService';
import { IGeocodingService } from '../../interfaces/IGeocodingService';
import { Delivery } from '../../domain/Delivery';

describe('DeliveryService', () => {
  let deliveryService: DeliveryService;
  let mockRepository: jest.Mocked<IDeliveryRepository>;
  let mockOcrService: jest.Mocked<IOcrService>;
  let mockGeocodingService: jest.Mocked<IGeocodingService>;

  beforeEach(() => {
    // Création des mocks
    mockRepository = {
      save: jest.fn(),
      getAll: jest.fn(),
      getById: jest.fn(),
    };
    mockOcrService = {
      extractTextFromImage: jest.fn(),
    };
    mockGeocodingService = {
      geocode: jest.fn(),
    };

    deliveryService = new DeliveryService(mockRepository, mockOcrService, mockGeocodingService);
  });

  // ... (Garde tes anciens tests ici, par exemple ceux sur addDeliveryFromScan) ...

  describe('validateDelivery', () => {
    it('devrait marquer la livraison comme DELIVERED et sauvegarder la photo', async () => {
      // 1. Préparation (Arrange)
      const existingDelivery: Delivery = {
        id: '123',
        status: 'PENDING',
        address: { fullText: '10 Rue de Paris' }
      };
      mockRepository.getById.mockResolvedValue(existingDelivery);

      const photoUri = 'file://mon-dossier/photo-colis.jpg';

      // 2. Action (Act)
      await deliveryService.validateDelivery('123', photoUri);

      // 3. Vérification (Assert)
      expect(mockRepository.getById).toHaveBeenCalledWith('123');
      
      // On vérifie que le repository a bien été appelé pour sauvegarder la mise à jour
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        id: '123',
        status: 'DELIVERED', // Le statut a changé
        proofOfDeliveryUri: photoUri // La photo est attachée
      }));
    });

    it('devrait lever une erreur si la livraison n\'existe pas', async () => {
      mockRepository.getById.mockResolvedValue(null);

      await expect(
        deliveryService.validateDelivery('999', 'file://photo.jpg')
      ).rejects.toThrow("Livraison introuvable");
    });
  });
});
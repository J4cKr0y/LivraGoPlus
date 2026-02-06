import { InMemoryDeliveryRepository } from '../InMemoryDeliveryRepository';
import { createDelivery, Delivery } from '../../../core/domain/Delivery';

describe('InMemoryDeliveryRepository', () => {
  let repository: InMemoryDeliveryRepository;

  beforeEach(() => {
    repository = new InMemoryDeliveryRepository();
  });

  it('should save and retrieve a delivery', async () => {
    // 1. Arrange
    const newDelivery = createDelivery('1', '10 Rue de la Paix');

    // 2. Act
    await repository.save(newDelivery);
    const allDeliveries = await repository.getAll();

    // 3. Assert
    expect(allDeliveries).toHaveLength(1);
    expect(allDeliveries[0].id).toBe('1');
    expect(allDeliveries[0].address.fullText).toBe('10 Rue de la Paix');
  });

  it('should only retrieve deliveries pending sync', async () => {
    // 1. Arrange
    const pendingDelivery = createDelivery('1', 'Adresse A'); // Par défaut PENDING_UPLOAD
    const syncedDelivery = createDelivery('2', 'Adresse B');
    
    // On simule manuellement un état "SYNCED" pour le deuxième
    syncedDelivery.syncStatus = 'SYNCED';

    await repository.save(pendingDelivery);
    await repository.save(syncedDelivery);

    // 2. Act
    const pending = await repository.getPendingSync();

    // 3. Assert
    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe('1');
  });

  it('should update an existing delivery', async () => {
    // 1. Arrange
    const delivery = createDelivery('1', 'Version Originale');
    await repository.save(delivery);

    // 2. Act
    const updatedDelivery = { ...delivery, rawScannedText: 'Version Modifiée' };
    await repository.save(updatedDelivery);
    
    const result = await repository.getAll();

    // 3. Assert
    expect(result).toHaveLength(1);
    expect(result[0].rawScannedText).toBe('Version Modifiée');
  });
});

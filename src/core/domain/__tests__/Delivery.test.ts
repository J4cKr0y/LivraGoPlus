import { createDelivery, Delivery } from '../Delivery';

describe('Delivery Domain Entity', () => {
  
  it('should create a valid pending delivery from raw text', () => {
    // 1. Arrange (Préparation)
    const rawText = "12 rue des Lilas\n0612345678";
    const id = "uuid-123";

    // 2. Act (Action)
    const delivery: Delivery = createDelivery(id, rawText);

    // 3. Assert (Vérification de l'état)
    expect(delivery.id).toBe(id);
    expect(delivery.status).toBe('PENDING');
    
    // Vérifie que le mécanisme offline est activé par défaut
    expect(delivery.syncStatus).toBe('PENDING_UPLOAD');
    
    // Vérifie que l'adresse brute est bien initialisée
    expect(delivery.address.fullText).toBe(rawText);
  });

});

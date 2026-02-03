import { Delivery } from '../../core/domain/Delivery';
import { IDeliveryRepository } from '../../core/interfaces/IDeliveryRepository';

export class InMemoryDeliveryRepository implements IDeliveryRepository {
  // On utilise une Map pour simuler la BDD, l'accès par ID est instantané
  private db: Map<string, Delivery> = new Map();

  async getAll(): Promise<Delivery[]> {
    return Array.from(this.db.values());
  }

  async getPendingSync(): Promise<Delivery[]> {
    return Array.from(this.db.values()).filter(
      (d) => d.syncStatus === 'PENDING_UPLOAD' || d.syncStatus === 'PENDING_UPDATE'
    );
  }

  async save(delivery: Delivery): Promise<void> {
    // Simule une opération asynchrone (comme une vraie BDD)
    this.db.set(delivery.id, delivery);
    return Promise.resolve();
  }

  async delete(id: string): Promise<void> {
    this.db.delete(id);
    return Promise.resolve();
  }
  
  // Méthode utilitaire pour les tests uniquement (pour nettoyer entre deux tests)
  clear(): void {
    this.db.clear();
  }
}

import { Delivery } from '../domain/Delivery';

export interface IDeliveryRepository {
  // Récupère toutes les livraisons (depuis le stockage local en priorité)
  getAll(): Promise<Delivery[]>;
  
  // Récupère les livraisons non synchronisées (pour le worker de sync)
  getPendingSync(): Promise<Delivery[]>;
  
  // Sauvegarde ou met à jour une livraison
  save(delivery: Delivery): Promise<void>;
  
  // Supprime (ou soft-delete)
  delete(id: string): Promise<void>;
}

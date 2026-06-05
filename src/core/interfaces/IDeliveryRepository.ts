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
  
  // Récupère toutes les livraisons modifiées en local mais pas encore poussées sur Convex 
  getUnsyncedDeliveries(): Promise<Delivery[]>;

  // Remplace l'URI locale (file://) par le Storage ID officiel de Convex 
  updateProofUri(id: string, proofUri: string): Promise<void>;

  // Marque la livraison comme synchronisée avec le Cloud 
  markAsSynced(id: string): Promise<void>;
}

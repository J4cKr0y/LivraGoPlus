import { Address } from './Location';

export type DeliveryStatus = 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'FAILED';
export type SyncStatus = 'SYNCED' | 'PENDING_UPLOAD' | 'PENDING_UPDATE';

export interface Delivery {
  id: string;
  createdAt: Date;
  
  // Données brutes (OCR)
  rawScannedText: string;
  
  // Données structurées (validées par l'user)
  address: Address;
  phoneNumber: string | null;
  
  // État métier
  status: DeliveryStatus;
  
  // Pour le mode Offline-first
  syncStatus: SyncStatus; 
}

// Factory function pour garantir qu'on crée toujours une livraison valide par défaut
export const createDelivery = (id: string, rawText: string): Delivery => ({
  id,
  createdAt: new Date(),
  rawScannedText: rawText,
  address: { fullText: rawText }, // Par défaut, l'adresse est le texte brut
  phoneNumber: null,
  status: 'PENDING',
  syncStatus: 'PENDING_UPLOAD',
});

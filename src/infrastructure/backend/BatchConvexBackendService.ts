// src/infrastructure/backend/BatchConvexBackendService.ts

import { IBackendService } from '../../core/backend/IBackendService';
import { Delivery } from '../../features/deliveries/domain/Delivery';

export class BatchConvexBackendService implements IBackendService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_CONVEX_URL || '';
    this.apiKey = process.env.SYNC_API_KEY || ''; // Ou une clé sécurisée
  }

  async syncDeliveries(deliveries: Delivery[]): Promise<void> {
    // Formatage des données pour correspondre au routeur /sync/push de Convex
    const payload = {
      changes: {
        packages: {
          created: deliveries.map(d => ({
            id: d.id,
            status: d.status,
            address: d.address.fullText,
            updatedAt: Date.now(),
          })),
          updated: [],
          deleted: [],
        }
      }
    };

    const response = await fetch(`${this.baseUrl}/sync/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP Batch Sync: ${response.status}`);
    }
  }

  async getRemoteDeliveries(): Promise<Delivery[]> {
    // Si besoin d'un pull via l'endpoint /sync/pull
    return [];
  }

  async updateDeliveryStatus(id: string, status: string, proofUri?: string): Promise<void> {
    // Dans une logique pure batch, la modification unitaire peut se contenter 
    // d'attendre la prochaine boucle globale de synchronisation.
  }

  async saveTourStats(stats: { savedKm: number; date: number; }): Promise<void> {
    // Optionnel
  }

  async uploadProofOfDelivery(localUri: string): Promise<string> {
    // Retourne l'uri ou l'ID de stockage distant
    return localUri;
  }
}
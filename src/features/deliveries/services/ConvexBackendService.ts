// src/features/deliveries/services/ConvexBackendService.ts

import { ConvexHttpClient } from "convex/browser";
import { IBackendService } from '../../../core/backend/IBackendService';
import { Delivery } from '../domain/Delivery';
// On importe les types générés par Convex
import { api } from "../../../../convex/_generated/api";

export class ConvexBackendService implements IBackendService {
  private client: ConvexHttpClient;
  // On simulera un userId pour le moment
  private currentUserId = "user_123"; 

  constructor() {
    // L'URL publique du projet Convex (donnée lors du `npx convex dev`)
    // stocké dans un fichier .env (EXPO_PUBLIC_CONVEX_URL)
    const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
    this.client = new ConvexHttpClient(convexUrl);
  }

  async syncDeliveries(deliveries: Delivery[]): Promise<void> {
    try {
      // On envoie chaque livraison de la tournée au backend
      for (const delivery of deliveries) {
        await this.client.mutation(api.deliveries.saveDelivery, {
          externalId: delivery.id,
          address: delivery.address.fullText,
          status: delivery.status,
          proofUri: delivery.proofOfDeliveryUri,
          customerPhone: delivery.customerPhone,
          userId: this.currentUserId,
        });
      }
      console.log("Synchronisation terminée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la synchronisation :", error);
      throw error; // On remonte l'erreur pour que l'interface puisse afficher une alerte
    }
  }

  async updateDeliveryStatus(id: string, status: string, proofUri?: string): Promise<void> {
    // Si on met à jour une seule livraison en temps réel, on réutilise la même mutation !
    // (Dans la vraie vie, il faudrait l'adresse, on gérera ça via le store ou une mutation plus fine)
  }

  async saveTourStats(stats: { savedKm: number; date: number; }): Promise<void> {
    // À implémenter avec une nouvelle mutation "saveTour"
  }

  async getRemoteDeliveries(): Promise<Delivery[]> {
    return []; // À implémenter avec une Query Convex
  }
  
async getFuelPrice(zipCode: string, fuelType: string): Promise<number | null> {
  try {
    const result = await this.client.action(api.fuel.getLocalFuelPrice, { zipCode, fuelType });
    if (result.success && result.price) {
      return result.price;
    }
    return null;
  } catch (e) {
    console.error("Impossible de récupérer le prix du carburant", e);
    return null;
  }
}

  
}

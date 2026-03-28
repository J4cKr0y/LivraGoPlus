import { Delivery, createDelivery } from '../domain/Delivery';
import { IDeliveryRepository } from '../interfaces/IDeliveryRepository';
import { IOcrService } from '../interfaces/IOcrService';
import * as Crypto from 'expo-crypto'; 

import { IGeocodingService } from '../interfaces/IGeocodingService';

export class DeliveryService {
  constructor(
    private repository: IDeliveryRepository,
    private ocrService: IOcrService,
    private geocodingService: IGeocodingService, 
  ) {}

  /**
   * Scénario principal : Photo -> OCR -> Sauvegarde
   */
  async addDeliveryFromScan(imageUri: string): Promise<Delivery> {
    const ocrResult = await this.ocrService.extractTextFromImage(imageUri);
    const newId = Crypto.randomUUID();
    
    // On lance le géocodage
    const coords = await this.geocodingService.geocode(ocrResult.rawText);

    const newDelivery = createDelivery(newId, ocrResult.rawText);
    
    // On met à jour les coordonnées de la livraison
    if (coords) {
        newDelivery.address.coordinates = coords; 
    }

    await this.repository.save(newDelivery);
    return newDelivery;
  }

  /**
   * Récupération pour l'UI
   */
  async getDeliveries(): Promise<Delivery[]> {
    return this.repository.getAll();
  }

async validateDelivery(deliveryId: string, photoUri: string): Promise<void> {
    const delivery = await this.repository.getById(deliveryId);
    if (!delivery) throw new Error("Livraison introuvable");

    // Mise à jour de l'état et ajout de la photo
    delivery.status = 'DELIVERED';
    delivery.proofOfDeliveryUri = photoUri;

    // Sauvegarde en base de données
    await this.repository.save(delivery);
  }
}
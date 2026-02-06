import { Delivery, createDelivery } from '../domain/Delivery';
import { IDeliveryRepository } from '../interfaces/IDeliveryRepository';
import { IOcrService } from '../interfaces/IOcrService';
import * as Crypto from 'expo-crypto'; 

export class DeliveryService {
  constructor(
    private repository: IDeliveryRepository,
    private ocrService: IOcrService
  ) {}

  /**
   * Scénario principal : Photo -> OCR -> Sauvegarde
   */
  async addDeliveryFromScan(imageUri: string): Promise<Delivery> {
    // 1. Appel à l'OCR
    const ocrResult = await this.ocrService.extractTextFromImage(imageUri);
    
    // 2. Génération ID unique
    const newId = Crypto.randomUUID();

    // 3. Création de l'entité (Logique métier)
    // Ici, plus tard, on pourra ajouter une logique pour nettoyer le texte
    // ou extraire automatiquement le numéro de tel si ocrResult.detectedPhoneNumbers > 0
    const newDelivery = createDelivery(newId, ocrResult.rawText);

    // 4. Persistance
    await this.repository.save(newDelivery);

    return newDelivery;
  }

  /**
   * Récupération pour l'UI
   */
  async getDeliveries(): Promise<Delivery[]> {
    return this.repository.getAll();
  }
}

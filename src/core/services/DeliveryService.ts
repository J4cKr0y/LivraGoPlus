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
   * PLAN A : Scénario complet automatique (Scan Caméra)
   */
  async addDeliveryFromScan(imageUri: string): Promise<Delivery> {
    // 1. On extrait le texte
    const rawText = await this.extractAddressTextFromImage(imageUri);
    
    // 2. Si l'OCR n'a rien trouvé, on lève une erreur spécifique pour l'UI
    if (!rawText) {
      throw new Error("OCR_FAILURE_NO_TEXT");
    }

    // 3. Si on a du texte, on lance la sauvegarde normale
    return this.saveTypedAddress(rawText);
  }

  /**
   * PLAN B : Juste l'OCR (Utile pour la galerie photo)
   * Retourne le texte brut ou null si rien n'est détecté
   */
  async extractAddressTextFromImage(imageUri: string): Promise<string | null> {
    try {
      const ocrResult = await this.ocrService.extractTextFromImage(imageUri);
      // On vérifie si le texte semble valide (plus de 5 caractères par ex)
      if (ocrResult && ocrResult.rawText && ocrResult.rawText.trim().length > 5) {
        return ocrResult.rawText;
      }
      return null;
    } catch (error) {
      console.error("Erreur OCR service:", error);
      return null;
    }
  }

  /**
   * PLAN C : Géocodage + Sauvegarde (Utile pour la saisie manuelle)
   */
  async saveTypedAddress(addressText: string): Promise<Delivery> {
    const newId = Crypto.randomUUID();
    const newDelivery = createDelivery(newId, addressText);

    try {
      // On tente de trouver les coordonnées GPS de l'adresse
      const coords = await this.geocodingService.geocode(addressText);
      if (coords) {
          newDelivery.address.coordinates = coords; 
      }
    } catch (error) {
      console.warn("Géocodage échoué, on sauvegarde quand même l'adresse brute.");
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

  /**
   * PREUVE DE LIVRAISON (Signature ou Photo)
   */
  async validateDelivery(deliveryId: string, proofUri: string): Promise<void> {
    const delivery = await this.repository.getById(deliveryId);
    if (!delivery) throw new Error("Livraison introuvable");

    // Mise à jour de l'état et ajout de la photo/signature
    delivery.status = 'DELIVERED';
    delivery.proofOfDeliveryUri = proofUri;

    // Sauvegarde en base de données
    await this.repository.save(delivery);
  }
}

import NetInfo from '@react-native-community/netinfo';
import { IDeliveryRepository } from '../interfaces/IDeliveryRepository';
import { IBackendService } from '../backend/IBackendService';

export class SyncService {
  constructor(
    private repository: IDeliveryRepository,
    private backend: IBackendService
  ) {}

  /**
   * Tente de synchroniser toutes les livraisons en attente.
   * Gère l'upload des photos locales avant d'envoyer les données au Cloud.
   */
  async syncPendingDeliveries(): Promise<void> {
    try {
      // 1. Vérification rapide du réseau
      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        console.log("🔌 Sync ignorée : Aucun réseau disponible.");
        return;
      }

      // 2. Récupérer uniquement les livraisons non synchronisées depuis SQLite
      const pendingDeliveries = await this.repository.getUnsyncedDeliveries();

      if (pendingDeliveries.length === 0) {
        return; // Rien à faire, tout est à jour !
      }

      console.log(`🔄 Démarrage du rattrapage : ${pendingDeliveries.length} livraison(s) en attente...`);

      // 3. Traiter chaque livraison séquentiellement
      for (const delivery of pendingDeliveries) {
        try {
          let finalProofUri = delivery.proofOfDeliveryUri;

          // --- ÉTAPE A : GESTION DES PHOTOS LOCALES ---
          // Si l'URI commence par file://, c'est que la photo n'a pas encore été envoyée à Convex
          if (finalProofUri && finalProofUri.startsWith('file://')) {
            console.log(`⬆️ Upload de la photo pour la livraison ${delivery.id}...`);
            
            // On upload le fichier compressé et on récupère le storageId
            const storageId = await this.backend.uploadProofOfDelivery(finalProofUri);
            finalProofUri = storageId;

            // On met à jour la base de données locale avec le nouvel ID du Cloud
            // Pour ne pas uploader l'image en double si le réseau coupe juste après !
            await this.repository.updateProofUri(delivery.id, storageId);
          }

          // --- ÉTAPE B : MISE À JOUR DU CLOUD ---
          // On envoie l'objet complet (avec le bon storageId) à Convex
          const cloudDelivery = { ...delivery, proofOfDeliveryUri: finalProofUri };
          await this.backend.updateDeliveryStatus(cloudDelivery);

          // --- ÉTAPE C : VALIDATION LOCALE ---
          // On indique à SQLite que cette livraison est maintenant à jour sur le Cloud
          await this.repository.markAsSynced(delivery.id);
          console.log(`✅ Livraison ${delivery.id} synchronisée avec succès !`);

        } catch (error) {
          // On attrape l'erreur à l'intérieur de la boucle !
          // Si une livraison plante (ex: fichier corrompu), on ne bloque pas les autres.
          console.error(`❌ Échec de la synchronisation pour ${delivery.id}:`, error);
        }
      }

      console.log("🏁 Boucle de rattrapage terminée.");
    } catch (globalError) {
      console.error("Erreur critique dans le service de synchronisation :", globalError);
    }
  }
}
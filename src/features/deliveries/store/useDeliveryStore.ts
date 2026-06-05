// src/features/deliveries/store/useDeliveryStore.ts
import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';
import { Delivery } from '../domain/Delivery';

interface DeliveryState {
  deliveries: Delivery[];
  isLoading: boolean;
  // --- DONNÉES DE STATS ---
  stats: {
    savedKm: number;
  };
  
  fetchDeliveries: (deliveryService: any) => Promise<void>;
  validateDelivery: (deliveryService: any, id: string, proofUri: string) => Promise<void>;

  setOptimizedDeliveries: (optimizedList: Delivery[], savedKm: number) => void; 
}

export const useDeliveryStore = create<DeliveryState>((set) => ({
  deliveries: [],
  isLoading: false,
  stats: { savedKm: 0 }, // Initialisation à 0

  fetchDeliveries: async (deliveryService) => {
    set({ isLoading: true });
    const data = await deliveryService.getDeliveries();
    set({ deliveries: data, isLoading: false });
  },

  validateDelivery: async (id: string, localProofUri?: string) => {
    const { deliveries } = get();
    // (Ici on suppose que tu récupères tes services depuis un contexte ou qu'ils sont injectés)
    const { deliveryService, backendService } = useServices(); 

    const delivery = deliveries.find(d => d.id === id);
    if (!delivery) return;

    // --- 1. OPTIMISTIC UI & SAUVEGARDE LOCALE (Offline-First) ---
    const updatedDelivery = { 
      ...delivery, 
      status: 'DELIVERED' as const, 
      proofOfDeliveryUri: localProofUri // Au début, c'est une URI locale (file://...)
    };

    // On sauvegarde tout de suite dans SQLite pour ne rien perdre
    await deliveryService.validateDelivery(id, localProofUri);

    // On met à jour l'interface instantanément pour le livreur
    set((state) => ({
      deliveries: state.deliveries.map(d => d.id === id ? updatedDelivery : d)
    }));

    // --- 2. TENTATIVE DE SYNCHRONISATION CLOUD (En arrière-plan) ---
    try {
      const net = await NetInfo.fetch();
      if (net.isConnected) {
        let finalProofUri = localProofUri;

        // Étape A : Si on a une photo locale, on l'upload d'abord sur Convex
        if (localProofUri && localProofUri.startsWith('file://')) {
          console.log("Réseau détecté, upload de la photo en cours...");
          
          // C'est ici que ton code de compression et d'upload entre en jeu !
          const storageId = await backendService.uploadProofOfDelivery(localProofUri);
          finalProofUri = storageId;

          // On met à jour SQLite pour remplacer l'URI locale par le Storage ID de Convex
          await deliveryService.updateProofUri(id, storageId);

          // On met à jour l'état Zustand avec l'ID final
          set((state) => ({
            deliveries: state.deliveries.map(d => 
              d.id === id ? { ...d, proofOfDeliveryUri: storageId } : d
            )
          }));
        }

        // Étape B : On pousse le statut complet (avec l'ID de la photo) vers la base de données Convex
        const cloudDelivery = { ...updatedDelivery, proofOfDeliveryUri: finalProofUri };
        await backendService.updateDeliveryStatus(cloudDelivery);

        // Étape C : On marque la livraison comme synchronisée dans SQLite
        await deliveryService.markAsSynced(id);
      }
    } catch (error) {
      console.warn("Réseau instable, l'upload se fera plus tard via la boucle de rattrapage.", error);
      // On ne bloque pas l'application ! Le livreur a déjà vu que c'était validé à l'étape 1.
    }
  },

  // On sauvegarde la nouvelle liste et les stats
  setOptimizedDeliveries: (optimizedList, savedKm) => {
    set({ deliveries: optimizedList, stats: { savedKm } });
  }
}));

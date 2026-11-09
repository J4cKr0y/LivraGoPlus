// src/features/deliveries/store/useDeliveryStore.ts
import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';
import { Delivery } from '../domain/Delivery';
import * as Location from 'expo-location';
import { RouteOptimizationService } from '../../../core/services/RouteOptimizationService';

interface DeliveryState {
  deliveries: Delivery[];
  isLoading: boolean;
  stats: {
    savedKm: number;
  };
  
  fetchDeliveries: (deliveryService: any) => Promise<void>;
  validateDelivery: (deliveryService: any, id: string, localProofUri?: string, backendService?: any) => Promise<void>;
  setOptimizedDeliveries: (optimizedList: Delivery[], savedKm: number) => void;
  optimizeMyRoute: () => Promise<void>;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  deliveries: [],
  isLoading: false,
  stats: { savedKm: 0 },

  fetchDeliveries: async (deliveryService) => {
    set({ isLoading: true });
    const data = await deliveryService.getDeliveries();
    set({ deliveries: data, isLoading: false });
  },

  validateDelivery: async (deliveryService, id: string, localProofUri?: string, backendService?: any) => {
    const { deliveries } = get();
    const delivery = deliveries.find(d => d.id === id);
    if (!delivery) return;

    // --- 1. OPTIMISTIC UI & SAUVEGARDE LOCALE (Offline-First) ---
    const updatedDelivery = { 
      ...delivery, 
      status: 'DELIVERED' as const, 
      proofOfDeliveryUri: localProofUri 
    };

    // On sauvegarde tout de suite dans SQLite
    await deliveryService.validateDelivery(id, localProofUri);

    // On met à jour l'interface instantanément
    set((state) => ({
      deliveries: state.deliveries.map(d => d.id === id ? updatedDelivery : d)
    }));

    // --- 2. TENTATIVE DE SYNCHRONISATION CLOUD (En arrière-plan) ---
    if (!backendService) return;

    try {
      const net = await NetInfo.fetch();
      if (net.isConnected) {
        let finalProofUri = localProofUri;

        if (localProofUri && localProofUri.startsWith('file://')) {
          console.log("Réseau détecté, upload de la photo en cours...");
          const storageId = await backendService.uploadProofOfDelivery(localProofUri);
          finalProofUri = storageId;

          await deliveryService.updateProofUri(id, storageId);

          set((state) => ({
            deliveries: state.deliveries.map(d => 
              d.id === id ? { ...d, proofOfDeliveryUri: storageId } : d
            )
          }));
        }

        const cloudDelivery = { ...updatedDelivery, proofOfDeliveryUri: finalProofUri };
        await backendService.updateDeliveryStatus(cloudDelivery);
        await deliveryService.markAsSynced(id);
      }
    } catch (error) {
      console.warn("Réseau instable, l'upload se fera plus tard.", error);
    }
  },

  optimizeMyRoute: async () => {
    try {
      console.log("📍 Demande de position GPS...");
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn("❌ Permission GPS refusée par l'utilisateur.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      const currentCoord = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };

      const { deliveries } = get();
      const pendingDeliveries = deliveries.filter(d => d.status === 'PENDING');
      const completedDeliveries = deliveries.filter(d => d.status !== 'PENDING');

      console.log("🧮 Calcul du trajet optimal en cours...");
      const optimizer = new RouteOptimizationService();
      const optimizedPending = optimizer.optimizeRoute(currentCoord, pendingDeliveries);

      set({ 
        deliveries: [...optimizedPending, ...completedDeliveries] 
      });
      
      console.log("✅ Tournée optimisée avec succès !");
    } catch (error) {
      console.error("❌ Erreur lors de l'optimisation :", error);
    }
  },

  setOptimizedDeliveries: (optimizedList, savedKm) => {
    set({ deliveries: optimizedList, stats: { savedKm } });
  }
}));
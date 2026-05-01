// src/features/deliveries/store/useDeliveryStore.ts
import { create } from 'zustand';
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

  validateDelivery: async (deliveryService, id, proofUri) => {
    await deliveryService.validateDelivery(id, proofUri);
    set((state) => ({
      deliveries: state.deliveries.map(delivery => 
        delivery.id === id 
          ? { ...delivery, status: 'DELIVERED', proofOfDeliveryUri: proofUri } 
          : delivery
      )
    }));
  },

  // On sauvegarde la nouvelle liste et les stats
  setOptimizedDeliveries: (optimizedList, savedKm) => {
    set({ deliveries: optimizedList, stats: { savedKm } });
  }
}));

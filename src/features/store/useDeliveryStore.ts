// useDeliveryStore.ts
import { create } from 'zustand';
import { Delivery } from '../domain/Delivery';

interface DeliveryState {
  deliveries: Delivery[];
  isLoading: boolean;

  // Actions
  fetchDeliveries: (deliveryService: any) => Promise<void>;
  validateDelivery: (deliveryService: any, id: string, proofUri: string) => Promise<void>;

  // --- NOUVELLE ACTION ---
  setOptimizedDeliveries: (optimizedList: Delivery[]) => void;
}

export const useDeliveryStore = create<DeliveryState>((set) => ({
  deliveries: [],
  isLoading: false,

  // 1. Charger depuis SQLite au démarrage
  fetchDeliveries: async (deliveryService) => {
    set({ isLoading: true });
    const data = await deliveryService.getDeliveries();
    set({ deliveries: data, isLoading: false });
  },

  // 2. Valider une livraison (SQLite + mise à jour instantanée du cache)
  validateDelivery: async (deliveryService, id, proofUri) => {
    await deliveryService.validateDelivery(id, proofUri);

    set((state) => ({
      deliveries: state.deliveries.map((delivery) =>
        delivery.id === id
          ? { ...delivery, status: 'DELIVERED', proofOfDeliveryUri: proofUri }
          : delivery
      ),
    }));
  },

  // 3. Mettre à jour la liste optimisée
  setOptimizedDeliveries: (optimizedList) => {
    set({ deliveries: optimizedList });
  }
}));
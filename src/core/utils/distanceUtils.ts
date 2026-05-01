// src/core/utils/distanceUtils.ts
import { Delivery } from '../../features/deliveries/domain/Delivery';

// Calcul de la distance entre deux points GPS (Formule de Haversine)
export const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calcul de la distance totale d'une liste de livraisons
export const calculateTotalRouteDistance = (
  startPos: { latitude: number, longitude: number }, 
  deliveries: Delivery[]
): number => {
  if (deliveries.length === 0) return 0;

  let totalDistance = 0;
  let currentPos = startPos;

  for (const delivery of deliveries) {
    if (delivery.address.coordinates) {
      totalDistance += calculateDistanceKm(
        currentPos.latitude, 
        currentPos.longitude, 
        delivery.address.coordinates.latitude, 
        delivery.address.coordinates.longitude
      );
      // Le prochain point de départ devient la livraison actuelle
      currentPos = delivery.address.coordinates;
    }
  }

  return totalDistance;
};

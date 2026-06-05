// src/core/routing/RouteOptimizer.ts

import { Delivery } from '../../features/deliveries/domain/Delivery';
import { Coordinates } from '../../features/deliveries/domain/Location';
import { IDistanceProvider } from './DistanceProvider';

export class RouteOptimizer {
  constructor(private distanceProvider: IDistanceProvider) {}

  async optimizeTour(currentLocation: Coordinates, deliveries: Delivery[]): Promise<Delivery[]> {
    // Séparer les livraisons avec et sans coordonnées GPS
    const validDeliveries = deliveries.filter(d => d.address.coordinates);
    const invalidDeliveries = deliveries.filter(d => !d.address.coordinates);

    const optimizedRoute: Delivery[] = [];
    const unvisited = [...validDeliveries];
    let currentPos = currentLocation;

    // --- ALGORITHME DU PLUS PROCHE VOISIN ---
    while (unvisited.length > 0) {
      let closestIndex = -1;
      let minDistance = Infinity;

      // On cherche le point le plus proche de notre position actuelle
      for (let i = 0; i < unvisited.length; i++) {
        const destCoords = unvisited[i].address.coordinates!;
        
        // On demande la distance au Provider (OSRM ou Haversine)
        const distance = await this.distanceProvider.getDistance(currentPos, destCoords);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }

      // On retire le plus proche de la liste des "non visités" et on l'ajoute à la tournée
      const nextDelivery = unvisited.splice(closestIndex, 1)[0];
      optimizedRoute.push(nextDelivery);
      
      // On se déplace virtuellement à ce nouveau point
      currentPos = nextDelivery.address.coordinates!;
    }

    // On rajoute les adresses invalides (sans GPS) à la fin de la liste pour ne pas les perdre
    return [...optimizedRoute, ...invalidDeliveries];
  }
}

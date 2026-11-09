import { Delivery } from '../domain/Delivery';
import { GeoCoordinate } from '../domain/Location';

export class RouteOptimizationService {
  
  /**
   * Trie les livraisons en utilisant l'algorithme du "Plus Proche Voisin".
   * Complexité temporelle : O(n^2), ce qui est instantané sur un téléphone pour < 100 livraisons.
   */
  public optimizeRoute(currentLocation: GeoCoordinate, pendingDeliveries: Delivery[]): Delivery[] {
    if (pendingDeliveries.length === 0) return [];

    const unvisited = [...pendingDeliveries];
    const optimizedRoute: Delivery[] = [];
    let currentPoint = currentLocation;

    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let minDistance = Infinity;

      // Chercher la livraison la plus proche du point actuel
      for (let i = 0; i < unvisited.length; i++) {
        const deliveryLocation = unvisited[i].address.coordinates;
        
        // Si on n'a pas les coordonnées exactes, on la met à la fin par défaut
        if (!deliveryLocation) continue;

        const distance = this.calculateHaversineDistance(currentPoint, deliveryLocation);
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }

      // Ajouter la plus proche à la tournée et la retirer des non-visitées
      const nearestDelivery = unvisited.splice(nearestIndex, 1)[0];
      optimizedRoute.push(nearestDelivery);
      
      // Le prochain point de départ devient l'adresse de cette livraison
      if (nearestDelivery.address.coordinates) {
        currentPoint = nearestDelivery.address.coordinates;
      }
    }

    return optimizedRoute;
  }

  /**
   * Calcule la distance en kilomètres entre deux coordonnées GPS.
   */
  private calculateHaversineDistance(coord1: GeoCoordinate, coord2: GeoCoordinate): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(coord2.latitude - coord1.latitude);
    const dLon = this.deg2rad(coord2.longitude - coord1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(coord1.latitude)) * Math.cos(this.deg2rad(coord2.latitude)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance en km
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
// src/core/routing/DistanceProvider.ts

import { Coordinates } from '../../features/deliveries/domain/Location';

// 1. Le "Contrat" que toute méthode de calcul devra respecter
export interface IDistanceProvider {
  /** Retourne la distance en kilomètres entre deux points */
  getDistance(origin: Coordinates, destination: Coordinates): Promise<number>;
}

// 2. L'implémentation "Vol d'oiseau" (Hors-ligne / Rapide)
export class HaversineDistanceProvider implements IDistanceProvider {
  async getDistance(origin: Coordinates, destination: Coordinates): Promise<number> {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(destination.latitude - origin.latitude);
    const dLon = this.deg2rad(destination.longitude - origin.longitude);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(origin.latitude)) * Math.cos(this.deg2rad(destination.latitude)) * Math.sin(dLon/2) * Math.sin(dLon/2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance en km
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}

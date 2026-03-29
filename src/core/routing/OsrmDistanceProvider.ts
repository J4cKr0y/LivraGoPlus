// src/core/routing/OsrmDistanceProvider.ts

import { Coordinates } from '../../features/deliveries/domain/Location';
import { IDistanceProvider } from './DistanceProvider';

export class OsrmDistanceProvider implements IDistanceProvider {
  // On injecte le provider de secours dans le constructeur !
  constructor(private fallbackProvider: IDistanceProvider) {}

  async getDistance(origin: Coordinates, destination: Coordinates): Promise<number> {
    try {
      // 🚧 Plus tard : Ici on fera l'appel HTTP vers l'API OSRM
      // const response = await fetch(`http://router.project-osrm.org/route/v1/driving/...`);
      // return response.routes[0].distance / 1000;
      
      throw new Error("OSRM non implémenté pour l'instant"); // Simulation d'échec
    } catch (error) {
      console.warn("Échec OSRM ou Hors-ligne : Bascule sur le Vol d'oiseau.");
      // Magie : on utilise le système de secours !
      return this.fallbackProvider.getDistance(origin, destination);
    }
  }
}

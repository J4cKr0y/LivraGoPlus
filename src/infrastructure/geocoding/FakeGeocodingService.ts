import { IGeocodingService } from '../../core/interfaces/IGeocodingService';
import { GeoCoordinate } from '../../core/domain/Location';

export class FakeGeocodingService implements IGeocodingService {
  async geocode(address: string): Promise<GeoCoordinate | null> {
    // On simule une petite attente réseau
    await new Promise(resolve => setTimeout(resolve, 50));

    if (address.toLowerCase().includes("inconnue")) {
      return null;
    }

    // Pour le fake, on renvoie des coordonnées fixes (Paris)
    return {
      latitude: 48.8566,
      longitude: 2.3522,
    };
  }
}

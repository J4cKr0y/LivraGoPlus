import * as Location from 'expo-location';
import { IGeocodingService } from '../../core/interfaces/IGeocodingService';
import { GeoCoordinate } from '../../core/domain/Location';

export class ExpoGeocodingService implements IGeocodingService {
  async geocode(address: string): Promise<GeoCoordinate | null> {
    try {
      // Nettoyage basique : on remplace les sauts de ligne par des espaces
      const cleanAddress = address.replace(/\n/g, ' ');

      // Appel à l'API native du téléphone
      const results = await Location.geocodeAsync(cleanAddress);

      // Si on a un résultat, on renvoie le premier
      if (results && results.length > 0) {
        return {
          latitude: results[0].latitude,
          longitude: results[0].longitude,
        };
      }
      
      console.warn(`Aucune coordonnée trouvée pour l'adresse: ${cleanAddress}`);
      return null;
    } catch (error) {
      console.error("Erreur de géocodage :", error);
      return null;
    }
  }
}

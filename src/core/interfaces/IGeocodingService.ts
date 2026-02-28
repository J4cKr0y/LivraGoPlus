import { GeoCoordinate } from '../domain/Location';

export interface IGeocodingService {
  /**
   * Transforme une adresse texte en coordonnées GPS.
   * Retourne null si l'adresse est introuvable.
   */
  geocode(address: string): Promise<GeoCoordinate | null>;
}

import { GeoCoordinate } from '../domain/Location';

export interface IMapService {
  // Ouvre l'application de navigation native (Google Maps / Apple Maps)
  openExternalNavigation(coords: GeoCoordinate): Promise<void>;
  
  // Calcule une distance "à vol d'oiseau" (utile en offline)
  getAirDistance(from: GeoCoordinate, to: GeoCoordinate): number;
}

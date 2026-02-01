import { Address, GeoCoordinate } from '../domain/Location';

export interface RouteInfo {
  distanceMeters: number;
  durationSeconds: number;
  geometry: string; // Polyline encodée pour l'affichage map
}

export interface IMapService {
  // Transforme "10 rue de la paix" en {lat, long}
  geocodeAddress(address: string): Promise<Address | null>;
  
  // Calcule le trajet optimal entre plusieurs points
  calculateOptimalRoute(origin: GeoCoordinate, destinations: GeoCoordinate[]): Promise<RouteInfo>;
}

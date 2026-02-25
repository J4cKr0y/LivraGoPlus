import { IMapService } from '../../core/interfaces/IMapService';
import { GeoCoordinate } from '../../core/domain/Location';
import { Linking } from 'react-native';

export class FakeMapService implements IMapService {
  async openExternalNavigation(coords: GeoCoordinate): Promise<void> {
    const url = `http://maps.google.com/maps?daddr=${coords.latitude},${coords.longitude}`;
    console.log("Simulating navigation to:", url);
    // On utilise Linking pour ouvrir l'app native
    await Linking.openURL(url);
  }

  getAirDistance(from: GeoCoordinate, to: GeoCoordinate): number {
    // Une formule simple pour les tests
    return Math.sqrt(
      Math.pow(to.latitude - from.latitude, 2) + 
      Math.pow(to.longitude - from.longitude, 2)
    ) * 111000; // Conversion approximative en mètres
  }
}

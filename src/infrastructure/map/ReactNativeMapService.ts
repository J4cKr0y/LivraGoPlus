import { IMapService } from '../../core/interfaces/IMapService';
import { GeoCoordinate } from '../../core/domain/Location';
import { Linking, Platform } from 'react-native';

export class ReactNativeMapService implements IMapService {
  /**
   * Cette méthode permet d'ouvrir l'application de navigation native 
   * (Google Maps ou Apple Maps) pour guider le livreur.
   */
  async openNavigation(target: GeoCoordinate): Promise<void> {
    const { latitude, longitude } = target;
    
    // Format d'URL différent selon la plateforme
    const scheme = Platform.select({
      ios: `maps:0,0?q=`,
      android: `geo:0,0?q=`,
    });
    
    const latLng = `${latitude},${longitude}`;
    const label = 'Destination Livraison';
    
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.error("Impossible d'ouvrir l'application de cartographie");
      }
    }
  }
}

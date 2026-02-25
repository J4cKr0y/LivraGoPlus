import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useServices } from '../../../core/di/ServiceContext';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/AppNavigator';

export const DeliveryMapScreen = () => {
  const { mapService } = useServices();
  const route = useRoute<RouteProp<RootStackParamList, 'DeliveryMap'>>();
  
  // Simulation de coordonnées pour l'exemple (Toulon)
  // Plus tard, on récupérera les coordonnées stockées dans la livraison
  const destination = {
    latitude: 43.6669,
    longitude: 5.93333,
  };

  const handleNavigate = () => {
    mapService.openExternalNavigation(destination);
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          ...destination,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker 
            coordinate={destination} 
            title="Point de livraison"
            description="L'adresse scannée apparaîtra ici"
        />
      </MapView>

      <View style={styles.overlay}>
        <Text style={styles.addressText}>ID: {route.params.deliveryId}</Text>
        <Button title="Lancer le guidage GPS" onPress={handleNavigate} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
  map: { ...StyleSheet.absoluteFillObject },
  overlay: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    elevation: 5,
  },
  addressText: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 }
});

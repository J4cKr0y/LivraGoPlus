import React, { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useServices, ServiceProvider } from './src/core/di/ServiceContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DeliveryListScreen } from './src/features/deliveries/screens/DeliveryListScreen';
import { DeliveryMapScreen } from './src/features/deliveries/screens/DeliveryMapScreen';
import { ScanScreen } from './src/features/deliveries/screens/ScanScreen';
import { DeliveryDetailScreen } from './src/features/deliveries/screens/DeliveryDetailScreen';

const Stack = createNativeStackNavigator();

// Composant interne qui bénéficie du ServiceProvider
function AppContent() {
  const { syncService } = useServices();

  useEffect(() => {
    // 1. On lance une synchronisation au démarrage de l'application
    syncService.syncPendingDeliveries();

    // 2. On s'abonne aux changements de réseau
    const unsubscribe = NetInfo.addEventListener(state => {
      // Dès que le téléphone capte à nouveau internet (4G/Wifi), on déclenche la boucle
      if (state.isConnected && state.isInternetReachable) {
        syncService.syncPendingDeliveries();
      }
    });

    // Nettoyage de l'écouteur quand l'application se ferme
    return () => unsubscribe();
  }, [syncService]);
  
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="DeliveryList">

        {/* Liste des livraisons */}
        <Stack.Screen 
          name="DeliveryList" 
          component={DeliveryListScreen} 
          options={{ title: 'Mes Livraisons' }}
        />

        {/* Validation */}
        <Stack.Screen 
          name="DeliveryDetail" 
          component={DeliveryDetailScreen} 
          options={{ title: 'Valider la livraison' }}
        />

        {/* Détails de livraison */}
        <Stack.Screen 
          name="DeliveryMap" 
          component={DeliveryMapScreen} 
          options={{ title: 'Détails de livraison' }}
        />
        
        {/* écran de Scan */}
        <Stack.Screen 
          name="Scan" 
          component={ScanScreen} 
          options={{ 
            title: 'Scanner un colis',
            headerTransparent: true, // Pour que la caméra soit en plein écran derrière le titre
            headerTintColor: '#fff'  // Titre en blanc pour qu'il soit lisible sur la caméra
          }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Point d'entrée principal de l'application
export default function App() {
  return (
    <ServiceProvider>
      <AppContent />
    </ServiceProvider>
  );
}
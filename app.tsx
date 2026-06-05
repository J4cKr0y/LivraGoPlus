import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ServiceProvider } from './src/core/di/ServiceContext';
import { DeliveryListScreen } from './src/features/deliveries/screens/DeliveryListScreen';
import { DeliveryMapScreen } from './src/features/deliveries/screens/DeliveryMapScreen';
import { ScanScreen } from './src/features/deliveries/screens/ScanScreen';
import { DeliveryDetailScreen } from './src/features/deliveries/screens/DeliveryDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ServiceProvider>
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
    </ServiceProvider>
  );
}
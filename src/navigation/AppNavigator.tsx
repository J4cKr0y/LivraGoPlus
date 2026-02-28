import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DeliveryListScreen } from '../features/deliveries/screens/DeliveryListScreen';
import { DeliveryMapScreen } from '../features/deliveries/screens/DeliveryMapScreen';
import { ScanScreen } from '../features/deliveries/screens/ScanScreen';

// 1. Définition des types de routes (utile pour TypeScript)
export type RootStackParamList = {
  DeliveryList: undefined; // Pas de paramètres pour la liste
  DeliveryMap: { deliveryId: string }; // On passera l'ID pour la carte (futur)
  Scan: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="DeliveryList">
        <Stack.Screen 
          name="DeliveryList" 
          component={DeliveryListScreen} 
          options={{ title: 'Mes Livraisons', headerShown: false }} 
        />

<Stack.Screen 
  name="DeliveryMap" 
  component={DeliveryMapScreen} 
  options={{ title: 'Carte & Itinéraire' }} 
/>

<Stack.Screen 
          name="Scan" 
          component={ScanScreen} 
          options={{ title: 'Scanner une étiquette' }} 
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

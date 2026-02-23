import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DeliveryListScreen } from '../features/deliveries/screens/DeliveryListScreen';

// 1. Définition des types de routes (utile pour TypeScript)
export type RootStackParamList = {
  DeliveryList: undefined; // Pas de paramètres pour la liste
  DeliveryMap: { deliveryId: string }; // On passera l'ID pour la carte (futur)
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
        {/* On ajoutera l'écran Map ici plus tard */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

import React from 'react';
import { ServiceProvider } from './src/core/di/ServiceContext';
import { DeliveryListScreen } from './src/features/deliveries/screens/DeliveryListScreen';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    // 1. On injecte les dépendances
    <ServiceProvider>
      {/* 2. On affiche l'écran (plus tard ici il y aura la Navigation) */}
      <DeliveryListScreen />
      <StatusBar style="auto" />
    </ServiceProvider>
  );
}

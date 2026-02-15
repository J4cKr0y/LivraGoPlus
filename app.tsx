import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ServiceProvider } from './src/core/di/ServiceContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    // 1. Le Provider pour les SafeAreas (encoches, etc.)
    <SafeAreaProvider>
      {/* 2. L'injection de dépendances (Database, OCR) */}
      <ServiceProvider>
        {/* 3. La Navigation */}
        <AppNavigator />
        <StatusBar style="auto" />
      </ServiceProvider>
    </SafeAreaProvider>
  );
}

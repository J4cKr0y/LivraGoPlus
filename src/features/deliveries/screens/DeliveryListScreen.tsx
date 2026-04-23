import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import * as Location from 'expo-location';
import { useServices } from '../../../core/di/ServiceContext';
import { Delivery } from '../../deliveries/domain/Delivery';

// --- ZUSTAND ---
import { useDeliveryStore } from '../store/useDeliveryStore';

export const DeliveryListScreen = ({ navigation }: any) => {
  const { deliveryService, routeOptimizer } = useServices(); 
  
  // --- STORE ZUSTAND ---
  const { deliveries, isLoading, fetchDeliveries, setOptimizedDeliveries } = useDeliveryStore();
  const [isOptimizing, setIsOptimizing] = useState(false);

  // On ne garde que les livraisons non effectuées
  const activeDeliveries = deliveries.filter(d => d.status !== 'DELIVERED');

  // Chargement initial UNIQUE
  useEffect(() => {
    fetchDeliveries(deliveryService);
  }, []);

  // --- OPTIMISATION DE TOURNÉE ---
  const handleOptimizeRoute = async () => {
    if (activeDeliveries.length === 0) return;

    setIsOptimizing(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission requise", "Activez le GPS pour optimiser votre tournée.");
        setIsOptimizing(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      
      const currentPos = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };

      const optimizedList = await routeOptimizer.optimizeTour(currentPos, activeDeliveries);

      // --- Mise à jour propre via Zustand ---
      setOptimizedDeliveries(optimizedList);

    } catch (error) {
      console.error("Erreur d'optimisation :", error);
      Alert.alert("Erreur", "Impossible de calculer la tournée optimale.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // --- Rendu d'une carte ---
  const renderItem = ({ item, index }: { item: Delivery, index: number }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('DeliveryDetail', { deliveryId: item.id })}
    >
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>{index + 1}</Text>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.addressText}>{item.address.fullText}</Text>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>

      <TouchableOpacity 
        style={styles.mapIconButton}
        onPress={() => navigation.navigate('DeliveryMap', { id: item.id })}
      >
        <Text style={styles.mapIconText}>🗺️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.optimizeButton, isOptimizing && styles.optimizeButtonDisabled]} 
          onPress={handleOptimizeRoute}
          disabled={isOptimizing}
        >
          {isOptimizing ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.optimizeButtonText}>📍 OPTIMISER MA TOURNÉE</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeDeliveries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucune livraison en cours.</Text>}
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('Scan')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 15, backgroundColor: '#FFF', elevation: 2, zIndex: 1 },

  optimizeButton: {
    backgroundColor: '#1D3557',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optimizeButtonDisabled: { backgroundColor: '#A8B2C1' },
  optimizeButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },

  listContainer: { padding: 15, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  badgeText: { color: '#FFF', fontWeight: 'bold' },
  cardContent: { flex: 1 },
  addressText: { fontSize: 16, fontWeight: '600', color: '#333' },
  statusText: { fontSize: 12, color: '#888', marginTop: 4 },

  mapIconButton: {
    padding: 10,
    backgroundColor: '#E8EDF2',
    borderRadius: 8,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapIconText: { fontSize: 20 },

  emptyText: { textAlign: 'center', color: '#888', marginTop: 40 },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fabIcon: { color: '#FFF', fontSize: 30, fontWeight: 'bold' }
});
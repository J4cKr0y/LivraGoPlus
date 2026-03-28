// src/features/deliveries/screens/DeliveryListScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useServices } from '../../../core/di/ServiceContext';
import { Delivery } from '../../../core/domain/Delivery';
import { useNavigation } from '@react-navigation/native';

// Sous-composant pour l'affichage UX optimisé
const DeliveryCard = ({ item, onPress }: { item: Delivery, onPress: () => void }) => (
  <TouchableOpacity 
    style={styles.card} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.cardContent}>
      <View style={[styles.statusBadge, item.status === 'DELIVERED' && styles.statusBadgeSuccess]}>
        <Text style={styles.statusText}>{item.status === 'PENDING' ? '⏳ À LIVRER' : '✅ LIVRÉ'}</Text>
      </View>
      <Text style={styles.addressText} numberOfLines={2}>
        {item.address.fullText}
      </Text>
    </View>
    <View style={styles.arrowContainer}>
      <Text style={styles.arrow}>〉</Text>
    </View>
  </TouchableOpacity>
);

// Composant Principal Exporté
export const DeliveryListScreen = () => {
  const navigation = useNavigation<any>();
  const { deliveryService } = useServices();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await deliveryService.getDeliveries();
      setDeliveries(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Tournées</Text>
      </View>

      <FlatList
        data={deliveries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>Aucune livraison en cours.</Text> : null
        }
        renderItem={({ item }) => (
          <DeliveryCard 
            item={item} 
            onPress={() => navigation.navigate('DeliveryMap', { deliveryId: item.id })}
          />
        )}
      />

      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator size="large" color="#FF8C00" />
        ) : (
          <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate('Scan')}>
            <Text style={styles.scanButtonText}>📷 SCANNER UN COLIS</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
  listContent: { padding: 16 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888' },
  
  // Design de la carte "Pouce engourdi"
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: 'row',
    minHeight: 100,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  cardContent: { flex: 1, padding: 16, justifyContent: 'center' },
  statusBadge: {
    backgroundColor: '#FF8C00', // Orange
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  statusBadgeSuccess: {
    backgroundColor: '#2E7D32', // Vert
  },
  statusText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  addressText: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  arrowContainer: { justifyContent: 'center', paddingRight: 16 },
  arrow: { fontSize: 24, color: '#CCC' },
  
  // Bouton de scan Footer
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  scanButton: {
    backgroundColor: '#FF8C00',
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonText: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
});
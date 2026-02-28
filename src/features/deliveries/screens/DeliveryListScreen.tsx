import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useServices } from '../../../core/di/ServiceContext';
import { Delivery } from '../../../core/domain/Delivery';
import { useNavigation } from '@react-navigation/native';

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

  // Recharger la liste au montage ET quand on revient de l'écran Scan
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
          <TouchableOpacity 
            onPress={() => navigation.navigate('DeliveryMap', { deliveryId: item.id })}
            testID={`delivery-item-${item.id}`}
          >
            <View style={styles.card}>
              <Text style={styles.cardAddress}>{item.address.fullText}</Text>
              <Text style={styles.cardStatus}>Status: {item.status}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Button 
            title="📷 Scanner un colis" 
            onPress={() => navigation.navigate('Scan')} 
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold' },
  listContent: { padding: 16 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888' },
  card: { backgroundColor: '#fff', padding: 16, marginBottom: 12, borderRadius: 8, elevation: 2 },
  cardAddress: { fontSize: 16, marginBottom: 8 },
  cardStatus: { fontSize: 14, color: '#666' },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' }
});

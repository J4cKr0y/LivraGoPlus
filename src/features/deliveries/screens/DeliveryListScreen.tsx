import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useServices } from '../../../core/di/ServiceContext';
import { Delivery } from '../../../core/domain/Delivery';
import { useNavigation } from '@react-navigation/native'; 
import { TouchableOpacity } from 'react-native';

export const DeliveryListScreen = () => {
  const navigation = useNavigation<any>(); // On récupère l'objet navigation
  const { deliveryService } = useServices(); // On récupère notre service injecté
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);

  // Fonction pour charger les données
  const loadData = async () => {
    const data = await deliveryService.getDeliveries();
    setDeliveries(data); // Met à jour l'UI
  };

  // Chargement initial
  useEffect(() => {
    loadData();
  }, []);

  // Action : Simuler un scan
  const handleScanPress = async () => {
    setLoading(true);
    try {
      // Simule la prise de photo (uri fictive)
      await deliveryService.addDeliveryFromScan('fake-camera-uri');
      // Recharge la liste après l'ajout
      await loadData(); 
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LivraGoPlus 📦</Text>
      </View>

      <FlatList
        data={deliveries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucune livraison scanée.</Text>}
        
renderItem={({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('DeliveryMap', { deliveryId: item.id })}
      testID={`delivery-item-${item.id}`} // Optionnel, aide pour les tests
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
          <Button title="📷 Scanner une adresse (Simul)" onPress={handleScanPress} />
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
  cardAddress: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardStatus: { fontSize: 12, color: '#666' },
  cardSync: { fontSize: 10, color: '#999', marginTop: 4 },
  footer: { padding: 16, backgroundColor: '#fff' },
});

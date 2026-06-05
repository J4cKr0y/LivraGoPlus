import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useServices } from '../../../core/di/ServiceContext';
import { Delivery } from '../../../core/domain/Delivery';

export const DeliveryMapScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { deliveryService } = useServices();
  const [delivery, setDelivery] = useState<Delivery | null>(null);

  const { deliveryId } = route.params;

  const loadDelivery = async () => {
    try {
      // Utilisation de getById (cohérent avec SQLiteDeliveryRepository)
      const data = await deliveryService.getById(deliveryId); 
      setDelivery(data);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger la livraison.");
    }
  };

  useEffect(() => {
    loadDelivery();
  }, [deliveryId]);

  const handleTakeProofPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', "L'accès à la caméra est nécessaire.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const photoUri = result.assets[0].uri;
      try {
        await deliveryService.validateDelivery(deliveryId, photoUri);
        Alert.alert("Succès", "La livraison a été validée !");
        navigation.goBack();
      } catch (error) {
        Alert.alert("Erreur", "La validation a échoué.");
      }
    }
  };

  if (!delivery) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoSection}>
        <Text style={styles.addressTitle}>Destination</Text>
        <Text style={styles.addressText}>{delivery.address.fullText}</Text>
      </View>

      <View style={styles.photoSection}>
        {delivery.status === 'DELIVERED' && delivery.proofOfDeliveryUri ? (
          <Image source={{ uri: delivery.proofOfDeliveryUri }} style={styles.proofImage} />
        ) : (
          <Text style={styles.placeholderText}>En attente de livraison...</Text>
        )}
      </View>

      <View style={styles.footer}>
        {delivery.status === 'PENDING' ? (
          <TouchableOpacity 
            style={styles.massiveButton} 
            onPress={handleTakeProofPhoto}
          >
            <Text style={styles.buttonText}>📸 VALIDER LA LIVRAISON</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.massiveButton, styles.buttonSuccess]}>
            <Text style={styles.buttonText}>✅ COLIS LIVRÉ</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  infoSection: {
    backgroundColor: '#1D3557',
    padding: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  addressTitle: { color: '#A8DADC', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase' },
  addressText: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginTop: 8 },
  photoSection: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  placeholderText: { color: '#888', fontSize: 16, fontStyle: 'italic' },
  proofImage: { width: '100%', height: '100%', borderRadius: 12, resizeMode: 'cover' },
  footer: { padding: 16, paddingBottom: 32, backgroundColor: '#FFFFFF' },
  massiveButton: {
    height: 80,
    backgroundColor: '#FF8C00',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  buttonSuccess: { backgroundColor: '#2E7D32' },
  buttonText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
});
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useServices } from '../../../core/di/ServiceContext';
import * as ImagePicker from 'expo-image-picker';
import SignatureScreen from 'react-native-signature-canvas';
import * as SMS from 'expo-sms';
import { useDeliveryStore } from '../store/useDeliveryStore';

export const DeliveryDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { deliveryId } = route.params;
  const { deliveryService } = useServices();

  // --- 1. RÉCUPÉRATION DE LA LIVRAISON DEPUIS ZUSTAND ---
  const { deliveries, validateDelivery } = useDeliveryStore();
  const delivery = deliveries.find(d => d.id === deliveryId);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  // --- 2. FONCTION DE GUIDAGE GPS ---
  const handleOpenGPS = async () => {
    if (!delivery?.address.coordinates) {
      Alert.alert('Erreur', "Les coordonnées GPS ne sont pas disponibles pour cette adresse.");
      return;
    }

    const { latitude, longitude } = delivery.address.coordinates;
    const label = encodeURIComponent(delivery.address.fullText);

  // Les schémas officiels les plus fiables :
  const wazeUrl = `waze://?ll=${latitude},${longitude}&navigate=yes`;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  const appleMapsUrl = `maps://?daddr=${latitude},${longitude}`;

    try {
      const canOpenWaze = await Linking.canOpenURL(wazeUrl);
      if (canOpenWaze) {
        await Linking.openURL(wazeUrl);
      } else {
        const defaultGpsUrl = Platform.OS === 'ios' ? appleMapsUrl : googleMapsUrl;
        await Linking.openURL(defaultGpsUrl);
      }
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'ouvrir une application GPS.");
    }
  };

  // --- 3. ENVOI SMS AU CLIENT ---
  const handleSendSMS = async () => {
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Erreur', "L'envoi de SMS n'est pas disponible sur cet appareil.");
      return;
    }

    const phoneNumber = delivery?.customer?.phone;
    if (!phoneNumber) {
      Alert.alert('Erreur', 'Aucun numéro de téléphone disponible pour ce client.');
      return;
    }

    const message = `Bonjour, votre livreur est en route et arrivera bientôt à votre adresse : ${delivery?.address.fullText}. Merci !`;

    await SMS.sendSMSAsync([phoneNumber], message);
  };

  // --- 4. OPTION A : LA PHOTO (Client absent) ---
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission', "Il nous faut la caméra pour prendre la photo !");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.5,
    });

    if (!result.canceled) {
      saveValidation(result.assets[0].uri);
    }
  };

  // --- 5. OPTION B : LA SIGNATURE (Remise en main propre) ---
  const handleSignatureOK = (signatureBase64: string) => {
    setShowSignatureModal(false);
    saveValidation(signatureBase64);
  };

  // --- 6. SAUVEGARDE FINALE ---
  const saveValidation = async (proofUri: string) => {
    setIsProcessing(true);
    try {
      await deliveryService.validateDelivery(deliveryId, proofUri);
      Alert.alert('Succès', 'Livraison validée avec succès ! 🎉');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de valider la livraison.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  if (!delivery) {
    return (
      <View style={styles.centered}>
        <Text>Livraison introuvable</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Carte d'informations */}
      <View style={styles.infoCard}>
        <Text style={styles.title}>Détails de la livraison</Text>
        <Text style={styles.subtitle}>{delivery.address.fullText}</Text>
      </View>

      {/* Bouton GPS */}
      <TouchableOpacity style={styles.gpsButton} onPress={handleOpenGPS}>
        <Text style={styles.gpsButtonText}>📍 Lancer le guidage GPS</Text>
      </TouchableOpacity>

      {/* Bouton SMS */}
      <TouchableOpacity style={styles.smsButton} onPress={handleSendSMS}>
        <Text style={styles.smsButtonText}>💬 Avertir le client de mon arrivée</Text>
      </TouchableOpacity>

      <Text style={styles.questionText}>Comment avez-vous livré ce colis ?</Text>

      {/* Bouton Signature */}
      <TouchableOpacity
        style={[styles.actionButton, styles.signatureButton]}
        onPress={() => setShowSignatureModal(true)}
      >
        <Text style={styles.actionButtonText}>✍️ Remise en main propre</Text>
        <Text style={styles.actionButtonSub}>Faire signer le client</Text>
      </TouchableOpacity>

      {/* Bouton Photo */}
      <TouchableOpacity
        style={[styles.actionButton, styles.photoButton]}
        onPress={handleTakePhoto}
      >
        <Text style={styles.actionButtonText}>📸 Déposé en lieu sûr</Text>
        <Text style={styles.actionButtonSub}>Prendre le colis en photo</Text>
      </TouchableOpacity>

      {/* Modal de Signature */}
      <Modal visible={showSignatureModal} animationType="slide" presentationStyle="formSheet">
        <View style={styles.signatureContainer}>
          <Text style={styles.signatureTitle}>Signature du client</Text>
          <View style={styles.canvasWrapper}>
            <SignatureScreen
              onOK={handleSignatureOK}
              onEmpty={() => Alert.alert('Attention', 'La signature est vide.')}
              clearText="Effacer"
              confirmText="Valider"
              descriptionText="Signez ci-dessus"
              webStyle={`.m-signature-pad {box-shadow: none; border: none;}`}
            />
          </View>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowSignatureModal(false)}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8', padding: 20, justifyContent: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Info card
  infoCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 10, marginBottom: 20, elevation: 2 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#888', marginTop: 5 },

  // GPS button
  gpsButton: {
    backgroundColor: '#2A9D8F',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 3,
  },
  gpsButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  // SMS button
  smsButton: {
    backgroundColor: '#457B9D',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 3,
  },
  smsButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  // Question
  questionText: { fontSize: 18, fontWeight: '600', marginBottom: 20, textAlign: 'center', color: '#1D3557' },

  // Action buttons
  actionButton: { padding: 20, borderRadius: 12, marginBottom: 15, alignItems: 'center', elevation: 3 },
  signatureButton: { backgroundColor: '#1D3557' },
  photoButton: { backgroundColor: '#FF8C00' },
  actionButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  actionButtonSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 5 },

  // Signature modal
  signatureContainer: { flex: 1, backgroundColor: '#FFF', padding: 20, paddingTop: 50 },
  signatureTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  canvasWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cancelButton: { padding: 15, alignItems: 'center', marginBottom: 20 },
  cancelButtonText: { color: 'red', fontSize: 16, fontWeight: 'bold' },
});

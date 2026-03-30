import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useServices } from '../../../core/di/ServiceContext';
import * as ImagePicker from 'expo-image-picker';
import SignatureScreen from 'react-native-signature-canvas';

export const DeliveryDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { deliveryId } = route.params; // On récupère l'ID passé par la liste
  const { deliveryService } = useServices();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  // --- OPTION A : LA PHOTO (Client absent) ---
  const handleTakePhoto = async () => {
    // On demande la permission pour l'appareil photo si besoin
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission", "Il nous faut la caméra pour prendre la photo !");
      return;
    }

    // On ouvre l'appareil photo natif du téléphone
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.5, // Pas besoin de 4K pour un carton
    });

    if (!result.canceled) {
      saveValidation(result.assets[0].uri);
    }
  };

  // --- OPTION B : LA SIGNATURE (Remise en main propre) ---
  const handleSignatureOK = (signatureBase64: string) => {
    setShowSignatureModal(false);
    saveValidation(signatureBase64); // Le composant renvoie l'image en base64
  };

  // --- SAUVEGARDE FINALE ---
  const saveValidation = async (proofUri: string) => {
    setIsProcessing(true);
    try {
      await deliveryService.validateDelivery(deliveryId, proofUri);
      Alert.alert("Succès", "Livraison validée avec succès ! 🎉");
      navigation.goBack(); // On retourne à la liste
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de valider la livraison.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#FF8C00" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoCard}>
        <Text style={styles.title}>Valider la livraison</Text>
        <Text style={styles.subtitle}>ID: {deliveryId}</Text>
        {/* Tu peux afficher l'adresse ici en allant chercher l'objet Delivery */}
      </View>

      <Text style={styles.questionText}>Comment avez-vous livré ce colis ?</Text>

      {/* Bouton Signature */}
      <TouchableOpacity style={[styles.actionButton, styles.signatureButton]} onPress={() => setShowSignatureModal(true)}>
        <Text style={styles.actionButtonText}>✍️ Remise en main propre</Text>
        <Text style={styles.actionButtonSub}>Faire signer le client</Text>
      </TouchableOpacity>

      {/* Bouton Photo */}
      <TouchableOpacity style={[styles.actionButton, styles.photoButton]} onPress={handleTakePhoto}>
        <Text style={styles.actionButtonText}>📸 Déposé en lieu sûr</Text>
        <Text style={styles.actionButtonSub}>Prendre le colis en photo</Text>
      </TouchableOpacity>

      {/* Le Modal de Signature */}
      <Modal visible={showSignatureModal} animationType="slide" presentationStyle="formSheet">
        <View style={styles.signatureContainer}>
          <Text style={styles.signatureTitle}>Signature du client</Text>
          <View style={styles.canvasWrapper}>
            <SignatureScreen
              onOK={handleSignatureOK}
              onEmpty={() => Alert.alert("Attention", "La signature est vide.")}
              clearText="Effacer"
              confirmText="Valider"
              descriptionText="Signez ci-dessus"
              webStyle={`.m-signature-pad {box-shadow: none; border: none;}`}
            />
          </View>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setShowSignatureModal(false)}>
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
  infoCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 10, marginBottom: 30, elevation: 2 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#888', marginTop: 5 },
  questionText: { fontSize: 18, fontWeight: '600', marginBottom: 20, textAlign: 'center', color: '#1D3557' },
  
  actionButton: { padding: 20, borderRadius: 12, marginBottom: 15, alignItems: 'center', elevation: 3 },
  signatureButton: { backgroundColor: '#1D3557' },
  photoButton: { backgroundColor: '#FF8C00' },
  actionButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  actionButtonSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 5 },

  // Styles Signature
  signatureContainer: { flex: 1, backgroundColor: '#FFF', padding: 20, paddingTop: 50 },
  signatureTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  canvasWrapper: { flex: 1, borderWidth: 1, borderColor: '#CCC', borderRadius: 10, overflow: 'hidden', marginBottom: 20 },
  cancelButton: { padding: 15, alignItems: 'center', marginBottom: 20 },
  cancelButtonText: { color: 'red', fontSize: 16, fontWeight: 'bold' }
});

import React, { useRef, useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Modal, 
  TextInput 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { useServices } from '../../../core/di/ServiceContext';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

export const ScanScreen = () => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const navigation = useNavigation<any>();
  const { deliveryService } = useServices();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  // --- 1. Séquençage des permissions au chargement ---
  useEffect(() => {
    const askPermissionsSequentially = async () => {
      // 1. On demande le GPS d'abord
      await Location.requestForegroundPermissionsAsync();

      // 2. Ensuite, on vérifie la caméra
      // Si on n'a pas la permission, on la demande et on attend la réponse
      if (!cameraPermission || !cameraPermission.granted) {
        // requestCameraPermission retourne le nouveau statut !
        const newCameraStatus = await requestCameraPermission();
        
        // Optionnel : si on veut gérer le cas où il refuse la caméra ici
        if (!newCameraStatus.granted) {
          console.log("L'utilisateur a refusé la caméra.");
        }
      }
    };

    askPermissionsSequentially();
  }, []); 

  if (!cameraPermission) return <View style={styles.container}><ActivityIndicator size="large" /></View>;

  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>L'accès à la caméra est requis.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={requestCameraPermission}>
            <Text style={styles.retryButtonText}>Autoriser la caméra</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Fonction pour traiter une image (qu'elle vienne de la caméra ou galerie)
  const processImage = async (uri: string) => {
    setIsProcessing(true);
    try {
      // On utilise la nouvelle méthode extractAddressTextFromImage de ton service
      const text = await deliveryService.extractAddressTextFromImage(uri);
      
      if (text) {
        await deliveryService.saveTypedAddress(text);
        navigation.goBack();
      } else {
        // Si l'OCR ne trouve rien, on propose les alternatives
        setIsProcessing(false);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      setShowErrorModal(true);
    }
  };

  // Prendre une photo
  const takePicture = async () => {
    if (cameraRef.current && !isProcessing) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      if (photo) processImage(photo.uri);
    }
  };

  // Choisir dans la galerie (Plan B)
  const pickImage = async () => {
    setShowErrorModal(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled) {
      processImage(result.assets[0].uri);
    }
  };

  // Valider la saisie manuelle (Plan C)
  const handleManualSubmit = async () => {
    if (manualAddress.length < 5) {
      Alert.alert("Erreur", "L'adresse est trop courte.");
      return;
    }
    setIsProcessing(true);
    try {
      await deliveryService.saveTypedAddress(manualAddress);
      setShowManualModal(false);
      navigation.goBack();
    } catch (e) {
      Alert.alert("Erreur", "Impossible de géocoder cette adresse.");
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef}>
        <View style={styles.overlay}>
          {isProcessing ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#FF8C00" />
              <Text style={styles.loaderText}>Traitement en cours...</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureInnerButton} />
            </TouchableOpacity>
          )}
        </View>
      </CameraView>

      {/* Modal d'échec OCR : Propose Galerie ou Manuel */}
      <Modal visible={showErrorModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adresse non détectée</Text>
            <Text style={styles.modalText}>Nous n'avons pas pu lire l'étiquette. Que voulez-vous faire ?</Text>
            
            <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
              <Text style={styles.modalButtonText}>Choisir une photo (Galerie)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalButton} onPress={() => { setShowErrorModal(false); setShowManualModal(true); }}>
              <Text style={styles.modalButtonText}>Saisir manuellement</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ccc' }]} onPress={() => setShowErrorModal(false)}>
              <Text style={styles.modalButtonText}>Réessayer le scan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Saisie Manuelle */}
      <Modal visible={showManualModal} animationType="slide">
        <View style={styles.manualContainer}>
          <Text style={styles.manualTitle}>Saisie manuelle</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez l'adresse complète..."
            value={manualAddress}
            onChangeText={setManualAddress}
            multiline
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleManualSubmit}>
            <Text style={styles.submitButtonText}>Valider la livraison</Text>
          </TouchableOpacity>
          <Button title="Annuler" color="red" onPress={() => setShowManualModal(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderContainer: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 20, borderRadius: 10, alignItems: 'center' },
  loaderText: { color: '#fff', marginTop: 10 },
  captureButton: {
    position: 'absolute', bottom: 40, width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', justifyContent: 'center', alignItems: 'center',
  },
  captureInnerButton: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'white' },
  retryButton: { backgroundColor: '#FF8C00', padding: 15, borderRadius: 10 },
  retryButtonText: { color: '#fff', fontWeight: 'bold' },
  // Styles Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 25, borderRadius: 15, width: '85%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  modalText: { textAlign: 'center', marginBottom: 20, color: '#666' },
  modalButton: { backgroundColor: '#FF8C00', padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'center' },
  modalButtonText: { color: '#fff', fontWeight: 'bold' },
  // Styles Manuel
  manualContainer: { flex: 1, padding: 40, justifyContent: 'center', backgroundColor: '#fff' },
  manualTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 15, height: 100, textAlignVertical: 'top', marginBottom: 20 },
  submitButton: { backgroundColor: '#FF8C00', padding: 20, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

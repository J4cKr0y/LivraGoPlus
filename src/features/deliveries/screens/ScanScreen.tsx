import React, { useRef, useState, useEffect } from 'react'; // Ajout de useEffect
import { StyleSheet, Text, View, Button, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { useServices } from '../../../core/di/ServiceContext';
import * as Location from 'expo-location';

export const ScanScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const navigation = useNavigation<any>();
  const { deliveryService } = useServices();
  const [isProcessing, setIsProcessing] = useState(false);

  // --- 1. Demande des permissions au chargement de l'écran ---
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Permission refusée", 
          "L'accès au GPS est nécessaire pour localiser l'adresse du colis."
        );
      }
    })();
  }, []);

  // --- 2. Gestion de la caméra ---
  if (!permission) {
    return <View style={styles.container}><ActivityIndicator size="large" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>L'accès à la caméra est requis pour scanner les colis.</Text>
        <Button onPress={requestPermission} title="Autoriser la caméra" />
      </View>
    );
  }

  // --- 3. Capture et Traitement ---
  const takePicture = async () => {
    if (cameraRef.current && !isProcessing) {
      setIsProcessing(true);
      try {
        // On vérifie une dernière fois le GPS avant de traiter
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Erreur", "Le GPS n'est pas activé.");
          setIsProcessing(false);
          return;
        }

        const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
        
        if (photo) {
          // Appel au service (OCR + GÉO + SQLITE)
          await deliveryService.addDeliveryFromScan(photo.uri);
          navigation.goBack();
        }
      } catch (error) {
        console.error("Erreur scan :", error);
        Alert.alert("Erreur", "Le scan a échoué. Vérifiez votre connexion ou la clarté de l'image.");
        setIsProcessing(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef}>
        <View style={styles.overlay}>
          {isProcessing ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#FF8C00" />
              <Text style={styles.loaderText}>Analyse de l'étiquette...</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureInnerButton} />
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  text: { textAlign: 'center', color: '#fff', margin: 20 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderContainer: { backgroundColor: 'rgba(0,0,0,0.7)', padding: 20, borderRadius: 10, alignItems: 'center' },
  loaderText: { color: '#fff', marginTop: 10, fontWeight: 'bold' },
  captureButton: {
    position: 'absolute',
    bottom: 40,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInnerButton: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'white' }
});

import * as ImageManipulator from 'expo-image-manipulator';

export interface CompressedImageResult {
  uri: string;
  mimeType: string;
  extension: string;
}

/**
 * Compresse une photo locale (issue de la caméra) en vue de son upload vers le cloud.
 * Utilise un Feature Flag (EXPO_PUBLIC_WEBP_ENABLED) pour basculer entre WebP et JPEG.
 * * @param localUri L'URI locale du fichier (ex: file://...)
 * @returns Un objet contenant la nouvelle URI, le type MIME et l'extension.
 */
export async function compressDeliveryPhoto(localUri: string): Promise<CompressedImageResult> {
  // 1. Lecture de la variable d'environnement (false par défaut si non définie)
  const isWebpEnabled = process.env.EXPO_PUBLIC_WEBP_ENABLED === 'true';

  // 2. Détermination dynamique du format et des métadonnées
  const saveFormat = isWebpEnabled 
    ? ImageManipulator.SaveFormat.WEBP 
    : ImageManipulator.SaveFormat.JPEG;

  const mimeType = isWebpEnabled ? 'image/webp' : 'image/jpeg';
  const extension = isWebpEnabled ? 'webp' : 'jpg';

  // 3. Exécution de la manipulation d'image
  const result = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: 1024 } }], // Réduction de la résolution pour un bon compromis qualité/poids
    { 
      compress: 0.7, // 70% de qualité
      format: saveFormat 
    }
  );

  return {
    uri: result.uri,
    mimeType,
    extension
  };
}
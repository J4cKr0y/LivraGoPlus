import TextRecognition from '@react-native-ml-kit/text-recognition';
import { IOcrService } from '../../core/interfaces/IOcrService';

export class MlKitOcrService implements IOcrService {
  async extractTextFromImage(imageUri: string): Promise<{ rawText: string }> {
    try {
      console.log("OCR Local en cours...");
      
      // ML Kit traite l'image directement depuis l'URI locale
      const result = await TextRecognition.recognize(imageUri);

      // On récupère tout le texte détecté
      // ML Kit nous donne même les blocs, lignes et mots si on veut être plus précis plus tard
      const fullText = result.text;

      console.log("Texte extrait localement :", fullText);

      return {
        rawText: fullText || "Aucun texte détecté"
      };
    } catch (error) {
      console.error("Erreur ML Kit OCR :", error);
      return { rawText: "" };
    }
  }
}

export interface OcrResult {
  rawText: string;
  detectedPhoneNumbers: string[]; // MLKit peut souvent détecter les numéros
  confidence: number;
}

export interface IOcrService {
  // Prend le chemin d'une image et retourne le texte extrait
  extractTextFromImage(imageUri: string): Promise<OcrResult>;
}

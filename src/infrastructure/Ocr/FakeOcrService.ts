import { IOcrService, OcrResult } from '../../core/interfaces/IOcrService';

export class FakeOcrService implements IOcrService {
  // On peut configurer ce que le fake va retourner pour tester différents cas
  private resultToReturn: OcrResult;

  constructor(mockText: string = "Fake Address Result") {
    this.resultToReturn = {
      rawText: mockText,
      detectedPhoneNumbers: [],
      confidence: 0.99
    };
  }

  async extractTextFromImage(imageUri: string): Promise<OcrResult> {
    // Simule un petit délai comme un vrai OCR
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.resultToReturn), 10);
    });
  }
}

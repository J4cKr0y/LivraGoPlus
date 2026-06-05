import { compressDeliveryPhoto } from '../imageUtils';
import * as ImageManipulator from 'expo-image-manipulator';

// 1. On mock la librairie native Expo pour qu'elle ne s'exécute pas réellement pendant les tests
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    WEBP: 'webp',
    JPEG: 'jpeg',
  },
}));

describe('Utilitaires Image: compressDeliveryPhoto', () => {
  // On sauvegarde juste la variable spécifique
  const originalWebpEnabled = process.env.EXPO_PUBLIC_WEBP_ENABLED;

  beforeEach(() => {
    (ImageManipulator.manipulateAsync as jest.Mock).mockClear();
  });

  afterAll(() => {
    // On restaure la variable à la fin
    process.env.EXPO_PUBLIC_WEBP_ENABLED = originalWebpEnabled;
  });

  it('doit compresser la photo au format WEBP si le Feature Flag est "true"', async () => {
    // Arrange: On simule l'activation du WebP
    process.env.EXPO_PUBLIC_WEBP_ENABLED = 'true';
    const mockOriginalUri = 'file://fake-directory/original.png';
    const mockCompressedUri = 'file://fake-directory/compressed.webp';

    // On dit au mock quoi répondre quand il sera appelé
    (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
      uri: mockCompressedUri,
      width: 1024,
      height: 768,
    });

    // Act: On appelle notre fonction
    const result = await compressDeliveryPhoto(mockOriginalUri);

    // Assert: On vérifie que la librairie a été appelée avec les bons arguments WebP
    expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
      mockOriginalUri,
      [{ resize: { width: 1024 } }],
      { compress: 0.7, format: 'webp' }
    );

    // On vérifie le retour formaté de notre fonction
    expect(result).toEqual({
      uri: mockCompressedUri,
      mimeType: 'image/webp',
      extension: 'webp',
    });
  });

  it('doit compresser la photo au format JPEG si le Feature Flag est "false" ou absent', async () => {
    // Arrange: On simule la désactivation du WebP
    process.env.EXPO_PUBLIC_WEBP_ENABLED = 'false';
    const mockOriginalUri = 'file://fake-directory/original.png';
    const mockCompressedUri = 'file://fake-directory/compressed.jpg';

    (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
      uri: mockCompressedUri,
      width: 1024,
      height: 768,
    });

    // Act
    const result = await compressDeliveryPhoto(mockOriginalUri);

    // Assert: On vérifie que la librairie a été appelée avec les arguments JPEG
    expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
      mockOriginalUri,
      [{ resize: { width: 1024 } }],
      { compress: 0.7, format: 'jpeg' }
    );

    expect(result).toEqual({
      uri: mockCompressedUri,
      mimeType: 'image/jpeg',
      extension: 'jpg',
    });
  });
});
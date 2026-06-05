import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ScanScreen } from '../ScanScreen';

// 1. Mock de la navigation (On veut vérifier qu'on fait bien "goBack")
const mockedGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockedGoBack,
  }),
}));

// 2. Mock du Service Métier (On veut vérifier qu'on lui envoie bien l'image)
const mockExtractAddressTextFromImage = jest.fn().mockResolvedValue('123 Rue de la Paix');
const mockSaveTypedAddress = jest.fn().mockResolvedValue(true);

jest.mock('../../../../core/di/ServiceContext', () => ({
  useServices: () => ({
    deliveryService: {
      extractAddressTextFromImage: mockExtractAddressTextFromImage,
      saveTypedAddress: mockSaveTypedAddress,
    }
  })
}));

// 3. Mock de la Caméra Expo
jest.mock('expo-camera', () => {
  // On "importe" React localement dans le mock
  const ActualReact = require('react'); 

  return {
    useCameraPermissions: () => [{ granted: true }, jest.fn()],
    CameraView: ActualReact.forwardRef((props: any, ref: any) => {
      ActualReact.useImperativeHandle(ref, () => ({
        takePictureAsync: jest.fn().mockResolvedValue({ uri: 'file://fake-photo.jpg' })
      }));
      return <>{props.children}</>;
    })
  };
});

describe('ScanScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

it('should take a picture, call the delivery service, and go back', async () => {
    // 1. On utilise getByTestId pour trouver notre bouton de façon sûre
    const { getByTestId } = render(<ScanScreen />);

    const captureButton = getByTestId('capture-button'); 
    fireEvent.press(captureButton);

    await waitFor(() => {
      // On vérifie que la méthode d'extraction a bien été appelée avec la photo
      expect(mockExtractAddressTextFromImage).toHaveBeenCalledWith('file://fake-photo.jpg');
      // On vérifie que la sauvegarde a bien été appelée avec le texte extrait
      expect(mockSaveTypedAddress).toHaveBeenCalledWith('123 Rue de la Paix');
    });

    expect(mockedGoBack).toHaveBeenCalled();
  });
});
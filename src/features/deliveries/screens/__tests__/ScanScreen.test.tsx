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
const mockAddDeliveryFromScan = jest.fn();
jest.mock('../../../../core/di/ServiceContext', () => ({
  useServices: () => ({
    deliveryService: {
      addDeliveryFromScan: mockAddDeliveryFromScan,
    }
  })
}));

// 3. Mock de la Caméra Expo (Pour simuler la prise de photo)
jest.mock('expo-camera', () => ({
  // On simule que l'utilisateur a déjà donné la permission
  useCameraPermissions: () => [{ granted: true }, jest.fn()],
  // On crée un faux composant caméra qui transmet sa "ref"
  CameraView: React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      // C'est cette fonction qui est appelée quand on prend la photo !
      takePictureAsync: jest.fn().mockResolvedValue({ uri: 'file://fake-photo.jpg' })
    }));
    return <>{props.children}</>;
  })
}));

describe('ScanScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should take a picture, call the delivery service, and go back', async () => {
    const { getByRole } = render(<ScanScreen />);

    // 1. L'utilisateur appuie sur le bouton pour prendre la photo
    // On cherche le bouton par son rôle implicite (TouchableOpacity)
    const captureButton = getByRole('button'); 
    fireEvent.press(captureButton);

    // 2. On vérifie que le service a bien reçu l'URI de la photo générée par le mock
    await waitFor(() => {
      expect(mockAddDeliveryFromScan).toHaveBeenCalledWith('file://fake-photo.jpg');
    });

    // 3. On vérifie qu'après la sauvegarde, on retourne à la liste
    expect(mockedGoBack).toHaveBeenCalled();
  });
});

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
      expect(mockAddDeliveryFromScan).toHaveBeenCalledWith('file://fake-photo.jpg');
    });

    expect(mockedGoBack).toHaveBeenCalled();
  });
});
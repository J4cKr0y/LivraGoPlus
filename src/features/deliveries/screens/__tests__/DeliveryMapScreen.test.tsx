import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { DeliveryMapScreen } from '../DeliveryMapScreen';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Mocks
const mockedGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockedGoBack }),
  useRoute: () => ({ params: { deliveryId: 'del-123' } }),
}));

const mockGetById = jest.fn();
const mockValidateDelivery = jest.fn();
jest.mock('../../../../core/di/ServiceContext', () => ({
  useServices: () => ({
    deliveryService: {
      getById: mockGetById,
      validateDelivery: mockValidateDelivery,
    },
  }),
}));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('DeliveryMapScreen', () => {
  const deliveryData = {
    id: 'del-123',
    status: 'PENDING',
    address: { fullText: '10 Rue de la Paix, Paris' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait afficher les détails de la livraison', async () => {
    mockGetById.mockResolvedValueOnce(deliveryData);

    const { getByText } = render(<DeliveryMapScreen />);

    await waitFor(() => {
      expect(getByText(/10 Rue de la Paix/i)).toBeTruthy();
    });
  });

  it('devrait gérer le flux complet de validation', async () => {
    mockGetById.mockResolvedValueOnce(deliveryData);
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'granted' });
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file://photo.jpg' }],
    });
    mockValidateDelivery.mockResolvedValueOnce(undefined);

    const { getByText } = render(<DeliveryMapScreen />);

    const btn = await waitFor(() => getByText(/VALIDER LA LIVRAISON/i));
    fireEvent.press(btn);

    await waitFor(() => {
      expect(mockValidateDelivery).toHaveBeenCalledWith('del-123', 'file://photo.jpg');
      expect(mockedGoBack).toHaveBeenCalled();
    });
  });

  it('devrait afficher l’état livré si le statut est DELIVERED', async () => {
    mockGetById.mockResolvedValueOnce({ ...deliveryData, status: 'DELIVERED', proofOfDeliveryUri: 'uri' });

    const { getByText } = render(<DeliveryMapScreen />);

    await waitFor(() => {
      expect(getByText(/COLIS LIVRÉ/i)).toBeTruthy();
    });
  });
});
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { DeliveryListScreen } from '../DeliveryListScreen';

// 1. Mock de la navigation
const mockedNavigate = jest.fn();
const mockedAddListener = jest.fn().mockImplementation((event, callback) => {
  if (event === 'focus') { callback(); } // On simule le focus immédiat
  return jest.fn(); // unsubscribe function
});

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockedNavigate,
    addListener: mockedAddListener,
  }),
}));

// 2. Mock du ServiceContext pour contrôler les données affichées
const mockGetDeliveries = jest.fn();
jest.mock('../../../../core/di/ServiceContext', () => ({
  useServices: () => ({
    deliveryService: {
      getDeliveries: mockGetDeliveries,
    }
  })
}));

describe('DeliveryListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should navigate to Scan screen when scan button is pressed', async () => {
    mockGetDeliveries.mockResolvedValueOnce([]); // Liste vide pour ce test
    
    const { getByText, findByText } = render(<DeliveryListScreen />);

    // On attend que le chargement se termine
    const scanButton = await findByText('📷 Scanner un colis');
    
    fireEvent.press(scanButton);

    expect(mockedNavigate).toHaveBeenCalledWith('Scan');
  });

  it('should navigate to DeliveryMap when a delivery card is pressed', async () => {
    // On simule une livraison existante en base
    mockGetDeliveries.mockResolvedValueOnce([
      {
        id: '123-abc',
        status: 'PENDING',
        address: { fullText: '123 Avenue de la République' }
      }
    ]);

    const { findByText } = render(<DeliveryListScreen />);

    // On attend que la carte s'affiche
    const deliveryCard = await findByText(/123 Avenue de la République/);
    
    fireEvent.press(deliveryCard);

    expect(mockedNavigate).toHaveBeenCalledWith('DeliveryMap', {
      deliveryId: '123-abc'
    });
  });
});

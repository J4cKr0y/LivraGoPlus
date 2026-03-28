import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { DeliveryListScreen } from '../DeliveryListScreen';

const mockedNavigate = jest.fn();

// 1. On crée une variable pour stocker la fonction qui se déclenche au 'focus'
let focusCallback: (() => void) | null = null;
const mockedAddListener = jest.fn().mockImplementation((event, callback) => {
  if (event === 'focus') {
    focusCallback = callback;
  }
  return jest.fn(); 
});

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockedNavigate,
    addListener: mockedAddListener,
  }),
}));

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
    focusCallback = null; // On réinitialise à chaque test
  });

  it('should navigate to Scan screen when scan button is pressed', async () => {
    mockGetDeliveries.mockResolvedValueOnce([]); 
    
    const { getByText } = render(<DeliveryListScreen />);

    // 2. On simule l'arrivée sur l'écran proprement dans un "act"
    await act(async () => {
      if (focusCallback) await focusCallback();
    });

    await waitFor(() => {
        expect(getByText(/📷 SCANNER UN COLIS/i)).toBeTruthy();
    });
    
    const scanButton = getByText(/📷 SCANNER UN COLIS/i);
    fireEvent.press(scanButton);

    expect(mockedNavigate).toHaveBeenCalledWith('Scan');
  });

  it('should navigate to DeliveryMap when a delivery card is pressed', async () => {
    mockGetDeliveries.mockResolvedValueOnce([
      {
        id: '123-abc',
        status: 'PENDING',
        address: { fullText: '123 Avenue de la République' }
      }
    ]);

    const { getByText } = render(<DeliveryListScreen />);

    // 2. On simule l'arrivée sur l'écran proprement dans un "act"
    await act(async () => {
      if (focusCallback) await focusCallback();
    });

    await waitFor(() => {
        expect(getByText('123 Avenue de la République')).toBeTruthy();
    });

    const deliveryCard = getByText('123 Avenue de la République');
    fireEvent.press(deliveryCard);

    expect(mockedNavigate).toHaveBeenCalledWith('DeliveryMap', {
      deliveryId: '123-abc'
    });
  });
});

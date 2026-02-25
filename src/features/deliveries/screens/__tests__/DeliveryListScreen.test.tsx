import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { DeliveryListScreen } from '../DeliveryListScreen';
import { ServiceProvider } from '../../../../core/di/ServiceContext';

// 1. MOCK DE NAVIGATION
const mockedNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockedNavigate,
  }),
}));

// 2. MOCK DE EXPO-CRYPTO (C'est ce qui manquait !)
jest.mock('expo-crypto', () => ({
  randomUUID: () => 'uuid-test-123-456',
}));

const renderWithServices = (component: React.ReactElement) => {
  return render(
    <ServiceProvider>
      {component}
    </ServiceProvider>
  );
};

describe('DeliveryListScreen Navigation', () => {
  // On nettoie les mocks entre chaque test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should navigate to DeliveryMap when a delivery card is pressed', async () => {
    const { getByText, findByText } = renderWithServices(<DeliveryListScreen />);

    // Simuler le scan
    const scanButton = getByText('📷 Scanner une adresse (Simul)');
    fireEvent.press(scanButton);

    // Attendre l'apparition de la carte (l'ID sera maintenant 'uuid-test-123-456')
    const deliveryCard = await findByText(/123 Rue de la République/);

    // Act
    fireEvent.press(deliveryCard);

    // Assert
    expect(mockedNavigate).toHaveBeenCalledWith('DeliveryMap', {
      deliveryId: 'uuid-test-123-456'
    });
  });
});

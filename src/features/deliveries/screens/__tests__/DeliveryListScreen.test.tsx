import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { DeliveryListScreen } from '../DeliveryListScreen';
import { ServiceProvider } from '../../../../core/di/ServiceContext';

const mockedNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockedNavigate,
  }),
}));

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should navigate to DeliveryMap when a delivery card is pressed', async () => {
    const { getByText, findByText } = renderWithServices(<DeliveryListScreen />);

    const scanButton = getByText('📷 Scanner une adresse (Simul)');
    fireEvent.press(scanButton);

    // Correction : "Avenue" au lieu de "Rue" pour matcher AppDependencies.ts
    const deliveryCard = await findByText(/123 Avenue de la République/);

    fireEvent.press(deliveryCard);

    expect(mockedNavigate).toHaveBeenCalledWith('DeliveryMap', {
      deliveryId: 'uuid-test-123-456'
    });
  });
});

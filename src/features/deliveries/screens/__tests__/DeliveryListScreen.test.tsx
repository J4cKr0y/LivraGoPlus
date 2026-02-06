import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { DeliveryListScreen } from '../DeliveryListScreen';
import { ServiceProvider } from '../../../../core/di/ServiceContext';

// On enveloppe le composant dans le Provider pour qu'il ait accès aux services
const renderWithServices = (component: React.ReactElement) => {
  return render(
    <ServiceProvider>
      {component}
    </ServiceProvider>
  );
};

describe('DeliveryListScreen', () => {
  it('should display a scanned delivery after pressing the button', async () => {
    // 1. Render
    const { getByText, queryByText } = renderWithServices(<DeliveryListScreen />);

    // Vérifie qu'au début c'est vide
    expect(getByText('Aucune livraison scanée.')).toBeTruthy();

    // 2. Act : Appuyer sur le bouton Scan
    const scanButton = getByText('📷 Scanner une adresse (Simul)');
    fireEvent.press(scanButton);

    // 3. Assert : Attendre que l'adresse (définie dans AppDependencies/FakeOCR) apparaisse
    await waitFor(() => {
        // "123 Rue de la République" est le texte par défaut du FakeOcrService dans AppDependencies
      expect(queryByText(/123 Rue de la République/)).toBeTruthy();
    });
  });
});

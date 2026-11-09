// --- CES MOCKS DOIVENT ÊTRE EN PREMIER ---
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve('mocked-encryption-key')),
  setItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'mocked-uuid'),
}));

import { SQLiteDeliveryRepository } from '../SQLiteDeliveryRepository';
import * as SQLite from 'expo-sqlite';
import { Delivery } from '../../../core/domain/Delivery';

// Mock complet de expo-sqlite
jest.mock('expo-sqlite', () => {
  const mockDb = {
    execSync: jest.fn(),
    runAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
  };
  return {
    openDatabaseSync: jest.fn(() => mockDb),
  };
});

describe('SQLiteDeliveryRepository', () => {
  let repository: SQLiteDeliveryRepository;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // On récupère l'instance mockée de la DB pour espionner ses méthodes
    mockDb = SQLite.openDatabaseSync('dummy.db'); 
    repository = new SQLiteDeliveryRepository();
  });

  it('devrait créer la table à l\'initialisation', () => {
    expect(mockDb.execSync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS deliveries'));
  });

  it('devrait sauvegarder une livraison correctement (INSERT OR REPLACE)', async () => {
    const delivery: Delivery = {
      id: 'del-1',
      status: 'DELIVERED',
      address: { fullText: '123 Rue Fausse', coordinates: { latitude: 48.8, longitude: 2.3 } },
      proofOfDeliveryUri: 'file://proof.jpg',
      isSynced: true 
    };

    await repository.save(delivery);

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO deliveries'),
      [
        'del-1', 
        '123 Rue Fausse', 
        48.8, 
        2.3, 
        'DELIVERED', 
        'file://proof.jpg', 
        1, // isSynced (1 pour true)
        expect.any(String) // createdAt (Date ISO)
      ]
    );
  });

  it('devrait récupérer une livraison par son ID', async () => { 
    mockDb.getFirstAsync.mockResolvedValue({
      id: 'del-2',
      fullAddress: 'Avenue des Champs',
      latitude: 48.87,
      longitude: 2.30,
      status: 'PENDING',
      proofOfDeliveryUri: null,
      isSynced: 1
    });

    const result = await repository.getById('del-2');

    expect(mockDb.getFirstAsync).toHaveBeenCalledWith(expect.any(String), ['del-2']);
    expect(result).toEqual({
      id: 'del-2',
      status: 'PENDING',
      address: {
        fullText: 'Avenue des Champs',
        coordinates: { latitude: 48.87, longitude: 2.30 }
      }, 
      proofOfDeliveryUri: null,
      isSynced: true
    });
  });
});
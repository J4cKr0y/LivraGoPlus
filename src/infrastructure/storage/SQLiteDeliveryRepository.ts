import * as SQLite from 'expo-sqlite';
import { IDeliveryRepository } from '../../core/interfaces/IDeliveryRepository';
import { Delivery } from '../../core/domain/Delivery';

export class SQLiteDeliveryRepository implements IDeliveryRepository {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabaseSync('livragoplus.db');
    this.init();
  }

  private init() {
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS deliveries (
        id TEXT PRIMARY KEY NOT NULL,
        fullAddress TEXT,
        latitude REAL,
        longitude REAL,
        status TEXT,
        proofOfDeliveryUri TEXT,
        isSynced INTEGER DEFAULT 1,
        createdAt TEXT
      );
    `);
  }

  async save(delivery: Delivery): Promise<void> {
    // Si la livraison provient d'une validation locale (hors-ligne), 
    // on s'assure de propager son état 'isSynced' (qui sera fourni par l'objet Delivery ou forcé à 0 lors d'une modification locale)
    const isSyncedValue = delivery.isSynced === false ? 0 : 1;

    await this.db.runAsync(
      'INSERT OR REPLACE INTO deliveries (id, fullAddress, latitude, longitude, status, proofOfDeliveryUri, isSynced, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        delivery.id,
        delivery.address.fullText,
        delivery.address.coordinates?.latitude || null,
        delivery.address.coordinates?.longitude || null,
        delivery.status,
        delivery.proofOfDeliveryUri || null,
        isSyncedValue,
        new Date().toISOString()
      ]
    );
  }

  async getAll(): Promise<Delivery[]> {
    const rows = await this.db.getAllAsync<any>('SELECT * FROM deliveries ORDER BY createdAt DESC');
    return rows.map(row => ({
      id: row.id,
      status: row.status,
      address: {
        fullText: row.fullAddress,
        coordinates: row.latitude ? { latitude: row.latitude, longitude: row.longitude } : undefined
      },
      proofOfDeliveryUri: row.proofOfDeliveryUri,
      isSynced: row.isSynced === 1
    }));
  }

  async getById(id: string): Promise<Delivery | null> {
    const row = await this.db.getFirstAsync<any>('SELECT * FROM deliveries WHERE id = ?', [id]);
    if (!row) return null;
    
    return {
      id: row.id,
      status: row.status,
      address: {
        fullText: row.fullAddress,
        coordinates: row.latitude ? { latitude: row.latitude, longitude: row.longitude } : undefined
      },
      proofOfDeliveryUri: row.proofOfDeliveryUri,
      isSynced: row.isSynced === 1
    };
  }

  // Récupère les modifications locales non envoyées au Cloud
  async getUnsyncedDeliveries(): Promise<Delivery[]> {
    // 0 = false en SQLite
    const rows = await this.db.getAllAsync<any>('SELECT * FROM deliveries WHERE isSynced = 0');
    return rows.map(row => ({
      id: row.id,
      status: row.status,
      address: {
        fullText: row.fullAddress,
        coordinates: row.latitude ? { latitude: row.latitude, longitude: row.longitude } : undefined
      },
      proofOfDeliveryUri: row.proofOfDeliveryUri,
      isSynced: false
    }));
  }

  // Met à jour l'URI de la photo locale avec le Storage ID de Convex
  async updateProofUri(id: string, proofUri: string): Promise<void> {
    await this.db.runAsync(
      'UPDATE deliveries SET proofOfDeliveryUri = ? WHERE id = ?',
      [proofUri, id]
    );
  }

  // Marque la livraison comme étant correctement synchronisée sur Convex
  async markAsSynced(id: string): Promise<void> {
    await this.db.runAsync(
      'UPDATE deliveries SET isSynced = 1 WHERE id = ?',
      [id]
    );
  }
}
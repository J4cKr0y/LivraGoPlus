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
        createdAt TEXT
      );
    `);
  }

  async save(delivery: Delivery): Promise<void> {
    await this.db.runAsync(
      'INSERT OR REPLACE INTO deliveries (id, fullAddress, latitude, longitude, status, proofOfDeliveryUri, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        delivery.id,
        delivery.address.fullText,
        delivery.address.coordinates?.latitude || null,
        delivery.address.coordinates?.longitude || null,
        delivery.status,
        delivery.proofOfDeliveryUri || null,
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
      proofOfDeliveryUri: row.proofOfDeliveryUri
    }));
  }

  // ✅ Cette méthode doit être AVANT le dernier "}" de la classe
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
      proofOfDeliveryUri: row.proofOfDeliveryUri
    };
  }
} // <--- Un seul et unique "}" ici pour fermer la classe
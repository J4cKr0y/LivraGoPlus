import * as SQLite from 'expo-sqlite';
import { IDeliveryRepository } from '../../core/interfaces/IDeliveryRepository';
import { Delivery } from '../../core/domain/Delivery';
import { getDbEncryptionKey } from './Security';

export class SQLiteDeliveryRepository implements IDeliveryRepository {
  private db: SQLite.SQLiteDatabase | null = null;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.initDatabase();
  }

  private async initDatabase() {
    const key = await getDbEncryptionKey();
    // Ouverture sécurisée avec le mot de passe récupéré
    this.db = SQLite.openDatabaseSync('livragoplus.db', {
      password: key 
    });
    
    this.initTables();
  }

  private initTables() {
    this.db?.execSync(`
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

  // S'assure que la DB est prête avant toute opération
  private async ensureDb(): Promise<SQLite.SQLiteDatabase> {
    await this.initPromise;
    if (!this.db) throw new Error("Database not initialized");
    return this.db;
  }

  async save(delivery: Delivery): Promise<void> {
    const db = await this.ensureDb();
    const isSyncedValue = delivery.isSynced === false ? 0 : 1;

    await db.runAsync(
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
    const db = await this.ensureDb();
    const rows = await db.getAllAsync<any>('SELECT * FROM deliveries ORDER BY createdAt DESC');
    
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
    const db = await this.ensureDb();
    const row = await db.getFirstAsync<any>('SELECT * FROM deliveries WHERE id = ?', [id]);
    
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

  async getUnsyncedDeliveries(): Promise<Delivery[]> {
    const db = await this.ensureDb();
    const rows = await db.getAllAsync<any>('SELECT * FROM deliveries WHERE isSynced = 0');
    
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

  async updateProofUri(id: string, proofUri: string): Promise<void> {
    const db = await this.ensureDb();
    await db.runAsync(
      'UPDATE deliveries SET proofOfDeliveryUri = ? WHERE id = ?',
      [proofUri, id]
    );
  }

  async markAsSynced(id: string): Promise<void> {
    const db = await this.ensureDb();
    await db.runAsync(
      'UPDATE deliveries SET isSynced = 1 WHERE id = ?',
      [id]
    );
  }
}

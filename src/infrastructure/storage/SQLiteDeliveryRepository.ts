import * as SQLite from 'expo-sqlite';
import { IDeliveryRepository } from '../../core/interfaces/IDeliveryRepository';
import { Delivery } from '../../core/domain/Delivery';

export class SQLiteDeliveryRepository implements IDeliveryRepository {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    // On ouvre la base de données (elle sera créée si elle n'existe pas)
    this.db = SQLite.openDatabaseSync('livragoplus.db');
    this.init();
  }

  private init() {
    // Création de la table si nécessaire
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS deliveries (
        id TEXT PRIMARY KEY NOT NULL,
        fullText TEXT,
        status TEXT,
        syncStatus TEXT,
        latitude REAL,
        longitude REAL,
        createdAt TEXT
      );
    `);
  }

  async save(delivery: Delivery): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO deliveries (id, fullText, status, syncStatus, latitude, longitude, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        delivery.id,
        delivery.address.fullText,
        delivery.status,
        delivery.syncStatus,
        delivery.address.coordinates?.latitude || null,
        delivery.address.coordinates?.longitude || null,
        new Date().toISOString()
      ]
    );
  }

  async getAll(): Promise<Delivery[]> {
    const rows = await this.db.getAllAsync<any>('SELECT * FROM deliveries ORDER BY createdAt DESC');
    
    // On re-transforme les lignes SQL en objets du Domaine "Delivery"
    return rows.map(row => ({
      id: row.id,
      status: row.status,
      syncStatus: row.syncStatus,
      address: {
        fullText: row.fullText,
        coordinates: row.latitude ? { latitude: row.latitude, longitude: row.longitude } : undefined
      }
    }));
  }
}

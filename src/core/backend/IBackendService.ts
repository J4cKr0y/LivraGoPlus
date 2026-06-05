// src/core/backend/IBackendService.ts

import { Delivery } from '../../features/deliveries/domain/Delivery';

export interface IBackendService {
  syncDeliveries(deliveries: Delivery[]): Promise<void>;
  getRemoteDeliveries(): Promise<Delivery[]>;
  updateDeliveryStatus(id: string, status: string, proofUri?: string): Promise<void>;
  saveTourStats(stats: { savedKm: number, date: number }): Promise<void>;
  uploadProofOfDelivery(localUri: string): Promise<string>;
}

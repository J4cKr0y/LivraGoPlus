import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

export const getDbEncryptionKey = async (): Promise<string> => {
  let key = await SecureStore.getItemAsync('db_encryption_key');
  
  if (!key) {
    // On génère une clé aléatoire complexe
    key = Crypto.randomUUID(); 
    await SecureStore.setItemAsync('db_encryption_key', key);
  }
  
  return key;
};

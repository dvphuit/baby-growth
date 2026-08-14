import type { StateStorage } from 'zustand/middleware';

const DB_NAME = 'babygrowth-local';
const STORE_NAME = 'zustand';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Không thể mở IndexedDB'));
  });

  return dbPromise;
}

async function readValue(key: string): Promise<string | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(typeof request.result === 'string' ? request.result : null);
    request.onerror = () => reject(request.error ?? new Error('Không thể đọc IndexedDB'));
  });
}

async function writeValue(key: string, value: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('Không thể ghi IndexedDB'));
  });
}

async function removeValue(key: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('Không thể xóa IndexedDB'));
  });
}

/**
 * Zustand storage backed by IndexedDB. Existing localStorage snapshots are
 * migrated lazily the first time each key is read, so current user data is
 * preserved during the upgrade.
 */
export const indexedDbStorage: StateStorage = {
  getItem: async (name) => {
    const indexedValue = await readValue(name);
    if (indexedValue !== null) return indexedValue;

    const legacyValue = window.localStorage.getItem(name);
    if (legacyValue !== null) {
      await writeValue(name, legacyValue);
      return legacyValue;
    }

    return null;
  },
  setItem: async (name, value) => {
    await writeValue(name, value);
  },
  removeItem: async (name) => {
    await removeValue(name);
  },
};

export async function getLocalRecord(key: string): Promise<string | null> {
  return readValue(key);
}

export async function setLocalRecord(key: string, value: string): Promise<void> {
  await writeValue(key, value);
}

export async function removeLocalRecord(key: string): Promise<void> {
  await removeValue(key);
}

export async function getAllLocalRecords(keys: string[]): Promise<Record<string, string>> {
  const records = await Promise.all(
    keys.map(async (key) => [key, await indexedDbStorage.getItem(key)] as const)
  );
  return Object.fromEntries(records.filter((entry): entry is [string, string] => entry[1] !== null));
}

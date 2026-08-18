import type { StateStorage } from 'zustand/middleware';

const DB_NAME = 'babygrowth-local';
const STORE_NAME = 'zustand';
const MEDIA_STORE_NAME = 'media';
const DB_VERSION = 2;

type LocalRecordChangeListener = (key: string) => void;
const localRecordChangeListeners = new Set<LocalRecordChangeListener>();
const pendingRecordWrites = new Map<string, Promise<void>>();

let dbPromise: Promise<IDBDatabase> | null = null;

const memoryFallback = new Map<string, string>();
const memoryMediaFallback = new Map<string, Blob>();

function hasIndexedDb(): boolean {
  return typeof indexedDB !== 'undefined';
}

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (!hasIndexedDb()) {
      reject(new Error('IndexedDB is not available'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(MEDIA_STORE_NAME)) {
        db.createObjectStore(MEDIA_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Không thể mở IndexedDB'));
  });

  return dbPromise;
}

async function readValue(key: string): Promise<string | null> {
  if (!hasIndexedDb()) {
    return memoryFallback.get(key) ?? (typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(key) : null);
  }
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(typeof request.result === 'string' ? request.result : null);
    request.onerror = () => reject(request.error ?? new Error('Không thể đọc IndexedDB'));
  });
}

async function trackRecordWrite(key: string, operation: () => Promise<void>): Promise<void> {
  const pendingWrite = operation();
  pendingRecordWrites.set(key, pendingWrite);
  try {
    await pendingWrite;
  } finally {
    if (pendingRecordWrites.get(key) === pendingWrite) {
      pendingRecordWrites.delete(key);
    }
  }
}

async function commitRecordMutation(
  db: IDBDatabase,
  storeName: string,
  mutate: (store: IDBObjectStore) => void,
  failureMessage: string,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const rejectTransaction = () => reject(transaction.error ?? new Error(failureMessage));
    transaction.oncomplete = () => resolve();
    transaction.onerror = rejectTransaction;
    transaction.onabort = rejectTransaction;
    mutate(transaction.objectStore(storeName));
  });
}

async function writeValue(key: string, value: string): Promise<void> {
  await trackRecordWrite(key, async () => {
    if (!hasIndexedDb()) {
      memoryFallback.set(key, value);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    const db = await openDb();
    await commitRecordMutation(db, STORE_NAME, (store) => { store.put(value, key); }, 'Không thể ghi IndexedDB');
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  });
}

async function removeValue(key: string): Promise<void> {
  await trackRecordWrite(key, async () => {
    if (!hasIndexedDb()) {
      memoryFallback.delete(key);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      return;
    }
    const db = await openDb();
    await commitRecordMutation(db, STORE_NAME, (store) => { store.delete(key); }, 'Không thể xóa IndexedDB');
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  });
}

export async function waitForLocalRecordWrites(keys: readonly string[]): Promise<void> {
  await Promise.all(keys.map((key) => pendingRecordWrites.get(key) ?? Promise.resolve()));
}


/**
 * Zustand storage backed by IndexedDB. Existing localStorage snapshots are
 * migrated lazily the first time each key is read, so current user data is
 * preserved during the upgrade.
 */
export function subscribeLocalRecordChanges(listener: LocalRecordChangeListener): () => void {
  localRecordChangeListeners.add(listener);
  return () => localRecordChangeListeners.delete(listener);
}

function notifyLocalRecordChanged(key: string): void {
  localRecordChangeListeners.forEach((listener) => listener(key));
}

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
    notifyLocalRecordChanged(name);
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
  notifyLocalRecordChanged(key);
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

export async function setLocalMedia(id: string, blob: Blob): Promise<void> {
  if (!hasIndexedDb()) {
    memoryMediaFallback.set(id, blob);
    return;
  }
  const db = await openDb();
  await commitRecordMutation(db, MEDIA_STORE_NAME, (store) => { store.put(blob, id); }, 'Không thể lưu media cục bộ');
}

export async function getLocalMedia(id: string): Promise<Blob | null> {
  if (!hasIndexedDb()) return memoryMediaFallback.get(id) ?? null;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(MEDIA_STORE_NAME, 'readonly').objectStore(MEDIA_STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result instanceof Blob ? request.result : null);
    request.onerror = () => reject(request.error ?? new Error('Không thể đọc media cục bộ'));
  });
}

export async function removeLocalMedia(id: string): Promise<void> {
  if (!hasIndexedDb()) {
    memoryMediaFallback.delete(id);
    return;
  }
  const db = await openDb();
  await commitRecordMutation(db, MEDIA_STORE_NAME, (store) => { store.delete(id); }, 'Không thể xóa media cục bộ');
}

export async function clearLocalMedia(): Promise<void> {
  memoryMediaFallback.clear();
  if (!hasIndexedDb()) return;
  const db = await openDb();
  await commitRecordMutation(db, MEDIA_STORE_NAME, (store) => { store.clear(); }, 'Không thể xóa kho media cục bộ');
}

import { beforeEach, describe, expect, it, vi } from 'vitest';

interface ControlledIndexedDb {
  openRequest: {
    result: IDBDatabase;
    onsuccess: ((event: Event) => void) | null;
  };
  writeRequest: {
    onsuccess: ((event: Event) => void) | null;
    onerror: ((event: Event) => void) | null;
  };
}

function installControlledIndexedDb(): ControlledIndexedDb {
  const writeRequest = {
    onsuccess: null,
    onerror: null,
  } satisfies ControlledIndexedDb['writeRequest'];
  const objectStore = {
    put: vi.fn(() => writeRequest),
    delete: vi.fn(() => writeRequest),
  };
  const database = {
    objectStoreNames: { contains: vi.fn(() => true) },
    transaction: vi.fn(() => ({ objectStore: vi.fn(() => objectStore) })),
  } as unknown as IDBDatabase;
  const openRequest = {
    result: database,
    onsuccess: null,
  } satisfies ControlledIndexedDb['openRequest'];

  vi.stubGlobal('indexedDB', {
    open: vi.fn(() => openRequest),
  });

  return { openRequest, writeRequest };
}

describe('localDb pending writes', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it('waits for a pending IndexedDB record write to finish', async () => {
    const indexedDb = installControlledIndexedDb();
    const { indexedDbStorage, waitForLocalRecordWrites } = await import('./localDb');

    const write = indexedDbStorage.setItem('key', 'value');
    indexedDb.openRequest.onsuccess?.(new Event('success'));
    await Promise.resolve();

    let barrierResolved = false;
    const barrier = waitForLocalRecordWrites(['key']).then(() => {
      barrierResolved = true;
    });
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(barrierResolved).toBe(false);

    indexedDb.writeRequest.onsuccess?.(new Event('success'));
    await write;
    await barrier;
    expect(barrierResolved).toBe(true);
  });

  it('resolves immediately when the requested keys have no pending writes', async () => {
    const { waitForLocalRecordWrites } = await import('./localDb');

    await expect(waitForLocalRecordWrites(['idle-key'])).resolves.toBeUndefined();
  });

  it('waits for a pending record removal to finish', async () => {
    const indexedDb = installControlledIndexedDb();
    const { removeLocalRecord, waitForLocalRecordWrites } = await import('./localDb');

    const removal = removeLocalRecord('key');
    indexedDb.openRequest.onsuccess?.(new Event('success'));
    await Promise.resolve();

    let barrierResolved = false;
    const barrier = waitForLocalRecordWrites(['key']).then(() => {
      barrierResolved = true;
    });
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(barrierResolved).toBe(false);

    indexedDb.writeRequest.onsuccess?.(new Event('success'));
    await removal;
    await barrier;
  });
});

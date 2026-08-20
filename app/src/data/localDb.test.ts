import { beforeEach, describe, expect, it, vi } from 'vitest';

interface ControlledIndexedDb {
  openRequest: {
    result: IDBDatabase;
    onsuccess: ((event: Event) => void) | null;
  };
  transaction: {
    error: DOMException | null;
    onabort: ((event: Event) => void) | null;
    oncomplete: ((event: Event) => void) | null;
    onerror: ((event: Event) => void) | null;
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
  const transaction = {
    error: null,
    onabort: null,
    oncomplete: null,
    onerror: null,
    objectStore: vi.fn(() => objectStore),
  } satisfies ControlledIndexedDb['transaction'] & { objectStore: () => typeof objectStore };
  const database = {
    objectStoreNames: { contains: vi.fn(() => true) },
    transaction: vi.fn(() => transaction),
  } as unknown as IDBDatabase;
  const openRequest = {
    result: database,
    onsuccess: null,
  } satisfies ControlledIndexedDb['openRequest'];

  vi.stubGlobal('indexedDB', {
    open: vi.fn(() => openRequest),
  });

  return { openRequest, transaction, writeRequest };
}

async function flushMicrotasks(): Promise<void> {
  for (let index = 0; index < 10; index += 1) {
    await Promise.resolve();
  }
}

describe('localDb pending writes', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it('keeps the write barrier pending until the IndexedDB transaction completes', async () => {
    const indexedDb = installControlledIndexedDb();
    const { indexedDbStorage, waitForLocalRecordWrites } = await import('@/data/localDb');

    const write = Promise.resolve(indexedDbStorage.setItem('key', 'value'));
    indexedDb.openRequest.onsuccess?.(new Event('success'));
    await Promise.resolve();
    indexedDb.writeRequest.onsuccess?.(new Event('success'));

    let barrierResolved = false;
    const barrier = waitForLocalRecordWrites(['key']).then(() => {
      barrierResolved = true;
    });
    await flushMicrotasks();

    expect(barrierResolved).toBe(false);

    indexedDb.transaction.oncomplete?.(new Event('complete'));
    await write;
    await barrier;
    expect(barrierResolved).toBe(true);
  });

  it('resolves immediately when the requested keys have no pending writes', async () => {
    const { waitForLocalRecordWrites } = await import('@/data/localDb');

    await expect(waitForLocalRecordWrites(['idle-key'])).resolves.toBeUndefined();
  });

  it('keeps the removal barrier pending until the IndexedDB transaction completes', async () => {
    const indexedDb = installControlledIndexedDb();
    const { removeLocalRecord, waitForLocalRecordWrites } = await import('@/data/localDb');

    const removal = removeLocalRecord('key');
    indexedDb.openRequest.onsuccess?.(new Event('success'));
    await Promise.resolve();
    indexedDb.writeRequest.onsuccess?.(new Event('success'));

    let barrierResolved = false;
    const barrier = waitForLocalRecordWrites(['key']).then(() => {
      barrierResolved = true;
    });
    await flushMicrotasks();

    expect(barrierResolved).toBe(false);

    indexedDb.transaction.oncomplete?.(new Event('complete'));
    await removal;
    await barrier;
    expect(barrierResolved).toBe(true);
  });

  it('does not resurrect a removed record from legacy localStorage', async () => {
    window.localStorage.setItem('key', 'stale-value');
    const indexedDb = installControlledIndexedDb();
    const { indexedDbStorage } = await import('@/data/localDb');

    const removal = indexedDbStorage.removeItem('key');
    indexedDb.openRequest.onsuccess?.(new Event('success'));
    await Promise.resolve();
    indexedDb.writeRequest.onsuccess?.(new Event('success'));
    indexedDb.transaction.oncomplete?.(new Event('complete'));
    await removal;

    vi.stubGlobal('indexedDB', undefined);
    await expect(indexedDbStorage.getItem('key')).resolves.toBeNull();
  });

  it('rejects a tracked write when its IndexedDB transaction aborts', async () => {
    const indexedDb = installControlledIndexedDb();
    const { indexedDbStorage, waitForLocalRecordWrites } = await import('@/data/localDb');
    const write = Promise.resolve(indexedDbStorage.setItem('key', 'value'));
    indexedDb.openRequest.onsuccess?.(new Event('success'));
    await Promise.resolve();
    const barrier = waitForLocalRecordWrites(['key']);
    let writeRejected = false;
    let barrierRejected = false;
    void write.catch(() => { writeRejected = true; });
    void barrier.catch(() => { barrierRejected = true; });

    indexedDb.transaction.error = new DOMException('aborted', 'AbortError');
    indexedDb.transaction.onabort?.(new Event('abort'));
    await flushMicrotasks();

    expect(writeRejected).toBe(true);
    expect(barrierRejected).toBe(true);
  });

  it('rejects a tracked removal when its IndexedDB transaction errors', async () => {
    const indexedDb = installControlledIndexedDb();
    const { removeLocalRecord, waitForLocalRecordWrites } = await import('@/data/localDb');
    const removal = removeLocalRecord('key');
    indexedDb.openRequest.onsuccess?.(new Event('success'));
    await Promise.resolve();
    const barrier = waitForLocalRecordWrites(['key']);
    let removalRejected = false;
    let barrierRejected = false;
    void removal.catch(() => { removalRejected = true; });
    void barrier.catch(() => { barrierRejected = true; });

    indexedDb.transaction.error = new DOMException('failed', 'UnknownError');
    indexedDb.transaction.onerror?.(new Event('error'));
    await flushMicrotasks();

    expect(removalRejected).toBe(true);
    expect(barrierRejected).toBe(true);
  });

  it('stores and removes media blobs without serializing them', async () => {
    vi.stubGlobal('indexedDB', undefined);
    const { clearLocalMedia, getLocalMedia, listLocalMedia, removeLocalMedia, setLocalMedia } = await import('@/data/localDb');
    const photo = new Blob(['photo-bytes'], { type: 'image/jpeg' });
    const video = new Blob(['video-bytes'], { type: 'video/mp4' });

    await setLocalMedia('photo-1', photo);
    await setLocalMedia('video-1', video);
    expect(await getLocalMedia('photo-1')).toBe(photo);
    expect(await listLocalMedia()).toEqual([
      { id: 'photo-1', blob: photo, size: photo.size, mimeType: 'image/jpeg' },
      { id: 'video-1', blob: video, size: video.size, mimeType: 'video/mp4' },
    ]);

    await removeLocalMedia('photo-1');
    expect(await getLocalMedia('photo-1')).toBeNull();
    expect(await listLocalMedia()).toEqual([
      { id: 'video-1', blob: video, size: video.size, mimeType: 'video/mp4' },
    ]);

    await clearLocalMedia();
    expect(await getLocalMedia('video-1')).toBeNull();
    expect(await listLocalMedia()).toEqual([]);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const localDb = vi.hoisted(() => ({
  getAllLocalRecords: vi.fn(),
  getLocalRecord: vi.fn(),
  removeLocalRecord: vi.fn(),
  setLocalRecord: vi.fn(),
  subscribeLocalRecordChanges: vi.fn(),
}));

vi.mock('./localDb', () => localDb);

function deferred<T = void>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

async function flushMicrotasks(): Promise<void> {
  for (let index = 0; index < 10; index += 1) {
    await Promise.resolve();
  }
}

function jsonResponse(value: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue(value),
    text: vi.fn().mockResolvedValue(''),
  } as unknown as Response;
}

function installGoogleTokenClient(): void {
  Object.defineProperty(window, 'google', {
    configurable: true,
    value: {
      accounts: {
        oauth2: {
          initTokenClient: vi.fn((config: { callback: (response: { access_token: string; expires_in: number }) => void }) => ({
            requestAccessToken: vi.fn(() => config.callback({ access_token: 'token', expires_in: 3600 })),
          })),
        },
      },
    },
  });
}

describe('explicit Google Drive reset operations', () => {
  let localRecordListener: ((key: string) => void) | null;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'client-id');
    window.localStorage.clear();
    localRecordListener = null;
    localDb.getAllLocalRecords.mockResolvedValue({ babygrowth_v2_baby: '{"state":"reset"}' });
    localDb.getLocalRecord.mockResolvedValue(null);
    localDb.removeLocalRecord.mockResolvedValue(undefined);
    localDb.setLocalRecord.mockResolvedValue(undefined);
    localDb.subscribeLocalRecordChanges.mockImplementation((listener: (key: string) => void) => {
      localRecordListener = listener;
      return vi.fn();
    });
    installGoogleTokenClient();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('patches the existing Drive backup with the current local snapshot', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ files: [{ id: 'remote-1', name: 'babygrowth-sync.json' }] }))
      .mockResolvedValueOnce(jsonResponse({ id: 'remote-1', name: 'babygrowth-sync.json' }));
    vi.stubGlobal('fetch', fetchMock);
    const { overwriteDriveBackupWithLocalData } = await import('./googleDriveSync');

    const snapshot = await overwriteDriveBackupWithLocalData();

    expect(snapshot.records.babygrowth_v2_baby).toBe('{"state":"reset"}');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/upload/drive/v3/files/remote-1?uploadType=multipart'),
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('alt=media'), expect.anything());
    expect(localDb.setLocalRecord).toHaveBeenCalledWith(
      'babygrowth_v2_sync_meta',
      expect.stringContaining('lastSyncedFingerprint'),
    );
  });

  it('creates a Drive backup when no remote file exists', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ files: [] }))
      .mockResolvedValueOnce(jsonResponse({ id: 'remote-new', name: 'babygrowth-sync.json' }));
    vi.stubGlobal('fetch', fetchMock);
    const { overwriteDriveBackupWithLocalData } = await import('./googleDriveSync');

    await overwriteDriveBackupWithLocalData({ interactive: true });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/upload/drive/v3/files?uploadType=multipart'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'DELETE')).toBe(false);
    expect(localDb.setLocalRecord).toHaveBeenCalledWith(
      'babygrowth_v2_sync_meta',
      expect.stringContaining('remote-new'),
    );
  });

  it('clears queued auto-sync and restores scheduling after a rejected operation', async () => {
    vi.useFakeTimers();
    localDb.getLocalRecord.mockResolvedValue(JSON.stringify({ autoSyncEnabled: true }));
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ files: [] }))
      .mockResolvedValueOnce(jsonResponse({ id: 'remote-new', name: 'babygrowth-sync.json' }));
    vi.stubGlobal('fetch', fetchMock);
    const sync = await import('./googleDriveSync');
    await sync.requestGoogleAccessToken();
    const stopAutoSync = await sync.startAutoSync();
    localRecordListener?.('babygrowth_v2_baby');

    await expect(sync.runWithAutoSyncPaused(async () => {
      throw new Error('reset failed');
    })).rejects.toThrow('reset failed');
    await vi.advanceTimersByTimeAsync(1200);
    expect(fetchMock).not.toHaveBeenCalled();

    localRecordListener?.('babygrowth_v2_baby');
    await vi.advanceTimersByTimeAsync(1200);
    expect(fetchMock).toHaveBeenCalled();
    stopAutoSync();
  });

  it('keeps auto-sync suppressed until all overlapping pause operations finish', async () => {
    vi.useFakeTimers();
    localDb.getLocalRecord.mockResolvedValue(JSON.stringify({ autoSyncEnabled: true }));
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ files: [] }))
      .mockResolvedValueOnce(jsonResponse({ id: 'remote-new', name: 'babygrowth-sync.json' }));
    vi.stubGlobal('fetch', fetchMock);
    const sync = await import('./googleDriveSync');
    await sync.requestGoogleAccessToken();
    const stopAutoSync = await sync.startAutoSync();
    const first = deferred();
    const second = deferred();

    const firstPause = sync.runWithAutoSyncPaused(() => first.promise);
    const secondPause = sync.runWithAutoSyncPaused(() => second.promise);
    first.resolve();
    await firstPause;

    localRecordListener?.('babygrowth_v2_baby');
    await vi.advanceTimersByTimeAsync(1200);
    expect(fetchMock).not.toHaveBeenCalled();

    second.resolve();
    await secondPause;
    localRecordListener?.('babygrowth_v2_baby');
    await vi.advanceTimersByTimeAsync(1200);
    expect(fetchMock).toHaveBeenCalled();
    stopAutoSync();
  });

  it('waits for an active auto-sync before starting a paused operation, then resumes scheduling', async () => {
    vi.useFakeTimers();
    localDb.getLocalRecord.mockResolvedValue(JSON.stringify({ autoSyncEnabled: true }));
    const activeUpload = deferred<Response>();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ files: [] }))
      .mockImplementationOnce(() => activeUpload.promise)
      .mockResolvedValueOnce(jsonResponse({ files: [] }))
      .mockResolvedValueOnce(jsonResponse({ id: 'remote-next', name: 'babygrowth-sync.json' }));
    vi.stubGlobal('fetch', fetchMock);
    const sync = await import('./googleDriveSync');
    await sync.requestGoogleAccessToken();
    const stopAutoSync = await sync.startAutoSync();

    localRecordListener?.('babygrowth_v2_baby');
    await vi.advanceTimersByTimeAsync(1200);
    await flushMicrotasks();
    expect(fetchMock).toHaveBeenCalledTimes(2);

    let pausedOperationStarted = false;
    const pausedOperation = sync.runWithAutoSyncPaused(async () => {
      pausedOperationStarted = true;
    });
    await flushMicrotasks();
    expect(pausedOperationStarted).toBe(false);

    activeUpload.resolve(jsonResponse({ id: 'remote-active', name: 'babygrowth-sync.json' }));
    await pausedOperation;
    expect(pausedOperationStarted).toBe(true);

    localRecordListener?.('babygrowth_v2_baby');
    await vi.advanceTimersByTimeAsync(1200);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    stopAutoSync();
  });

  it('applies a downloaded snapshot during auto-sync without waiting on itself', async () => {
    vi.useFakeTimers();
    const sync = await import('./googleDriveSync');
    const localRecords = { babygrowth_v2_baby: '{"state":"local"}' };
    const localSnapshot = sync.createSyncSnapshot(localRecords);
    const remoteSnapshot = sync.createSyncSnapshot({ babygrowth_v2_baby: '{"state":"remote"}' });
    localDb.getAllLocalRecords.mockResolvedValue(localRecords);
    localDb.getLocalRecord.mockResolvedValue(JSON.stringify({
      autoSyncEnabled: true,
      lastSyncedFingerprint: localSnapshot.fingerprint,
    }));
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ files: [{ id: 'remote-1', name: 'babygrowth-sync.json' }] }))
      .mockResolvedValueOnce(jsonResponse(remoteSnapshot));
    vi.stubGlobal('fetch', fetchMock);
    await sync.requestGoogleAccessToken();
    const stopAutoSync = await sync.startAutoSync();

    localRecordListener?.('babygrowth_v2_baby');
    await vi.advanceTimersByTimeAsync(1200);
    await flushMicrotasks();

    expect(localDb.setLocalRecord).toHaveBeenCalledWith('babygrowth_v2_baby', '{"state":"remote"}');
    stopAutoSync();
  });

  it('drops schedule requests raised during a pause, then accepts new schedules afterward', async () => {
    vi.useFakeTimers();
    localDb.getLocalRecord.mockResolvedValue(JSON.stringify({ autoSyncEnabled: true }));
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ files: [] }))
      .mockResolvedValueOnce(jsonResponse({ id: 'remote-new', name: 'babygrowth-sync.json' }));
    vi.stubGlobal('fetch', fetchMock);
    const sync = await import('./googleDriveSync');
    await sync.requestGoogleAccessToken();
    const stopAutoSync = await sync.startAutoSync();
    const pausedWork = deferred();

    const pausedOperation = sync.runWithAutoSyncPaused(() => pausedWork.promise);
    window.dispatchEvent(new Event('online'));
    await vi.advanceTimersByTimeAsync(400);
    pausedWork.resolve();
    await pausedOperation;
    await vi.advanceTimersByTimeAsync(100);
    expect(fetchMock).not.toHaveBeenCalled();

    localRecordListener?.('babygrowth_v2_baby');
    await vi.advanceTimersByTimeAsync(1200);
    expect(fetchMock).toHaveBeenCalled();
    stopAutoSync();
  });
});

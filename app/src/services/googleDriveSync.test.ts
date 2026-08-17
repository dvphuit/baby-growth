import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const localDb = vi.hoisted(() => ({
  getAllLocalRecords: vi.fn(),
  getLocalRecord: vi.fn(),
  removeLocalRecord: vi.fn(),
  setLocalRecord: vi.fn(),
  subscribeLocalRecordChanges: vi.fn(),
}));

vi.mock('./localDb', () => localDb);

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
});

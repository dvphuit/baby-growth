import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useActivityStore } from '@/features/activities/store/useActivityStore';
import { initializeChildProfile, resetChildStoresToDefaults } from '@/features/profile';
import { useExpenseStore } from '@/features/expenses/store/useExpenseStore';
import { useReminderStore } from '@/features/reminders/store/useReminderStore';
import { useTimelineStore } from '@/features/timeline/store/useTimelineStore';
import { useUIStore } from '@/store/useUIStore';

const localDb = vi.hoisted(() => ({
  getLocalRecord: vi.fn(),
  setLocalRecord: vi.fn(),
}));
const timelineMediaDriveSync = vi.hoisted(() => ({
  syncTimelineMediaToDrive: vi.fn(),
}));

vi.mock('@/data/localDb', () => localDb);
vi.mock('@/features/sync/timelineMediaDriveSync', () => timelineMediaDriveSync);

function jsonResponse(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function binaryResponse(value: string, contentType: string): Response {
  return new Response(value, {
    status: 200,
    headers: { 'Content-Type': contentType },
  });
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

describe('generation-2 Google Drive sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'client-id');
    window.localStorage.clear();
    localDb.getLocalRecord.mockResolvedValue(null);
    localDb.setLocalRecord.mockResolvedValue(undefined);
    timelineMediaDriveSync.syncTimelineMediaToDrive.mockResolvedValue(0);
    resetChildStoresToDefaults();
    useActivityStore.getState().resetTrackingData();
    useExpenseStore.getState().resetTrackingData();
    useReminderStore.getState().resetTrackingData();
    useTimelineStore.setState({ timelineItems: [] });
    useUIStore.setState({ profileMode: 'baby' });
    installGoogleTokenClient();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('creates semantic sync snapshots without Zustand persistence records', async () => {
    initializeChildProfile({ childName: 'Bé Bơ', birthDate: '2026-08-01' });
    const sync = await import('@/features/sync/googleDriveSync');

    const snapshot = sync.createSyncSnapshot();

    expect(snapshot.schemaVersion).toBe(2);
    expect(snapshot.data.generation).toBe(2);
    expect(snapshot.data.profile.familyData.childName).toBe('Bé Bơ');
    expect(snapshot).not.toHaveProperty('records');
    expect(JSON.stringify(snapshot)).not.toContain('babygrowth_v2_chat');
  });

  it('patches the existing Drive backup with the current semantic snapshot', async () => {
    initializeChildProfile({ childName: 'Bé Bơ', birthDate: '2026-08-01' });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ files: [{ id: 'remote-1', name: 'babygrowth-sync-v2.json' }] }))
      .mockResolvedValueOnce(jsonResponse({ id: 'remote-1', name: 'babygrowth-sync-v2.json' }));
    vi.stubGlobal('fetch', fetchMock);
    const sync = await import('@/features/sync/googleDriveSync');

    const snapshot = await sync.overwriteDriveBackupWithLocalData();

    expect(snapshot.data.profile.familyData.childName).toBe('Bé Bơ');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/upload/drive/v3/files/remote-1?uploadType=multipart'),
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(localDb.setLocalRecord).toHaveBeenCalledWith(
      'babygrowth_v4_sync_meta',
      expect.stringContaining('lastSyncedFingerprint'),
    );
  });

  it('ignores schema-1 backups instead of failing Google login', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ files: [] }))
      .mockResolvedValueOnce(jsonResponse({ files: [{ id: 'legacy', name: 'babygrowth-sync.json' }] }))
      .mockResolvedValueOnce(jsonResponse({ schemaVersion: 1, records: { babygrowth_v2_baby: '{}' } }));
    vi.stubGlobal('fetch', fetchMock);
    const sync = await import('@/features/sync/googleDriveSync');
    await sync.requestGoogleAccessToken();

    await expect(sync.checkDriveBackup()).resolves.toEqual({ found: false });
    expect(fetchMock.mock.calls[0][0]).toContain('babygrowth-sync-v2.json');
    expect(fetchMock.mock.calls[1][0]).toContain('babygrowth-sync.json');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('adopts a generation-2 backup that still uses the legacy filename', async () => {
    initializeChildProfile({ childName: 'Bé Bơ', birthDate: '2026-08-01' });
    const sync = await import('@/features/sync/googleDriveSync');
    const legacyNamedSnapshot = sync.createSyncSnapshot();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ files: [] }))
      .mockResolvedValueOnce(jsonResponse({ files: [{ id: 'legacy-v2', name: 'babygrowth-sync.json' }] }))
      .mockResolvedValueOnce(jsonResponse(legacyNamedSnapshot))
      .mockResolvedValueOnce(jsonResponse({ id: 'legacy-v2', name: 'babygrowth-sync-v2.json' }));
    vi.stubGlobal('fetch', fetchMock);

    const snapshot = await sync.overwriteDriveBackupWithLocalData();

    expect(snapshot.data.profile.familyData.childName).toBe('Bé Bơ');
    expect(fetchMock.mock.calls[3][0]).toContain('/upload/drive/v3/files/legacy-v2?uploadType=multipart');
    expect(fetchMock.mock.calls[3][1]).toMatchObject({ method: 'PATCH' });
    const uploadBody = fetchMock.mock.calls[3][1]?.body;
    expect(uploadBody).toBeInstanceOf(Blob);
    if (!(uploadBody instanceof Blob)) throw new Error('Expected Drive snapshot upload to use a Blob body.');
    expect(await uploadBody.text()).toContain('babygrowth-sync-v2.json');
  });

  it('uploads private timeline media without Base64 conversion', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 'drive-media-1', name: 'baby.jpg' }));
    vi.stubGlobal('fetch', fetchMock);
    const sync = await import('@/features/sync/googleDriveSync');
    await sync.requestGoogleAccessToken();
    const media = new Blob(['image-bytes'], { type: 'image/jpeg' });

    await expect(sync.uploadTimelineMediaToDrive('media-1', media, { name: 'baby.jpg' })).resolves.toBe('drive-media-1');

    const [, init] = fetchMock.mock.calls[0];
    expect(fetchMock.mock.calls[0][0]).toContain('/upload/drive/v3/files?uploadType=multipart');
    expect(init).toMatchObject({ method: 'POST' });
    expect(init.body).toBeInstanceOf(Blob);
  });

  it('downloads private timeline media with the current Google token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(binaryResponse('image-bytes', 'image/jpeg'));
    vi.stubGlobal('fetch', fetchMock);
    const sync = await import('@/features/sync/googleDriveSync');
    await sync.requestGoogleAccessToken();

    const downloaded = await sync.downloadTimelineMediaFromDrive('drive-media-1');
    expect(downloaded.type).toBe('image/jpeg');
    expect(await downloaded.text()).toBe('image-bytes');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/drive/v3/files/drive-media-1?alt=media'),
      expect.objectContaining({ headers: { Authorization: 'Bearer token' } }),
    );
  });
});

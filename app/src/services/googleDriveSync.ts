import {
  getAllLocalRecords,
  getLocalRecord,
  setLocalRecord,
  removeLocalRecord,
  subscribeLocalRecordChanges,
} from './localDb';

const SYNC_FILE_NAME = 'babygrowth-sync.json';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const SYNC_META_KEY = 'babygrowth_v2_sync_meta';
const AUTO_SYNC_INTERVAL_MS = 5 * 60 * 1000;
const AUTO_SYNC_DEBOUNCE_MS = 1200;
const SYNC_KEYS = [
  'babygrowth_v2_baby',
  'babygrowth_v2_mom',
  'babygrowth_v2_chat',
  'babygrowth_v2_timeline',
  'babygrowth_v2_ui',
] as const;
const AUTO_SYNC_KEYS = new Set<string>(SYNC_KEYS);

interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (overrides?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (error: { type?: string; message?: string }) => void;
          }) => GoogleTokenClient;
        };
      };
    };
  }
}

export type SyncConflictReason = 'first_sync' | 'both_changed';

export interface SyncSnapshot {
  schemaVersion: 1;
  updatedAt: string;
  deviceId: string;
  fingerprint: string;
  records: Record<string, string>;
}

interface SyncMeta {
  lastSyncedFingerprint: string | null;
  remoteFileId: string | null;
  lastSyncedAt: string | null;
  autoSyncEnabled: boolean;
}

const DEFAULT_META: SyncMeta = {
  lastSyncedFingerprint: null,
  remoteFileId: null,
  lastSyncedAt: null,
  autoSyncEnabled: false,
};

export type SyncResult =
  | { status: 'uploaded'; snapshot: SyncSnapshot }
  | { status: 'downloaded'; snapshot: SyncSnapshot }
  | { status: 'unchanged'; snapshot: SyncSnapshot }
  | { status: 'conflict'; reason: SyncConflictReason; local: SyncSnapshot; remote: SyncSnapshot };

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'auth-required' | 'error' | 'conflict';

export interface SyncState {
  status: SyncStatus;
  lastSyncedAt: string | null;
  autoSyncEnabled: boolean;
  error: string | null;
  conflict: Extract<SyncResult, { status: 'conflict' }> | null;
}

export class GoogleAuthRequiredError extends Error {
  constructor() {
    super('Cần kết nối lại Google để tiếp tục tự động đồng bộ.');
    this.name = 'GoogleAuthRequiredError';
  }
}

interface DriveFile {
  id: string;
  name: string;
  modifiedTime?: string;
}

interface DriveFileList {
  files?: DriveFile[];
}

let accessToken: string | null = null;
let accessTokenExpiresAt = 0;
let tokenClient: GoogleTokenClient | null = null;
let tokenScriptPromise: Promise<void> | null = null;
let autoSyncStop: (() => void) | null = null;
let autoSyncStartPromise: Promise<() => void> | null = null;
let autoSyncTimer: number | null = null;
let autoSyncDebounceTimer: number | null = null;
let autoSyncInFlight = false;
let suppressAutoSync = false;

let syncState: SyncState = {
  status: 'idle',
  lastSyncedAt: null,
  autoSyncEnabled: false,
  error: null,
  conflict: null,
};
const syncStateListeners = new Set<(state: SyncState) => void>();

function publishSyncState(partial: Partial<SyncState>): void {
  syncState = { ...syncState, ...partial };
  syncStateListeners.forEach((listener) => listener(syncState));
}

export function getSyncState(): SyncState {
  return syncState;
}

export function subscribeSyncState(listener: (state: SyncState) => void): () => void {
  syncStateListeners.add(listener);
  listener(syncState);
  return () => syncStateListeners.delete(listener);
}

function getClientId(): string | null {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return typeof clientId === 'string' && clientId.trim() ? clientId.trim() : null;
}

function getDeviceId(): string {
  const key = 'babygrowth_v2_device_id';
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = globalThis.crypto?.randomUUID?.() ?? `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(key, created);
  return created;
}

function hash(value: string): string {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(16).padStart(8, '0');
}

function createSnapshot(records: Record<string, string>): SyncSnapshot {
  const orderedRecords = Object.fromEntries(SYNC_KEYS.map((key) => [key, records[key] ?? '']));
  return {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    deviceId: getDeviceId(),
    fingerprint: hash(JSON.stringify(orderedRecords)),
    records: orderedRecords,
  };
}

async function readMeta(): Promise<SyncMeta> {
  const raw = await getLocalRecord(SYNC_META_KEY);
  if (!raw) return { ...DEFAULT_META };
  try {
    const parsed = JSON.parse(raw) as Partial<SyncMeta>;
    return {
      ...DEFAULT_META,
      ...parsed,
      autoSyncEnabled: parsed.autoSyncEnabled === true,
    };
  } catch {
    return { ...DEFAULT_META };
  }
}

async function updateMeta(patch: Partial<SyncMeta>): Promise<SyncMeta> {
  const next = { ...(await readMeta()), ...patch };
  await setLocalRecord(SYNC_META_KEY, JSON.stringify(next));
  publishSyncState({ autoSyncEnabled: next.autoSyncEnabled, lastSyncedAt: next.lastSyncedAt });
  return next;
}

async function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return;
  if (tokenScriptPromise) return tokenScriptPromise;

  tokenScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-identity-services]');
    if (existingScript) {
      const onLoad = () => resolve();
      const onError = () => reject(new Error('Không tải được Google Identity Services'));
      existingScript.addEventListener('load', onLoad, { once: true });
      existingScript.addEventListener('error', onError, { once: true });
      window.setTimeout(() => {
        if (window.google?.accounts?.oauth2) resolve();
      }, 0);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentityServices = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Không tải được Google Identity Services'));
    document.head.appendChild(script);
  });

  return tokenScriptPromise;
}

export function isGoogleConfigured(): boolean {
  return Boolean(getClientId());
}

export function isGoogleConnected(): boolean {
  return Boolean(accessToken && Date.now() < accessTokenExpiresAt);
}

export async function requestGoogleAccessToken(): Promise<void> {
  const clientId = getClientId();
  if (!clientId) {
    throw new Error('Thiếu VITE_GOOGLE_CLIENT_ID. Hãy cấu hình Google OAuth Client ID trước.');
  }

  await loadGoogleScript();
  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services chưa sẵn sàng.');
  }

  await new Promise<void>((resolve, reject) => {
    tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description || response.error || 'Google không cấp quyền truy cập.'));
          return;
        }
        accessToken = response.access_token;
        accessTokenExpiresAt = Date.now() + Math.max((response.expires_in ?? 3600) - 60, 60) * 1000;
        publishSyncState({ status: 'idle', error: null });
        resolve();
      },
      error_callback: (error) => reject(new Error(error.message || 'Không thể mở cửa sổ cấp quyền Google.')),
    });
    tokenClient.requestAccessToken({ prompt: '' });
  });
}

async function ensureAccessToken(interactive: boolean): Promise<string> {
  if (isGoogleConnected()) return accessToken!;
  accessToken = null;
  if (!interactive) throw new GoogleAuthRequiredError();
  await requestGoogleAccessToken();
  if (!accessToken) throw new GoogleAuthRequiredError();
  return accessToken;
}

async function driveRequest<T>(url: string, init: RequestInit = {}, interactive = true): Promise<T> {
  const token = await ensureAccessToken(interactive);
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(url, {
      ...init,
      signal: init.signal ?? controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
    });

    if (response.status === 401) {
    accessToken = null;
    accessTokenExpiresAt = 0;
    if (!interactive) throw new GoogleAuthRequiredError();
    throw new Error('Phiên Google đã hết hạn. Hãy bấm đồng bộ lại để cấp quyền mới.');
  }
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Google Drive trả về lỗi ${response.status}${detail ? `: ${detail.slice(0, 180)}` : ''}`);
    }
    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Google Drive không phản hồi kịp thời. Hãy kiểm tra kết nối rồi thử lại.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function findSyncFile(interactive: boolean): Promise<DriveFile | null> {
  const query = encodeURIComponent(`'appDataFolder' in parents and name = '${SYNC_FILE_NAME}' and trashed = false`);
  const result = await driveRequest<DriveFileList>(
    `https://www.googleapis.com/drive/v3/files?q=${query}&spaces=appDataFolder&orderBy=modifiedTime desc&pageSize=1&fields=files(id,name,modifiedTime)`,
    {},
    interactive
  );
  return result.files?.[0] ?? null;
}

async function readRemoteSnapshot(fileId: string, interactive: boolean): Promise<SyncSnapshot> {
  const result = await driveRequest<SyncSnapshot>(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
    {},
    interactive
  );
  if (
    !result
    || result.schemaVersion !== 1
    || !result.updatedAt
    || !result.deviceId
    || !result.records
    || !result.fingerprint
  ) {
    throw new Error('Tệp đồng bộ trên Google Drive không đúng định dạng BabyGrowth.');
  }
  return result;
}

async function writeRemoteSnapshot(snapshot: SyncSnapshot, file: DriveFile | null, interactive: boolean): Promise<DriveFile> {
  const metadata = file
    ? { name: SYNC_FILE_NAME, mimeType: 'application/json' }
    : { name: SYNC_FILE_NAME, mimeType: 'application/json', parents: ['appDataFolder'] };
  const boundary = `babygrowth-${Date.now()}`;
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: application/json',
    '',
    JSON.stringify(snapshot),
    `--${boundary}--`,
    '',
  ].join('\r\n');

  return driveRequest<DriveFile>(
    file
      ? `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(file.id)}?uploadType=multipart&fields=id,name,modifiedTime`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime',
    {
      method: file ? 'PATCH' : 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
    },
    interactive
  );
}

async function getLocalSnapshot(): Promise<SyncSnapshot> {
  return createSnapshot(await getAllLocalRecords([...SYNC_KEYS]));
}

async function saveSyncedState(snapshot: SyncSnapshot, remoteFileId: string): Promise<void> {
  await updateMeta({
    lastSyncedFingerprint: snapshot.fingerprint,
    remoteFileId,
    lastSyncedAt: new Date().toISOString(),
  });
}

function publishSyncResult(result: SyncResult): void {
  if (result.status === 'downloaded') {
    window.dispatchEvent(new Event('babygrowth:remote-updated'));
  }
  if (result.status === 'conflict') {
    publishSyncState({ status: 'conflict', conflict: result, error: null });
    return;
  }
  publishSyncState({
    status: 'synced',
    conflict: null,
    error: null,
    lastSyncedAt: new Date().toISOString(),
  });
}

export async function applyRemoteSnapshot(snapshot: SyncSnapshot): Promise<void> {
  suppressAutoSync = true;
  try {
    await Promise.all(SYNC_KEYS.map(async (key) => {
      const value = snapshot.records[key];
      if (value) {
        await setLocalRecord(key, value);
      } else {
        await removeLocalRecord(key);
      }
    }));
  } finally {
    suppressAutoSync = false;
  }
}

export async function syncWithGoogleDrive(options: { interactive?: boolean } = {}): Promise<SyncResult> {
  const interactive = options.interactive !== false;
  if (!navigator.onLine) {
    publishSyncState({ status: 'offline', error: 'Đang offline; dữ liệu vẫn được lưu cục bộ.' });
    throw new Error('Đang offline; hãy thử đồng bộ lại khi có kết nối mạng.');
  }

  publishSyncState({ status: 'syncing', error: null });
  try {
    const local = await getLocalSnapshot();
    const meta = await readMeta();
    const remoteFile = await findSyncFile(interactive);

    if (!remoteFile) {
      const created = await writeRemoteSnapshot(local, null, interactive);
      await saveSyncedState(local, created.id);
      const result: SyncResult = { status: 'uploaded', snapshot: local };
      publishSyncResult(result);
      return result;
    }

    const remote = await readRemoteSnapshot(remoteFile.id, interactive);
    if (remote.fingerprint === local.fingerprint) {
      await saveSyncedState(local, remoteFile.id);
      const result: SyncResult = { status: 'unchanged', snapshot: local };
      publishSyncResult(result);
      return result;
    }

    if (!meta.lastSyncedFingerprint) {
      const result: SyncResult = { status: 'conflict', reason: 'first_sync', local, remote };
      publishSyncResult(result);
      return result;
    }

    if (local.fingerprint === meta.lastSyncedFingerprint) {
      await applyRemoteSnapshot(remote);
      await saveSyncedState(remote, remoteFile.id);
      const result: SyncResult = { status: 'downloaded', snapshot: remote };
      publishSyncResult(result);
      return result;
    }

    if (remote.fingerprint === meta.lastSyncedFingerprint) {
      const updated = await writeRemoteSnapshot(local, remoteFile, interactive);
      await saveSyncedState(local, updated.id);
      const result: SyncResult = { status: 'uploaded', snapshot: local };
      publishSyncResult(result);
      return result;
    }

    const result: SyncResult = { status: 'conflict', reason: 'both_changed', local, remote };
    publishSyncResult(result);
    return result;
  } catch (error) {
    if (error instanceof GoogleAuthRequiredError) {
      publishSyncState({ status: 'auth-required', error: error.message });
    } else if (!navigator.onLine) {
      publishSyncState({ status: 'offline', error: 'Đang offline; dữ liệu vẫn được lưu cục bộ.' });
    } else {
      publishSyncState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Không thể đồng bộ Google Drive.',
      });
    }
    throw error;
  }
}

export async function resolveSyncConflict(choice: 'local' | 'remote', remoteSnapshot: SyncSnapshot): Promise<'uploaded' | 'downloaded'> {
  if (!navigator.onLine) {
    publishSyncState({ status: 'offline', error: 'Đang offline; hãy kết nối mạng trước khi xử lý xung đột.' });
    throw new Error('Đang offline; hãy kết nối mạng trước khi xử lý xung đột.');
  }

  const remoteFile = await findSyncFile(true);
  if (!remoteFile) throw new Error('Không tìm thấy tệp đồng bộ trên Google Drive.');

  if (choice === 'remote') {
    await applyRemoteSnapshot(remoteSnapshot);
    await saveSyncedState(remoteSnapshot, remoteFile.id);
    window.dispatchEvent(new Event('babygrowth:remote-updated'));
    publishSyncState({ status: 'synced', conflict: null, error: null });
    return 'downloaded';
  }

  const local = await getLocalSnapshot();
  const updated = await writeRemoteSnapshot(local, remoteFile, true);
  await saveSyncedState(local, updated.id);
  publishSyncState({ status: 'synced', conflict: null, error: null });
  return 'uploaded';
}

export async function getLastSyncedAt(): Promise<string | null> {
  return (await readMeta()).lastSyncedAt;
}

export async function isAutoSyncEnabled(): Promise<boolean> {
  return (await readMeta()).autoSyncEnabled;
}

export async function setAutoSyncEnabled(enabled: boolean): Promise<void> {
  await updateMeta({ autoSyncEnabled: enabled });
  publishSyncState({
    autoSyncEnabled: enabled,
    status: !navigator.onLine
      ? 'offline'
      : enabled && !isGoogleConnected()
        ? 'auth-required'
        : syncState.status,
  });
  if (enabled && autoSyncStop) scheduleAutoSync(0);
}

function scheduleAutoSync(delay = AUTO_SYNC_DEBOUNCE_MS): void {
  if (autoSyncDebounceTimer !== null) window.clearTimeout(autoSyncDebounceTimer);
  autoSyncDebounceTimer = window.setTimeout(() => {
    autoSyncDebounceTimer = null;
    void runAutoSync();
  }, delay);
}

async function runAutoSync(): Promise<void> {
  if (autoSyncInFlight || suppressAutoSync || !navigator.onLine) return;
  const meta = await readMeta();
  if (!meta.autoSyncEnabled) return;
  if (!isGoogleConnected()) {
    publishSyncState({ status: 'auth-required', autoSyncEnabled: true, error: 'Bấm kết nối Google để bật lại auto-sync.' });
    return;
  }

  autoSyncInFlight = true;
  try {
    await syncWithGoogleDrive({ interactive: false });
  } catch {
    // The sync state already contains a user-facing error. Local writes continue normally.
  } finally {
    autoSyncInFlight = false;
  }
}

export async function startAutoSync(): Promise<() => void> {
  if (autoSyncStop) return autoSyncStop;
  if (autoSyncStartPromise) return autoSyncStartPromise;

  autoSyncStartPromise = (async () => {
    const meta = await readMeta();
    publishSyncState({
      autoSyncEnabled: meta.autoSyncEnabled,
      lastSyncedAt: meta.lastSyncedAt,
      status: navigator.onLine ? 'idle' : 'offline',
      error: navigator.onLine ? null : 'Đang offline; dữ liệu vẫn được lưu cục bộ.',
    });

  const onLocalRecordChanged = (key: string) => {
    if (suppressAutoSync) return;
    if (AUTO_SYNC_KEYS.has(key)) scheduleAutoSync();
  };
  const onOnline = () => {
    publishSyncState({ status: 'idle', error: null });
    scheduleAutoSync(500);
  };
  const onOffline = () => {
    publishSyncState({ status: 'offline', error: 'Đang offline; dữ liệu vẫn được lưu cục bộ.' });
  };
  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') scheduleAutoSync(500);
  };

  const unsubscribe = subscribeLocalRecordChanges(onLocalRecordChanged);
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  document.addEventListener('visibilitychange', onVisibilityChange);
  autoSyncTimer = window.setInterval(() => scheduleAutoSync(0), AUTO_SYNC_INTERVAL_MS);

  autoSyncStop = () => {
    unsubscribe();
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (autoSyncTimer !== null) window.clearInterval(autoSyncTimer);
    if (autoSyncDebounceTimer !== null) window.clearTimeout(autoSyncDebounceTimer);
    autoSyncTimer = null;
    autoSyncDebounceTimer = null;
    autoSyncStop = null;
  };

    scheduleAutoSync(2000);
    return autoSyncStop!;
  })();

  try {
    return await autoSyncStartPromise;
  } finally {
    autoSyncStartPromise = null;
  }
}

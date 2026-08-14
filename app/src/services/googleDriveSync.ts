import { getAllLocalRecords, getLocalRecord, setLocalRecord } from './localDb';

const SYNC_FILE_NAME = 'babygrowth-sync.json';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const SYNC_META_KEY = 'babygrowth_v2_sync_meta';
const SYNC_KEYS = [
  'babygrowth_v2_baby',
  'babygrowth_v2_mom',
  'babygrowth_v2_chat',
  'babygrowth_v2_timeline',
  'babygrowth_v2_ui',
] as const;

interface GoogleTokenResponse {
  access_token?: string;
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
}

export type SyncResult =
  | { status: 'uploaded'; snapshot: SyncSnapshot }
  | { status: 'downloaded'; snapshot: SyncSnapshot }
  | { status: 'unchanged'; snapshot: SyncSnapshot }
  | { status: 'conflict'; reason: SyncConflictReason; local: SyncSnapshot; remote: SyncSnapshot };

let accessToken: string | null = null;
let tokenClient: GoogleTokenClient | null = null;
let tokenScriptPromise: Promise<void> | null = null;

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
  if (!raw) return { lastSyncedFingerprint: null, remoteFileId: null, lastSyncedAt: null };
  try {
    return JSON.parse(raw) as SyncMeta;
  } catch {
    return { lastSyncedFingerprint: null, remoteFileId: null, lastSyncedAt: null };
  }
}

async function writeMeta(meta: SyncMeta): Promise<void> {
  await setLocalRecord(SYNC_META_KEY, JSON.stringify(meta));
}

async function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return;
  if (tokenScriptPromise) return tokenScriptPromise;

  tokenScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-identity-services]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Không tải được Google Identity Services')), { once: true });
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
  return Boolean(accessToken);
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
        resolve();
      },
      error_callback: (error) => reject(new Error(error.message || 'Không thể mở cửa sổ cấp quyền Google.')),
    });
    tokenClient.requestAccessToken({ prompt: '' });
  });
}

async function ensureAccessToken(): Promise<string> {
  if (!accessToken) await requestGoogleAccessToken();
  if (!accessToken) throw new Error('Chưa có quyền truy cập Google Drive.');
  return accessToken;
}

async function driveRequest<T>(url: string, init: RequestInit = {}): Promise<T> {
  const token = await ensureAccessToken();
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });

  if (response.status === 401) {
    accessToken = null;
    throw new Error('Phiên Google đã hết hạn. Hãy bấm đồng bộ lại để cấp quyền mới.');
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Google Drive trả về lỗi ${response.status}${detail ? `: ${detail.slice(0, 180)}` : ''}`);
  }
  return response.json() as Promise<T>;
}

interface DriveFile {
  id: string;
  name: string;
  modifiedTime?: string;
}

interface DriveFileList {
  files?: DriveFile[];
}

async function findSyncFile(): Promise<DriveFile | null> {
  const query = encodeURIComponent(`'appDataFolder' in parents and name = '${SYNC_FILE_NAME}' and trashed = false`);
  const result = await driveRequest<DriveFileList>(
    `https://www.googleapis.com/drive/v3/files?q=${query}&spaces=appDataFolder&fields=files(id,name,modifiedTime)`
  );
  return result.files?.[0] ?? null;
}

async function readRemoteSnapshot(fileId: string): Promise<SyncSnapshot> {
  const result = await driveRequest<SyncSnapshot>(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`
  );
  if (!result || result.schemaVersion !== 1 || !result.records || !result.fingerprint) {
    throw new Error('Tệp đồng bộ trên Google Drive không đúng định dạng BabyGrowth.');
  }
  return result;
}

async function writeRemoteSnapshot(snapshot: SyncSnapshot, file: DriveFile | null): Promise<DriveFile> {
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
    }
  );
}

async function getLocalSnapshot(): Promise<SyncSnapshot> {
  return createSnapshot(await getAllLocalRecords([...SYNC_KEYS]));
}

async function saveSyncedState(snapshot: SyncSnapshot, remoteFileId: string): Promise<void> {
  await writeMeta({
    lastSyncedFingerprint: snapshot.fingerprint,
    remoteFileId,
    lastSyncedAt: new Date().toISOString(),
  });
}

export async function applyRemoteSnapshot(snapshot: SyncSnapshot): Promise<void> {
  await Promise.all(SYNC_KEYS.map(async (key) => {
    const value = snapshot.records[key];
    if (value) await setLocalRecord(key, value);
  }));
}

export async function syncWithGoogleDrive(): Promise<SyncResult> {
  const local = await getLocalSnapshot();
  const meta = await readMeta();
  const remoteFile = await findSyncFile();

  if (!remoteFile) {
    const created = await writeRemoteSnapshot(local, null);
    await saveSyncedState(local, created.id);
    return { status: 'uploaded', snapshot: local };
  }

  const remote = await readRemoteSnapshot(remoteFile.id);
  if (remote.fingerprint === local.fingerprint) {
    await saveSyncedState(local, remoteFile.id);
    return { status: 'unchanged', snapshot: local };
  }

  if (!meta.lastSyncedFingerprint) {
    return { status: 'conflict', reason: 'first_sync', local, remote };
  }

  if (local.fingerprint === meta.lastSyncedFingerprint) {
    await applyRemoteSnapshot(remote);
    await saveSyncedState(remote, remoteFile.id);
    return { status: 'downloaded', snapshot: remote };
  }

  if (remote.fingerprint === meta.lastSyncedFingerprint) {
    const updated = await writeRemoteSnapshot(local, remoteFile);
    await saveSyncedState(local, updated.id);
    return { status: 'uploaded', snapshot: local };
  }

  return { status: 'conflict', reason: 'both_changed', local, remote };
}

export async function resolveSyncConflict(choice: 'local' | 'remote', remoteSnapshot: SyncSnapshot): Promise<'uploaded' | 'downloaded'> {
  const remoteFile = await findSyncFile();
  if (!remoteFile) throw new Error('Không tìm thấy tệp đồng bộ trên Google Drive.');

  if (choice === 'remote') {
    await applyRemoteSnapshot(remoteSnapshot);
    await saveSyncedState(remoteSnapshot, remoteFile.id);
    return 'downloaded';
  }

  const local = await getLocalSnapshot();
  const updated = await writeRemoteSnapshot(local, remoteFile);
  await saveSyncedState(local, updated.id);
  return 'uploaded';
}

export async function getLastSyncedAt(): Promise<string | null> {
  return (await readMeta()).lastSyncedAt;
}

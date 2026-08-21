import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

function file(path) {
  return join(ROOT, path);
}

function read(path) {
  return readFileSync(file(path), 'utf8');
}

function write(path, content) {
  writeFileSync(file(path), content, 'utf8');
}

function replaceOnce(source, search, replacement, label) {
  const first = source.indexOf(search);
  if (first < 0) throw new Error(`Missing migration marker: ${label}`);
  if (source.indexOf(search, first + search.length) >= 0) throw new Error(`Migration marker is not unique: ${label}`);
  return source.slice(0, first) + replacement + source.slice(first + search.length);
}

function replaceBlock(source, startMarker, endMarker, replacement, label) {
  const start = source.indexOf(startMarker);
  if (start < 0) throw new Error(`Missing block start: ${label}`);
  const end = source.indexOf(endMarker, start);
  if (end < 0) throw new Error(`Missing block end: ${label}`);
  return source.slice(0, start) + replacement + '\n\n' + source.slice(end);
}

const serializationSource = `import type { AppSnapshot } from './appSnapshot';

export interface SyncSnapshotSerializationInput {
  schemaVersion: 2;
  updatedAt: string;
  deviceId: string;
  data: AppSnapshot;
}

export interface SyncSnapshotSerializationResult {
  fingerprint: string;
  json: string;
}

function fingerprintSerializedData(value: string): string {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(16).padStart(8, '0');
}

export function serializeSyncSnapshotPayload(
  input: SyncSnapshotSerializationInput,
): SyncSnapshotSerializationResult {
  const serializedData = JSON.stringify(input.data);
  const fingerprint = fingerprintSerializedData(serializedData);
  const json = '{"schemaVersion":2,"updatedAt":'
    + JSON.stringify(input.updatedAt)
    + ',"deviceId":'
    + JSON.stringify(input.deviceId)
    + ',"fingerprint":'
    + JSON.stringify(fingerprint)
    + ',"data":'
    + serializedData
    + '}';

  return { fingerprint, json };
}
`;

const protocolSource = `import type { SyncSnapshotSerializationInput } from './syncSnapshotSerialization';

export type SyncSnapshotWorkerRequest = {
  kind: 'serialize';
  input: SyncSnapshotSerializationInput;
};

export type SyncSnapshotWorkerResponse =
  | { kind: 'success'; fingerprint: string; payload: Blob }
  | { kind: 'error'; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isSyncSnapshotWorkerRequest(value: unknown): value is SyncSnapshotWorkerRequest {
  if (!isRecord(value) || value.kind !== 'serialize' || !isRecord(value.input)) return false;
  const input = value.input;
  return input.schemaVersion === 2
    && typeof input.updatedAt === 'string'
    && typeof input.deviceId === 'string'
    && isRecord(input.data);
}

export function isSyncSnapshotWorkerResponse(value: unknown): value is SyncSnapshotWorkerResponse {
  if (!isRecord(value) || typeof value.kind !== 'string') return false;
  if (value.kind === 'error') return typeof value.message === 'string';
  return value.kind === 'success'
    && typeof value.fingerprint === 'string'
    && value.payload instanceof Blob;
}
`;

const workerSource = `import { serializeSyncSnapshotPayload } from './syncSnapshotSerialization';
import {
  isSyncSnapshotWorkerRequest,
  type SyncSnapshotWorkerResponse,
} from './syncSnapshotWorkerProtocol';

function send(response: SyncSnapshotWorkerResponse): void {
  Reflect.apply(globalThis.postMessage, globalThis, [response]);
}

globalThis.addEventListener('message', (event: MessageEvent<unknown>) => {
  try {
    if (!isSyncSnapshotWorkerRequest(event.data)) {
      send({ kind: 'error', message: 'Invalid sync snapshot worker request.' });
      return;
    }

    const serialized = serializeSyncSnapshotPayload(event.data.input);
    send({
      kind: 'success',
      fingerprint: serialized.fingerprint,
      payload: new Blob([serialized.json], { type: 'application/json' }),
    });
  } catch (error) {
    send({
      kind: 'error',
      message: error instanceof Error ? error.message : 'Unable to serialize sync snapshot.',
    });
  }
});
`;

const workerAdapterSource = `import {
  serializeSyncSnapshotPayload,
  type SyncSnapshotSerializationInput,
} from './syncSnapshotSerialization';
import {
  isSyncSnapshotWorkerResponse,
  type SyncSnapshotWorkerRequest,
} from './syncSnapshotWorkerProtocol';

export interface SerializedSyncSnapshot {
  fingerprint: string;
  payload: Blob;
}

const WORKER_TIMEOUT_MS = 30_000;

function serializeOnCurrentThread(input: SyncSnapshotSerializationInput): SerializedSyncSnapshot {
  const serialized = serializeSyncSnapshotPayload(input);
  return {
    fingerprint: serialized.fingerprint,
    payload: new Blob([serialized.json], { type: 'application/json' }),
  };
}

export function serializeSyncSnapshotOffMainThread(
  input: SyncSnapshotSerializationInput,
): Promise<SerializedSyncSnapshot> {
  if (typeof Worker !== 'function') return Promise.resolve(serializeOnCurrentThread(input));

  let worker: Worker;
  try {
    worker = new Worker(new URL('./syncSnapshot.worker.ts', import.meta.url), {
      type: 'module',
      name: 'babygrowth-sync-snapshot',
    });
  } catch {
    return Promise.resolve(serializeOnCurrentThread(input));
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: SerializedSyncSnapshot) => {
      if (settled) return;
      settled = true;
      globalThis.clearTimeout(timeoutId);
      worker.onmessage = null;
      worker.onerror = null;
      worker.terminate();
      resolve(result);
    };
    const fallback = () => finish(serializeOnCurrentThread(input));
    const timeoutId = globalThis.setTimeout(fallback, WORKER_TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent<unknown>) => {
      if (!isSyncSnapshotWorkerResponse(event.data) || event.data.kind === 'error') {
        fallback();
        return;
      }
      finish({ fingerprint: event.data.fingerprint, payload: event.data.payload });
    };
    worker.onerror = fallback;

    const request: SyncSnapshotWorkerRequest = { kind: 'serialize', input };
    worker.postMessage(request);
  });
}
`;

const serializationTestSource = `import { describe, expect, it } from 'vitest';
import { exportAppSnapshot } from './appSnapshot';
import {
  serializeSyncSnapshotPayload,
  type SyncSnapshotSerializationInput,
} from './syncSnapshotSerialization';

function legacyFingerprint(value: string): string {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(16).padStart(8, '0');
}

describe('sync snapshot serialization', () => {
  it('preserves the generation-2 fingerprint and payload contract', () => {
    const data = exportAppSnapshot(new Date('2026-08-21T14:00:00.000Z'));
    const input: SyncSnapshotSerializationInput = {
      schemaVersion: 2,
      updatedAt: '2026-08-21T14:01:00.000Z',
      deviceId: 'device-test',
      data,
    };

    const serialized = serializeSyncSnapshotPayload(input);
    const expectedFingerprint = legacyFingerprint(JSON.stringify(data));

    expect(serialized.fingerprint).toBe(expectedFingerprint);
    expect(JSON.parse(serialized.json)).toEqual({
      schemaVersion: 2,
      updatedAt: input.updatedAt,
      deviceId: input.deviceId,
      fingerprint: expectedFingerprint,
      data,
    });
  });
});
`;

const workerAdapterTestSource = `import { afterEach, describe, expect, it, vi } from 'vitest';
import { exportAppSnapshot } from './appSnapshot';
import { serializeSyncSnapshotPayload, type SyncSnapshotSerializationInput } from './syncSnapshotSerialization';
import { serializeSyncSnapshotOffMainThread } from './syncSnapshotWorker';

function input(): SyncSnapshotSerializationInput {
  return {
    schemaVersion: 2,
    updatedAt: '2026-08-21T14:01:00.000Z',
    deviceId: 'device-test',
    data: exportAppSnapshot(new Date('2026-08-21T14:00:00.000Z')),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('sync snapshot worker adapter', () => {
  it('keeps a reliable fallback when Worker is unavailable', async () => {
    vi.stubGlobal('Worker', undefined);
    const request = input();
    const expected = serializeSyncSnapshotPayload(request);

    const result = await serializeSyncSnapshotOffMainThread(request);

    expect(result.fingerprint).toBe(expected.fingerprint);
    expect(await result.payload.text()).toBe(expected.json);
  });

  it('uses the worker response without serializing the payload again', async () => {
    let posted: unknown;
    let terminated = false;

    class FakeWorker {
      onmessage: ((event: MessageEvent<unknown>) => void) | null = null;
      onerror: (() => void) | null = null;

      postMessage(message: unknown): void {
        posted = message;
        queueMicrotask(() => {
          this.onmessage?.(new MessageEvent('message', {
            data: {
              kind: 'success',
              fingerprint: 'worker-fingerprint',
              payload: new Blob(['worker-payload'], { type: 'application/json' }),
            },
          }));
        });
      }

      terminate(): void {
        terminated = true;
      }
    }

    vi.stubGlobal('Worker', FakeWorker);
    const result = await serializeSyncSnapshotOffMainThread(input());

    expect(posted).toMatchObject({ kind: 'serialize' });
    expect(result.fingerprint).toBe('worker-fingerprint');
    expect(await result.payload.text()).toBe('worker-payload');
    expect(terminated).toBe(true);
  });
});
`;

write('app/src/features/sync/syncSnapshotSerialization.ts', serializationSource);
write('app/src/features/sync/syncSnapshotWorkerProtocol.ts', protocolSource);
write('app/src/features/sync/syncSnapshot.worker.ts', workerSource);
write('app/src/features/sync/syncSnapshotWorker.ts', workerAdapterSource);
write('app/src/features/sync/syncSnapshotSerialization.test.ts', serializationTestSource);
write('app/src/features/sync/syncSnapshotWorker.test.ts', workerAdapterTestSource);

let sync = read('app/src/features/sync/googleDriveSync.ts');
sync = replaceOnce(
  sync,
  "import { exportAppSnapshot, parseAppSnapshot, applyAppSnapshot, subscribeAppSnapshotChanges, type AppSnapshot } from './appSnapshot';\n",
  "import { exportAppSnapshot, parseAppSnapshot, applyAppSnapshot, subscribeAppSnapshotChanges, type AppSnapshot } from './appSnapshot';\nimport { serializeSyncSnapshotPayload, type SyncSnapshotSerializationInput } from './syncSnapshotSerialization';\nimport { serializeSyncSnapshotOffMainThread } from './syncSnapshotWorker';\n",
  'sync imports',
);

sync = replaceOnce(
  sync,
  `export interface SyncSnapshot {\n  schemaVersion: 2;\n  updatedAt: string;\n  deviceId: string;\n  fingerprint: string;\n  data: AppSnapshot;\n}\n`,
  `export interface SyncSnapshot {\n  schemaVersion: 2;\n  updatedAt: string;\n  deviceId: string;\n  fingerprint: string;\n  data: AppSnapshot;\n}\n\ninterface PreparedSyncSnapshot {\n  snapshot: SyncSnapshot;\n  payload: Blob;\n}\n`,
  'prepared snapshot type',
);

sync = replaceBlock(
  sync,
  'function hash(value: string): string {',
  'async function readMeta(): Promise<SyncMeta> {',
  `function createSyncSnapshotInput(data: AppSnapshot): SyncSnapshotSerializationInput {\n  return {\n    schemaVersion: 2,\n    updatedAt: new Date().toISOString(),\n    deviceId: getDeviceId(),\n    data,\n  };\n}\n\nfunction syncSnapshotFromInput(\n  input: SyncSnapshotSerializationInput,\n  fingerprint: string,\n): SyncSnapshot {\n  return {\n    schemaVersion: input.schemaVersion,\n    updatedAt: input.updatedAt,\n    deviceId: input.deviceId,\n    fingerprint,\n    data: input.data,\n  };\n}\n\nexport function createSyncSnapshot(data: AppSnapshot = exportAppSnapshot()): SyncSnapshot {\n  const input = createSyncSnapshotInput(data);\n  const serialized = serializeSyncSnapshotPayload(input);\n  return syncSnapshotFromInput(input, serialized.fingerprint);\n}`,
  'snapshot creation',
);

sync = replaceBlock(
  sync,
  'async function writeRemoteSnapshot(',
  'async function saveSyncedState(snapshot: SyncSnapshot, remoteFileId: string): Promise<void> {',
  `async function writeRemoteSnapshot(payload: Blob, file: DriveFile | null, interactive: boolean): Promise<DriveFile> {\n  const metadata = file\n    ? { name: SYNC_FILE_NAME, mimeType: 'application/json' }\n    : { name: SYNC_FILE_NAME, mimeType: 'application/json', parents: ['appDataFolder'] };\n  const boundary = \`babygrowth-\${Date.now()}\`;\n  const contentType = \`multipart/related; boundary=\${boundary}\`;\n  const body = new Blob([\n    \`--\${boundary}\\r\\nContent-Type: application/json; charset=UTF-8\\r\\n\\r\\n\${JSON.stringify(metadata)}\\r\\n\`,\n    \`--\${boundary}\\r\\nContent-Type: application/json\\r\\n\\r\\n\`,\n    payload,\n    \`\\r\\n--\${boundary}--\\r\\n\`,\n  ], { type: contentType });\n\n  return driveRequest<DriveFile>(\n    file\n      ? \`https://www.googleapis.com/upload/drive/v3/files/\${encodeURIComponent(file.id)}?uploadType=multipart&fields=id,name,modifiedTime\`\n      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime',\n    {\n      method: file ? 'PATCH' : 'POST',\n      headers: { 'Content-Type': contentType },\n      body,\n    },\n    interactive,\n  );\n}\n\nasync function getLocalSnapshot(): Promise<PreparedSyncSnapshot> {\n  const input = createSyncSnapshotInput(exportAppSnapshot());\n  const serialized = await serializeSyncSnapshotOffMainThread(input);\n  return {\n    snapshot: syncSnapshotFromInput(input, serialized.fingerprint),\n    payload: serialized.payload,\n  };\n}`,
  'remote snapshot serialization',
);

sync = replaceOnce(
  sync,
  `  const local = await getLocalSnapshot();\n  const remoteFile = await findSyncFile(interactive);\n  const savedFile = await writeRemoteSnapshot(local, remoteFile, interactive);\n  await saveSyncedState(local, savedFile.id);\n  publishSyncState({ status: 'synced', conflict: null, error: null, lastSyncedAt: new Date().toISOString() });\n  return local;`,
  `  const preparedLocal = await getLocalSnapshot();\n  const local = preparedLocal.snapshot;\n  const remoteFile = await findSyncFile(interactive);\n  const savedFile = await writeRemoteSnapshot(preparedLocal.payload, remoteFile, interactive);\n  await saveSyncedState(local, savedFile.id);\n  publishSyncState({ status: 'synced', conflict: null, error: null, lastSyncedAt: new Date().toISOString() });\n  return local;`,
  'overwrite local preparation',
);

sync = replaceOnce(
  sync,
  `    const local = await getLocalSnapshot();\n    const meta = await readMeta();`,
  `    const preparedLocal = await getLocalSnapshot();\n    const local = preparedLocal.snapshot;\n    const meta = await readMeta();`,
  'sync local preparation',
);

sync = replaceOnce(
  sync,
  '      const created = await writeRemoteSnapshot(local, null, interactive);',
  '      const created = await writeRemoteSnapshot(preparedLocal.payload, null, interactive);',
  'initial remote upload payload',
);

sync = replaceOnce(
  sync,
  '      const updated = await writeRemoteSnapshot(local, remoteFile, interactive);',
  '      const updated = await writeRemoteSnapshot(preparedLocal.payload, remoteFile, interactive);',
  'remote update payload',
);

sync = replaceOnce(
  sync,
  `  const local = await getLocalSnapshot();\n  const updated = await writeRemoteSnapshot(local, remoteFile, true);\n  await saveSyncedState(local, updated.id);`,
  `  const preparedLocal = await getLocalSnapshot();\n  const local = preparedLocal.snapshot;\n  const updated = await writeRemoteSnapshot(preparedLocal.payload, remoteFile, true);\n  await saveSyncedState(local, updated.id);`,
  'conflict local upload payload',
);

if (sync.includes('fingerprint: hash(JSON.stringify(data))')) throw new Error('Legacy main-thread fingerprint serialization remains.');
if (sync.includes('JSON.stringify(snapshot)')) throw new Error('Snapshot is still serialized during Drive upload.');
write('app/src/features/sync/googleDriveSync.ts', sync);

let syncTest = read('app/src/features/sync/googleDriveSync.test.ts');
syncTest = replaceOnce(
  syncTest,
  "    expect(String(fetchMock.mock.calls[3][1]?.body)).toContain('babygrowth-sync-v2.json');",
  "    const uploadBody = fetchMock.mock.calls[3][1]?.body;\n    expect(uploadBody).toBeInstanceOf(Blob);\n    if (!(uploadBody instanceof Blob)) throw new Error('Expected Drive snapshot upload to use a Blob body.');\n    expect(await uploadBody.text()).toContain('babygrowth-sync-v2.json');",
  'Drive upload Blob assertion',
);
write('app/src/features/sync/googleDriveSync.test.ts', syncTest);

let performanceTest = read('app/src/features/sync/autoSyncPerformance.test.mjs');
const closing = '\n});\n';
const closingIndex = performanceTest.lastIndexOf(closing);
if (closingIndex < 0) throw new Error('Unable to extend auto-sync performance contract.');
const workerContract = `\n\n  it('moves local snapshot serialization and fingerprinting off the main thread', () => {\n    const sync = source('features/sync/googleDriveSync.ts');\n    const adapter = source('features/sync/syncSnapshotWorker.ts');\n    const worker = source('features/sync/syncSnapshot.worker.ts');\n\n    expect(sync).toContain('serializeSyncSnapshotOffMainThread');\n    expect(sync).toContain('preparedLocal.payload');\n    expect(sync).not.toContain('fingerprint: hash(JSON.stringify(data))');\n    expect(sync).not.toContain('JSON.stringify(snapshot)');\n    expect(adapter).toContain("new Worker(new URL('./syncSnapshot.worker.ts', import.meta.url)");\n    expect(worker).toContain('serializeSyncSnapshotPayload');\n  });`;
performanceTest = performanceTest.slice(0, closingIndex) + workerContract + performanceTest.slice(closingIndex);
write('app/src/features/sync/autoSyncPerformance.test.mjs', performanceTest);

console.log('Sync snapshot worker migration applied.');

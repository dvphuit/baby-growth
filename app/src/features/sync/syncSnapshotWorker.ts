import {
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

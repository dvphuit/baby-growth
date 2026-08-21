import { serializeSyncSnapshotPayload } from './syncSnapshotSerialization';
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

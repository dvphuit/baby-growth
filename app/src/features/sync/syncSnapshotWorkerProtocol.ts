import type { SyncSnapshotSerializationInput } from './syncSnapshotSerialization';

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

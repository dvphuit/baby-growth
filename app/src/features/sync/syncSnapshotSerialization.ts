import type { AppSnapshot } from './appSnapshot';

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

export function fingerprintAppSnapshot(data: AppSnapshot): string {
  return fingerprintSerializedData(JSON.stringify(data));
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

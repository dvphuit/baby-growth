import { describe, expect, it } from 'vitest';
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

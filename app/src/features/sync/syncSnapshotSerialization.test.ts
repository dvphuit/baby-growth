import { describe, expect, it } from 'vitest';
import { parseAppSnapshot } from './appSnapshot';
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

function snapshotData() {
  return parseAppSnapshot({
    generation: 2,
    exportedAt: '2026-08-21T14:00:00.000Z',
    profile: {
      familyData: {
        isInitialized: false,
        childName: '',
        childFullName: '',
        birthDate: '',
        gender: 'boy',
        bloodType: 'O+',
        childAvatar: '/assets/avatars/baby_avatar.jpg',
        momName: '',
        momAvatar: '/assets/avatars/mom_avatar.jpg',
      },
      profileMode: 'baby',
    },
    activities: { baby: [], mom: [], medicationCatalog: [] },
    growth: { currentStage: 'stage_0_1', stages: {}, completedHabitIds: [] },
    timeline: { items: [] },
    expenses: { records: [], monthlyBudget: 5_000_000 },
    reminders: { items: [], occurrenceStates: {}, systemNotificationsEnabled: false },
  });
}

describe('sync snapshot serialization', () => {
  it('preserves the generation-2 fingerprint and payload contract', () => {
    const data = snapshotData();
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

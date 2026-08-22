import { describe, expect, it } from 'vitest';
import { parseAppSnapshot } from './appSnapshot';
import { fingerprintAppSnapshot } from './syncSnapshotSerialization';
import {
  parseSyncSnapshot,
  SyncSnapshotIntegrityError,
  type SyncSnapshot,
  type SyncSnapshotIntegrityReason,
} from './syncSnapshotEnvelope';

function snapshotData() {
  return parseAppSnapshot({
    generation: 2,
    exportedAt: '2026-08-22T04:00:00.000Z',
    profile: {
      familyData: {
        isInitialized: true,
        childName: 'Bé Bơ',
        childFullName: 'Bé Bơ',
        birthDate: '2026-08-01',
        gender: 'girl',
        bloodType: 'O+',
        childAvatar: '/assets/avatars/baby_avatar.jpg',
        momName: 'Mẹ',
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

function envelope(): SyncSnapshot {
  const data = snapshotData();
  return {
    schemaVersion: 2,
    updatedAt: '2026-08-22T04:01:00.000Z',
    deviceId: 'device-test',
    fingerprint: fingerprintAppSnapshot(data),
    data,
  };
}

function expectIntegrityReason(operation: () => unknown, reason: SyncSnapshotIntegrityReason): void {
  try {
    operation();
    throw new Error('Expected snapshot integrity validation to fail.');
  } catch (error) {
    expect(error).toBeInstanceOf(SyncSnapshotIntegrityError);
    expect((error as SyncSnapshotIntegrityError).reason).toBe(reason);
  }
}

describe('sync snapshot envelope', () => {
  it('accepts a generation-2 envelope whose fingerprint matches the validated app snapshot', () => {
    const value = envelope();

    expect(parseSyncSnapshot(value)).toEqual(value);
  });

  it('rejects unsupported sync schema versions before reading domain data', () => {
    const value = { ...envelope(), schemaVersion: 3 };

    expectIntegrityReason(() => parseSyncSnapshot(value), 'unsupported-schema');
  });

  it.each([
    ['invalid updatedAt', { updatedAt: 'not-a-date' }],
    ['empty deviceId', { deviceId: '   ' }],
    ['invalid fingerprint shape', { fingerprint: 'bad-fingerprint' }],
  ])('rejects malformed envelope metadata: %s', (_label, patch) => {
    expectIntegrityReason(() => parseSyncSnapshot({ ...envelope(), ...patch }), 'invalid-envelope');
  });

  it('rejects malformed nested app data before fingerprint comparison', () => {
    const value = envelope();
    const malformed = {
      ...value,
      data: {
        ...value.data,
        expenses: { ...value.data.expenses, monthlyBudget: -1 },
      },
    };

    expectIntegrityReason(() => parseSyncSnapshot(malformed), 'invalid-data');
  });

  it('rejects a semantically valid backup when its data no longer matches the stored fingerprint', () => {
    const value = envelope();
    const tampered = structuredClone(value);
    tampered.data.profile.familyData.childName = 'Tampered';

    expectIntegrityReason(() => parseSyncSnapshot(tampered), 'fingerprint-mismatch');
  });
});

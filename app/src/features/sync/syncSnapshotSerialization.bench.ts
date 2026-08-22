import { bench, describe } from 'vitest';
import { parseAppSnapshot } from './appSnapshot';
import {
  serializeSyncSnapshotPayload,
  type SyncSnapshotSerializationInput,
} from './syncSnapshotSerialization';

interface BenchmarkCase {
  label: string;
  paddingBytes: number;
}

const CASES: BenchmarkCase[] = [
  { label: '256 KiB', paddingBytes: 256 * 1024 },
  { label: '1 MiB', paddingBytes: 1024 * 1024 },
];

function createSyntheticInput(paddingBytes: number): SyncSnapshotSerializationInput {
  const padding = 'x'.repeat(paddingBytes);
  const data = parseAppSnapshot({
    generation: 2,
    exportedAt: '2026-08-22T00:00:00.000Z',
    profile: {
      familyData: {
        isInitialized: true,
        childName: 'Bé Benchmark',
        childFullName: 'Bé Benchmark',
        birthDate: '2026-08-05',
        gender: 'boy',
        bloodType: 'O+',
        childAvatar: '/assets/avatars/baby_avatar.jpg',
        momName: 'Mẹ',
        momAvatar: '/assets/avatars/mom_avatar.jpg',
      },
      profileMode: 'baby',
    },
    activities: { baby: [], mom: [], medicationCatalog: [] },
    growth: { currentStage: 'stage_0_1', stages: {}, completedHabitIds: [] },
    timeline: {
      items: [{
        id: 'benchmark-padding',
        stage: 'stage_0_1',
        date: '2026-08-22',
        timeFormatted: '00:00',
        time: '22/08 • 00:00',
        author: 'Benchmark',
        authorAvatar: '/assets/avatars/baby_avatar.jpg',
        title: 'Serializer benchmark payload',
        content: padding,
        mediaUrl: null,
        mediaType: null,
        stats: [],
        likes: 0,
        comments: 0,
        userLiked: false,
        tag: 'Benchmark',
        tagType: 'general',
        type: 'daily',
      }],
    },
    expenses: { records: [], monthlyBudget: 5_000_000 },
    reminders: { items: [], occurrenceStates: {}, systemNotificationsEnabled: false },
  });

  return {
    schemaVersion: 2,
    updatedAt: '2026-08-22T00:00:01.000Z',
    deviceId: 'benchmark-device',
    data,
  };
}

for (const benchmarkCase of CASES) {
  const input = createSyntheticInput(benchmarkCase.paddingBytes);

  describe(`sync snapshot serialization - ${benchmarkCase.label}`, () => {
    bench('JSON.stringify baseline', () => {
      void JSON.stringify(input.data);
    });
    bench('structuredClone worker handoff', () => {
      void structuredClone(input.data);
    });
    bench('full snapshot serializer', () => {
      void serializeSyncSnapshotPayload(input);
    });
  });
}

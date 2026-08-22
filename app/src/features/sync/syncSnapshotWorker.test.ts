import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseAppSnapshot } from './appSnapshot';
import { serializeSyncSnapshotPayload, type SyncSnapshotSerializationInput } from './syncSnapshotSerialization';
import { serializeSyncSnapshotOffMainThread } from './syncSnapshotWorker';

function input(): SyncSnapshotSerializationInput {
  return {
    schemaVersion: 2,
    updatedAt: '2026-08-21T14:01:00.000Z',
    deviceId: 'device-test',
    data: parseAppSnapshot({
      generation: 2,
      exportedAt: '2026-08-21T14:00:00.000Z',
      profile: { familyData: {}, profileMode: 'baby' },
      activities: { baby: [], mom: [], medicationCatalog: [] },
      growth: { currentStage: 'stage_0_1', stages: {}, completedHabitIds: [] },
      timeline: { items: [] },
      expenses: { records: [], monthlyBudget: 5_000_000 },
      reminders: { items: [], occurrenceStates: {}, systemNotificationsEnabled: false },
    }),
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

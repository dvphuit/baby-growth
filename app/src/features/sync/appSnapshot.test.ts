import { beforeEach, describe, expect, it } from 'vitest';
import { useActivityStore } from '@/store/useActivityStore';
import { useBabyStore } from '@/store/useBabyStore';
import { useReminderStore } from '@/store/useReminderStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useUIStore } from '@/store/useUIStore';
import { APP_SNAPSHOT_GENERATION, applyAppSnapshot, exportAppSnapshot, parseAppSnapshot } from './appSnapshot';

describe('appSnapshot', () => {
  beforeEach(() => {
    useBabyStore.getState().resetToDefaults();
    useActivityStore.getState().resetTrackingData();
    useReminderStore.getState().resetTrackingData();
    useTimelineStore.setState({ timelineItems: [] });
    useUIStore.setState({ profileMode: 'baby' });
  });

  it('exports semantic generation-2 data instead of Zustand storage keys', () => {
    useBabyStore.getState().initializeChildProfile({ childName: 'Bé Bơ', birthDate: '2026-08-01' });
    useUIStore.setState({ profileMode: 'mom' });
    useActivityStore.getState().addMomActivity({
      owner: 'mom',
      type: 'pumping',
      amountMl: 90,
      side: 'both',
      occurredAt: '2026-08-20T08:00:00.000Z',
    });

    const snapshot = exportAppSnapshot(new Date('2026-08-20T09:00:00.000Z'));

    expect(snapshot.generation).toBe(APP_SNAPSHOT_GENERATION);
    expect(snapshot.exportedAt).toBe('2026-08-20T09:00:00.000Z');
    expect(snapshot.profile.familyData.childName).toBe('Bé Bơ');
    expect(snapshot.profile.profileMode).toBe('mom');
    expect(snapshot.activities.mom).toHaveLength(1);
    expect(snapshot).not.toHaveProperty('records');
    expect(JSON.stringify(snapshot)).not.toContain('babygrowth_v2_');
    expect(JSON.stringify(snapshot).toLowerCase()).not.toContain('chat');
  });

  it('round-trips domain state through the snapshot boundary', () => {
    useBabyStore.getState().initializeChildProfile({ childName: 'Bé Bơ', birthDate: '2026-08-01' });
    useActivityStore.getState().addBabyActivity({
      owner: 'baby',
      type: 'diaper',
      diaperKind: 'wet',
      occurredAt: '2026-08-20T07:00:00.000Z',
    });
    const snapshot = exportAppSnapshot(new Date('2026-08-20T09:00:00.000Z'));

    useBabyStore.getState().resetToDefaults();
    useActivityStore.getState().resetTrackingData();
    applyAppSnapshot(snapshot);

    expect(useBabyStore.getState().familyData.childName).toBe('Bé Bơ');
    expect(useActivityStore.getState().babyActivities).toHaveLength(1);
    expect(useActivityStore.getState().babyActivities[0]?.type).toBe('diaper');
  });

  it('rejects legacy or malformed snapshots at the boundary', () => {
    expect(() => parseAppSnapshot({ schemaVersion: 1, records: {} })).toThrow(/generation/i);
    expect(() => parseAppSnapshot({ generation: APP_SNAPSHOT_GENERATION })).toThrow(/generation/i);
  });
});

import { beforeEach, describe, expect, it } from 'vitest';
import { useActivityStore } from '@/features/activities/store/useActivityStore';
import { useBabyStore } from '@/store/useBabyStore';
import { useExpenseStore } from '@/features/expenses/store/useExpenseStore';
import { useReminderStore } from '@/features/reminders/store/useReminderStore';
import { useTimelineStore } from '@/features/timeline/store/useTimelineStore';
import { useUIStore } from '@/store/useUIStore';
import { APP_SNAPSHOT_GENERATION, applyAppSnapshot, exportAppSnapshot, parseAppSnapshot } from './appSnapshot';

describe('appSnapshot', () => {
  beforeEach(() => {
    useBabyStore.getState().resetToDefaults();
    useActivityStore.getState().resetTrackingData();
    useExpenseStore.getState().resetTrackingData();
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
    useExpenseStore.getState().addExpense({
      amount: 120_000,
      category: 'Tã bỉm & vệ sinh',
      occurredAt: '2026-08-20T08:30:00.000Z',
      note: 'Tã',
    });

    const snapshot = exportAppSnapshot(new Date('2026-08-20T09:00:00.000Z'));

    expect(snapshot.generation).toBe(APP_SNAPSHOT_GENERATION);
    expect(snapshot.exportedAt).toBe('2026-08-20T09:00:00.000Z');
    expect(snapshot.profile.familyData.childName).toBe('Bé Bơ');
    expect(snapshot.profile.profileMode).toBe('mom');
    expect(snapshot.activities.mom).toHaveLength(1);
    expect(snapshot.expenses.records).toHaveLength(1);
    expect(snapshot).not.toHaveProperty('records');
    expect(JSON.stringify(snapshot)).not.toContain('babygrowth_v');
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
    useExpenseStore.getState().setMonthlyBudget(7_000_000);
    useExpenseStore.getState().addExpense({
      amount: 85_000,
      category: 'Khác',
      occurredAt: '2026-08-20T07:30:00.000Z',
    });
    const snapshot = exportAppSnapshot(new Date('2026-08-20T09:00:00.000Z'));

    useBabyStore.getState().resetToDefaults();
    useActivityStore.getState().resetTrackingData();
    useExpenseStore.getState().resetTrackingData();
    applyAppSnapshot(snapshot);

    expect(useBabyStore.getState().familyData.childName).toBe('Bé Bơ');
    expect(useActivityStore.getState().babyActivities).toHaveLength(1);
    expect(useActivityStore.getState().babyActivities[0]?.type).toBe('diaper');
    expect(useExpenseStore.getState().monthlyBudget).toBe(7_000_000);
    expect(useExpenseStore.getState().expenses).toHaveLength(1);
  });

  it('rejects legacy or malformed snapshots at the boundary', () => {
    expect(() => parseAppSnapshot({ schemaVersion: 1, records: {} })).toThrow(/generation/i);
    expect(() => parseAppSnapshot({ generation: APP_SNAPSHOT_GENERATION })).toThrow(/generation/i);
  });
});

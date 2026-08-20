import { describe, expect, it } from 'vitest';
import type { BabyActivity, MomActivity } from '@/types';
import type { Reminder, ReminderOccurrenceState } from '@/types/reminder';
import { getReminderOccurrence } from './reminderScheduler';

function reminder(patch: Partial<Reminder>): Reminder {
  return {
    id: 'reminder-1',
    type: 'feeding',
    title: 'Nhắc cữ bú',
    enabled: true,
    mode: 'relative',
    repeat: 'none',
    intervalMinutes: 180,
    createdAt: '2026-08-16T00:00:00.000Z',
    updatedAt: '2026-08-16T00:00:00.000Z',
    ...patch,
  };
}

const emptyStates: Record<string, ReminderOccurrenceState> = {};

describe('reminderScheduler', () => {
  it('uses latest feeding activity plus editable interval', () => {
    const babyActivities: BabyActivity[] = [
      { id: 'feed-old', owner: 'baby', type: 'feeding', occurredAt: '2026-08-16T05:00:00.000Z', createdAt: '2026-08-16T05:00:00.000Z', amountMl: 60 },
      { id: 'feed-new', owner: 'baby', type: 'feeding', occurredAt: '2026-08-16T08:00:00.000Z', createdAt: '2026-08-16T08:00:00.000Z', amountMl: 90 },
    ];

    const occurrence = getReminderOccurrence({
      reminder: reminder({ intervalMinutes: 180 }),
      babyActivities,
      momActivities: [],
      occurrenceStates: emptyStates,
      now: new Date('2026-08-16T10:00:00.000Z'),
    });

    expect(occurrence?.occurrenceId).toBe('reminder-1@feed-new');
    expect(occurrence?.originalDueAt).toBe('2026-08-16T11:00:00.000Z');
  });

  it('uses latest pumping activity for pumping reminder', () => {
    const momActivities: MomActivity[] = [
      { id: 'pump-1', owner: 'mom', type: 'pumping', occurredAt: '2026-08-16T07:00:00.000Z', createdAt: '2026-08-16T07:00:00.000Z', amountMl: 120, side: 'both' },
    ];

    const occurrence = getReminderOccurrence({
      reminder: reminder({ type: 'pumping', title: 'Nhắc hút sữa', intervalMinutes: 240 }),
      babyActivities: [],
      momActivities,
      occurrenceStates: emptyStates,
      now: new Date('2026-08-16T08:00:00.000Z'),
    });

    expect(occurrence?.occurrenceId).toBe('reminder-1@pump-1');
    expect(occurrence?.originalDueAt).toBe('2026-08-16T11:00:00.000Z');
  });

  it('does not schedule a disabled reminder', () => {
    expect(getReminderOccurrence({
      reminder: reminder({ enabled: false }),
      babyActivities: [],
      momActivities: [],
      occurrenceStates: emptyStates,
      now: new Date('2026-08-16T08:00:00.000Z'),
    })).toBeNull();
  });

  it('honors snooze and completion state for a relative occurrence', () => {
    const babyActivities: BabyActivity[] = [
      { id: 'feed-new', owner: 'baby', type: 'feeding', occurredAt: '2026-08-16T08:00:00.000Z', createdAt: '2026-08-16T08:00:00.000Z', amountMl: 90 },
    ];
    const base = reminder({ intervalMinutes: 180 });
    const occurrenceId = 'reminder-1@feed-new';
    const snoozed = getReminderOccurrence({
      reminder: base,
      babyActivities,
      momActivities: [],
      occurrenceStates: {
        [occurrenceId]: { occurrenceId, reminderId: base.id, dueAt: '2026-08-16T11:00:00.000Z', snoozedUntil: '2026-08-16T11:10:00.000Z' },
      },
      now: new Date('2026-08-16T11:01:00.000Z'),
    });
    expect(snoozed?.dueAt).toBe('2026-08-16T11:10:00.000Z');

    expect(getReminderOccurrence({
      reminder: base,
      babyActivities,
      momActivities: [],
      occurrenceStates: {
        [occurrenceId]: { occurrenceId, reminderId: base.id, dueAt: '2026-08-16T11:00:00.000Z', completedAt: '2026-08-16T11:02:00.000Z' },
      },
      now: new Date('2026-08-16T11:03:00.000Z'),
    })).toBeNull();
  });

  it('creates a stable one-time fixed occurrence', () => {
    const fixed = reminder({ mode: 'fixed', triggerAt: '2026-08-20T08:00:00.000Z', repeat: 'none' });
    const occurrence = getReminderOccurrence({
      reminder: fixed,
      babyActivities: [],
      momActivities: [],
      occurrenceStates: emptyStates,
      now: new Date('2026-08-19T08:00:00.000Z'),
    });
    expect(occurrence?.originalDueAt).toBe('2026-08-20T08:00:00.000Z');
  });
});

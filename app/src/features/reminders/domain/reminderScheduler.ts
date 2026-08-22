
import type { BabyActivity, MomActivity } from '@/features/activities';
import type { Reminder, ReminderOccurrence, ReminderOccurrenceState } from '@/types/reminder';

function occurrenceId(reminderId: string, discriminator: string): string {
  return `${reminderId}@${discriminator}`;
}

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function fixedOccurrence(reminder: Reminder, states: Record<string, ReminderOccurrenceState>, now: Date): ReminderOccurrence | null {
  if (!reminder.triggerAt) return null;
  const configured = new Date(reminder.triggerAt);
  if (!Number.isFinite(configured.getTime())) return null;

  let due = new Date(configured);
  if (reminder.repeat === 'daily') {
    const todayDue = new Date(now.getFullYear(), now.getMonth(), now.getDate(), configured.getHours(), configured.getMinutes(), 0, 0);
    const firstAllowed = new Date(configured.getFullYear(), configured.getMonth(), configured.getDate(), configured.getHours(), configured.getMinutes(), 0, 0);
    due = todayDue.getTime() < firstAllowed.getTime() ? firstAllowed : todayDue;

    const currentId = occurrenceId(reminder.id, localDateKey(due));
    if (states[currentId]?.completedAt) {
      due = new Date(due.getFullYear(), due.getMonth(), due.getDate() + 1, due.getHours(), due.getMinutes(), 0, 0);
    }
  }

  const id = reminder.repeat === 'daily'
    ? occurrenceId(reminder.id, localDateKey(due))
    : occurrenceId(reminder.id, due.toISOString());
  const state = states[id];
  return {
    occurrenceId: id,
    reminderId: reminder.id,
    dueAt: state?.snoozedUntil ?? due.toISOString(),
    originalDueAt: due.toISOString(),
    reminder,
    state,
  };
}

function relativeOccurrence(
  reminder: Reminder,
  babyActivities: BabyActivity[],
  momActivities: MomActivity[],
  states: Record<string, ReminderOccurrenceState>,
): ReminderOccurrence | null {
  const intervalMinutes = reminder.intervalMinutes ?? 0;
  if (intervalMinutes <= 0) return null;

  let source: Array<{ id: string; occurredAt: string }> = [];
  if (reminder.type === 'feeding') {
    source = babyActivities
      .filter((record) => record.type === 'feeding')
      .map((record) => ({ id: record.id, occurredAt: record.occurredAt }));
  } else if (reminder.type === 'pumping') {
    source = momActivities
      .filter((record) => record.type === 'pumping')
      .map((record) => ({ id: record.id, occurredAt: record.occurredAt }));
  }

  const latest = source.reduce<{ id: string; occurredAt: string } | null>((current, record) => {
    if (!current) return record;
    return new Date(record.occurredAt).getTime() > new Date(current.occurredAt).getTime() ? record : current;
  }, null);
  if (!latest) return null;

  const originalDue = new Date(new Date(latest.occurredAt).getTime() + intervalMinutes * 60_000);
  const id = occurrenceId(reminder.id, latest.id);
  const state = states[id];
  if (state?.completedAt) return null;

  return {
    occurrenceId: id,
    reminderId: reminder.id,
    dueAt: state?.snoozedUntil ?? originalDue.toISOString(),
    originalDueAt: originalDue.toISOString(),
    reminder,
    state,
  };
}

export function getReminderOccurrence(input: {
  reminder: Reminder;
  babyActivities: BabyActivity[];
  momActivities: MomActivity[];
  occurrenceStates: Record<string, ReminderOccurrenceState>;
  now: Date;
}): ReminderOccurrence | null {
  const { reminder, babyActivities, momActivities, occurrenceStates, now } = input;
  if (!reminder.enabled) return null;
  if (reminder.mode === 'relative') return relativeOccurrence(reminder, babyActivities, momActivities, occurrenceStates);
  const occurrence = fixedOccurrence(reminder, occurrenceStates, now);
  if (occurrence?.state?.completedAt) return null;
  return occurrence;
}

export function getReminderOccurrences(input: {
  reminders: Reminder[];
  babyActivities: BabyActivity[];
  momActivities: MomActivity[];
  occurrenceStates: Record<string, ReminderOccurrenceState>;
  now: Date;
}): ReminderOccurrence[] {
  return input.reminders
    .map((reminder) => getReminderOccurrence({ ...input, reminder }))
    .filter((item): item is ReminderOccurrence => item !== null)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
}

export function getDueOccurrences(input: {
  reminders: Reminder[];
  babyActivities: BabyActivity[];
  momActivities: MomActivity[];
  occurrenceStates: Record<string, ReminderOccurrenceState>;
  now: Date;
}): ReminderOccurrence[] {
  const nowMs = input.now.getTime();
  return getReminderOccurrences(input).filter((occurrence) =>
    new Date(occurrence.dueAt).getTime() <= nowMs && !occurrence.state?.completedAt
  );
}

export type ReminderType = 'feeding' | 'pumping' | 'medicine' | 'vaccination' | 'appointment' | 'custom';
export type ReminderMode = 'fixed' | 'relative';
export type ReminderRepeat = 'none' | 'daily';

export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  enabled: boolean;
  mode: ReminderMode;
  triggerAt?: string;
  intervalMinutes?: number;
  repeat?: ReminderRepeat;
  quickLogAction?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderOccurrenceState {
  occurrenceId: string;
  reminderId: string;
  dueAt: string;
  surfacedAt?: string;
  completedAt?: string;
  snoozedUntil?: string;
}

export interface ReminderOccurrence {
  occurrenceId: string;
  reminderId: string;
  dueAt: string;
  originalDueAt: string;
  reminder: Reminder;
  state?: ReminderOccurrenceState;
}

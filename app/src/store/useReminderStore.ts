import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { indexedDbStorage } from '@/services/localDb';
import type { Reminder, ReminderOccurrence, ReminderOccurrenceState } from '@/types/reminder';

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `reminder-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export interface ReminderStoreState {
  reminders: Reminder[];
  occurrenceStates: Record<string, ReminderOccurrenceState>;
  systemNotificationsEnabled: boolean;
  createReminder: (input: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'> & { enabled?: boolean }) => Reminder;
  updateReminder: (id: string, patch: Partial<Omit<Reminder, 'id' | 'createdAt'>>) => void;
  deleteReminder: (id: string) => void;
  completeOccurrence: (occurrence: ReminderOccurrence) => void;
  snoozeOccurrence: (occurrence: ReminderOccurrence, minutes: number) => void;
  markSurfaced: (occurrence: ReminderOccurrence) => void;
  setSystemNotificationsEnabled: (enabled: boolean) => void;
  resetTrackingData: () => void;
}

export const useReminderStore = create<ReminderStoreState>()(
  persist(
    (set) => ({
      reminders: [], occurrenceStates: {}, systemNotificationsEnabled: false,
      createReminder: (input) => {
        const now = new Date().toISOString();
        const reminder: Reminder = { ...input, id: createId(), enabled: input.enabled === true, repeat: input.repeat ?? 'none', createdAt: now, updatedAt: now };
        set((state) => ({ reminders: [...state.reminders, reminder] }));
        return reminder;
      },
      updateReminder: (id, patch) => set((state) => ({ reminders: state.reminders.map((reminder) => reminder.id === id ? { ...reminder, ...patch, id: reminder.id, createdAt: reminder.createdAt, updatedAt: new Date().toISOString() } : reminder) })),
      deleteReminder: (id) => set((state) => ({ reminders: state.reminders.filter((reminder) => reminder.id !== id), occurrenceStates: Object.fromEntries(Object.entries(state.occurrenceStates).filter(([, occurrence]) => occurrence.reminderId !== id)) })),
      completeOccurrence: (occurrence) => {
        const completedAt = new Date().toISOString();
        set((state) => ({ occurrenceStates: { ...state.occurrenceStates, [occurrence.occurrenceId]: { occurrenceId: occurrence.occurrenceId, reminderId: occurrence.reminderId, dueAt: occurrence.originalDueAt, surfacedAt: occurrence.state?.surfacedAt, snoozedUntil: occurrence.state?.snoozedUntil, completedAt } } }));
      },
      snoozeOccurrence: (occurrence, minutes) => {
        const safeMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : 10;
        const snoozedUntil = new Date(Date.now() + safeMinutes * 60_000).toISOString();
        set((state) => ({ occurrenceStates: { ...state.occurrenceStates, [occurrence.occurrenceId]: { occurrenceId: occurrence.occurrenceId, reminderId: occurrence.reminderId, dueAt: occurrence.originalDueAt, snoozedUntil } } }));
      },
      markSurfaced: (occurrence) => {
        if (occurrence.state?.surfacedAt) return;
        set((state) => ({ occurrenceStates: { ...state.occurrenceStates, [occurrence.occurrenceId]: { occurrenceId: occurrence.occurrenceId, reminderId: occurrence.reminderId, dueAt: occurrence.originalDueAt, snoozedUntil: occurrence.state?.snoozedUntil, completedAt: occurrence.state?.completedAt, surfacedAt: new Date().toISOString() } } }));
      },
      setSystemNotificationsEnabled: (enabled) => set({ systemNotificationsEnabled: enabled }),
      resetTrackingData: () => set({ reminders: [], occurrenceStates: {}, systemNotificationsEnabled: false }),
    }),
    { name: 'babygrowth_v3_reminders', storage: createJSONStorage(() => indexedDbStorage), partialize: (state) => ({ reminders: state.reminders, occurrenceStates: state.occurrenceStates, systemNotificationsEnabled: state.systemNotificationsEnabled }) },
  ),
);

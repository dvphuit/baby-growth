import { useActivityStore } from '@/features/activities';
import { useExpenseStore } from '@/features/expenses';
import { exportGrowthFacts, hydrateGrowthFacts, useGrowthStore } from '@/features/growth';
import { useProfileStore } from '@/features/profile';
import { useReminderStore } from '@/features/reminders';
import { useTimelineStore } from '@/features/timeline';
import { useUIStore } from '@/store/useUIStore';
import {
  APP_SNAPSHOT_GENERATION,
  parseAppSnapshot,
  type AppSnapshot,
} from './appSnapshotSchema';

export { APP_SNAPSHOT_GENERATION, isAppSnapshot, parseAppSnapshot } from './appSnapshotSchema';
export type { AppSnapshot } from './appSnapshotSchema';

export function exportAppSnapshot(now = new Date()): AppSnapshot {
  const profile = useProfileStore.getState();
  const growth = useGrowthStore.getState();
  const activities = useActivityStore.getState();
  const expenses = useExpenseStore.getState();
  const timeline = useTimelineStore.getState();
  const reminders = useReminderStore.getState();
  const ui = useUIStore.getState();

  return {
    generation: APP_SNAPSHOT_GENERATION,
    exportedAt: now.toISOString(),
    profile: {
      familyData: structuredClone(profile.familyData),
      profileMode: ui.profileMode,
    },
    activities: {
      baby: structuredClone(activities.babyActivities),
      mom: structuredClone(activities.momActivities),
      medicationCatalog: structuredClone(activities.medicationCatalog),
    },
    growth: exportGrowthFacts(growth),
    timeline: {
      items: structuredClone(timeline.timelineItems),
    },
    expenses: {
      records: structuredClone(expenses.expenses),
      monthlyBudget: expenses.monthlyBudget,
    },
    reminders: {
      items: structuredClone(reminders.reminders),
      occurrenceStates: structuredClone(reminders.occurrenceStates),
      systemNotificationsEnabled: reminders.systemNotificationsEnabled,
    },
  };
}

export function applyAppSnapshot(snapshot: AppSnapshot): void {
  const parsed = parseAppSnapshot(snapshot);

  useProfileStore.setState({ familyData: structuredClone(parsed.profile.familyData) });
  useGrowthStore.setState(hydrateGrowthFacts(parsed.growth));
  useUIStore.setState({ profileMode: parsed.profile.profileMode });
  useActivityStore.setState({
    babyActivities: structuredClone(parsed.activities.baby),
    momActivities: structuredClone(parsed.activities.mom),
    medicationCatalog: structuredClone(parsed.activities.medicationCatalog),
  });
  useExpenseStore.setState({
    expenses: structuredClone(parsed.expenses.records),
    monthlyBudget: parsed.expenses.monthlyBudget,
  });
  useTimelineStore.setState({ timelineItems: structuredClone(parsed.timeline.items) });
  useReminderStore.setState({
    reminders: structuredClone(parsed.reminders.items),
    occurrenceStates: structuredClone(parsed.reminders.occurrenceStates),
    systemNotificationsEnabled: parsed.reminders.systemNotificationsEnabled,
  });
}

export function subscribeAppSnapshotChanges(listener: () => void): () => void {
  const unsubscribe = [
    useProfileStore.subscribe(listener),
    useGrowthStore.subscribe(listener),
    useUIStore.subscribe(listener),
    useActivityStore.subscribe(listener),
    useExpenseStore.subscribe(listener),
    useTimelineStore.subscribe(listener),
    useReminderStore.subscribe(listener),
  ];
  return () => unsubscribe.forEach((stop) => stop());
}

import { useActivityStore } from '@/features/activities';
import { useExpenseStore } from '@/features/expenses';
import { exportGrowthFacts, hydrateGrowthFacts, useGrowthStore } from '@/features/growth';
import { useProfileStore } from '@/features/profile';
import { useReminderStore } from '@/features/reminders';
import {
  APP_SNAPSHOT_GENERATION,
  type AppSnapshot,
  type AppSnapshotRuntime,
} from '@/features/sync';
import { useTimelineStore } from '@/features/timeline';
import { useUIStore } from '@/store/useUIStore';

export function createAppSnapshotRuntime(): AppSnapshotRuntime {
  return {
    exportSnapshot: (now) => {
      const profile = useProfileStore.getState();
      const growth = useGrowthStore.getState();
      const activities = useActivityStore.getState();
      const expenses = useExpenseStore.getState();
      const timeline = useTimelineStore.getState();
      const reminders = useReminderStore.getState();
      const ui = useUIStore.getState();

      const snapshot: AppSnapshot = {
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

      return snapshot;
    },
    applySnapshot: (snapshot) => {
      useProfileStore.setState({ familyData: structuredClone(snapshot.profile.familyData) });
      useGrowthStore.setState(hydrateGrowthFacts(snapshot.growth));
      useUIStore.setState({ profileMode: snapshot.profile.profileMode });
      useActivityStore.setState({
        babyActivities: structuredClone(snapshot.activities.baby),
        momActivities: structuredClone(snapshot.activities.mom),
        medicationCatalog: structuredClone(snapshot.activities.medicationCatalog),
      });
      useExpenseStore.setState({
        expenses: structuredClone(snapshot.expenses.records),
        monthlyBudget: snapshot.expenses.monthlyBudget,
      });
      useTimelineStore.setState({ timelineItems: structuredClone(snapshot.timeline.items) });
      useReminderStore.setState({
        reminders: structuredClone(snapshot.reminders.items),
        occurrenceStates: structuredClone(snapshot.reminders.occurrenceStates),
        systemNotificationsEnabled: snapshot.reminders.systemNotificationsEnabled,
      });
    },
    subscribeChanges: (listener) => {
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
    },
  };
}

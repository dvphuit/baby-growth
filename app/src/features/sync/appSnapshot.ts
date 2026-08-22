import type { MedicationCatalogItem } from '@/features/activities/domain/medicationCatalog';
import { useActivityStore } from '@/features/activities/store/useActivityStore';
import { useGrowthStore } from '@/features/growth/store/useGrowthStore';
import { exportGrowthFacts, hydrateGrowthFacts, isGrowthFacts, type GrowthFacts } from '@/features/growth/store/growthPersistence';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { useExpenseStore } from '@/features/expenses/store/useExpenseStore';
import { useReminderStore } from '@/features/reminders/store/useReminderStore';
import { useTimelineStore } from '@/features/timeline/store/useTimelineStore';
import { useUIStore } from '@/store/useUIStore';
import type { BabyActivity, MomActivity } from '@/features/activities';
import type { FamilyData, ProfileMode } from '@/features/profile';
import type { TimelineItem } from '@/features/timeline';
import type { ExpenseRecord } from '@/types/expense';
import type { Reminder, ReminderOccurrenceState } from '@/types/reminder';

export const APP_SNAPSHOT_GENERATION = 2 as const;

export interface AppSnapshot {
  generation: typeof APP_SNAPSHOT_GENERATION;
  exportedAt: string;
  profile: {
    familyData: FamilyData;
    profileMode: ProfileMode;
  };
  activities: {
    baby: BabyActivity[];
    mom: MomActivity[];
    medicationCatalog: MedicationCatalogItem[];
  };
  growth: GrowthFacts;
  timeline: {
    items: TimelineItem[];
  };
  expenses: {
    records: ExpenseRecord[];
    monthlyBudget: number;
  };
  reminders: {
    items: Reminder[];
    occurrenceStates: Record<string, ReminderOccurrenceState>;
    systemNotificationsEnabled: boolean;
  };
}

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isAppSnapshot(value: unknown): value is AppSnapshot {
  if (!isRecord(value) || value.generation !== APP_SNAPSHOT_GENERATION) return false;
  if (typeof value.exportedAt !== 'string') return false;

  const profile = value.profile;
  const activities = value.activities;
  const growth = value.growth;
  const timeline = value.timeline;
  const expenses = value.expenses;
  const reminders = value.reminders;

  return isRecord(profile)
    && isRecord(profile.familyData)
    && (profile.profileMode === 'baby' || profile.profileMode === 'mom')
    && isRecord(activities)
    && Array.isArray(activities.baby)
    && Array.isArray(activities.mom)
    && Array.isArray(activities.medicationCatalog)
    && isGrowthFacts(growth)
    && isRecord(timeline)
    && Array.isArray(timeline.items)
    && isRecord(expenses)
    && Array.isArray(expenses.records)
    && typeof expenses.monthlyBudget === 'number'
    && isRecord(reminders)
    && Array.isArray(reminders.items)
    && isRecord(reminders.occurrenceStates)
    && typeof reminders.systemNotificationsEnabled === 'boolean';
}

export function parseAppSnapshot(value: unknown): AppSnapshot {
  if (!isAppSnapshot(value)) {
    throw new Error('Tệp dữ liệu không thuộc persistence generation hiện tại của BabyGrowth.');
  }
  return value;
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

import type { BabyActivity, MedicationCatalogItem, MomActivity } from '@/features/activities';
import type { ExpenseRecord } from '@/features/expenses';
import { isGrowthFacts, type GrowthFacts } from '@/features/growth';
import type { FamilyData, ProfileMode } from '@/features/profile';
import type { Reminder, ReminderOccurrenceState } from '@/features/reminders';
import type { TimelineItem } from '@/features/timeline';

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

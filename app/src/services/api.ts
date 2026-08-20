/**
 * API service layer for BabyGrowth.
 *
 * Currently returns seed data directly. When a real backend is available,
 * replace the implementations with fetch() calls. The interface stays the same
 * so consumers don't need to change.
 */
import type {
  StageData,
  MomData,
  TimelineItem,
  DailyHabit,
  CalendarRangeEvent,
  FamilyData,
} from '@/types';
import {
  FAMILY_DATA,
  INITIAL_STAGES,
  INITIAL_MOM_DATA,
  INITIAL_TIMELINE_ITEMS,
  INITIAL_DAILY_HABITS,
  CALENDAR_RANGE_EVENTS,
} from '@/data/seedData';

// ── Family ──────────────────────────────────────────────────────

export async function fetchFamilyProfile(): Promise<FamilyData> {
  return FAMILY_DATA;
}

// ── Stages / Growth ─────────────────────────────────────────────

export async function fetchStages(): Promise<Record<string, StageData>> {
  return INITIAL_STAGES;
}

// ── Mom ─────────────────────────────────────────────────────────

export async function fetchMomData(): Promise<MomData> {
  return INITIAL_MOM_DATA;
}

// ── Timeline ────────────────────────────────────────────────────

export async function fetchTimelineItems(): Promise<TimelineItem[]> {
  return INITIAL_TIMELINE_ITEMS;
}

// ── Habits ──────────────────────────────────────────────────────

export async function fetchDailyHabits(): Promise<DailyHabit[]> {
  return INITIAL_DAILY_HABITS;
}

// ── Calendar Events ─────────────────────────────────────────────

export async function fetchCalendarRangeEvents(): Promise<CalendarRangeEvent[]> {
  return CALENDAR_RANGE_EVENTS;
}

/**
 * Synchronous access to family data for initial renders.
 * Prefer fetchFamilyProfile() in async contexts.
 */
export function getFamilyData(): FamilyData {
  return FAMILY_DATA;
}

export function getCalendarRangeEvents(): CalendarRangeEvent[] {
  return CALENDAR_RANGE_EVENTS;
}

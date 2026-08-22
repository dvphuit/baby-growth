
import type { BabyActivity, MomActivity } from '@/features/activities/domain/types';

function localDayBounds(now: Date): { start: number; end: number } {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  return { start, end };
}

function isInLocalDay(iso: string, now: Date): boolean {
  const value = new Date(iso).getTime();
  if (!Number.isFinite(value)) return false;
  const { start, end } = localDayBounds(now);
  return value >= start && value < end;
}

export function selectBabyTodayMetrics(records: BabyActivity[], now: Date) {
  const today = records.filter((record) => isInLocalDay(record.occurredAt, now));
  const feedings = today.filter((record): record is Extract<BabyActivity, { type: 'feeding' }> => record.type === 'feeding');
  const sleeps = today.filter((record): record is Extract<BabyActivity, { type: 'sleep' }> => record.type === 'sleep');
  const diapers = today.filter((record) => record.type === 'diaper');

  const lastFeeding = feedings.reduce<Extract<BabyActivity, { type: 'feeding' }> | null>((latest, record) => {
    if (!latest) return record;
    return new Date(record.occurredAt).getTime() > new Date(latest.occurredAt).getTime() ? record : latest;
  }, null);

  return {
    feedingAmountMl: feedings.reduce((sum, record) => sum + (record.amountMl ?? 0), 0),
    feedingCount: feedings.length,
    diaperCount: diapers.length,
    sleepMinutes: sleeps.reduce((sum, record) => sum + record.durationMinutes, 0),
    lastFeedingAt: lastFeeding?.occurredAt ?? null,
  };
}

export function selectMomTodayMetrics(records: MomActivity[], now: Date) {
  const today = records.filter((record) => isInLocalDay(record.occurredAt, now));
  const pumping = today.filter((record): record is Extract<MomActivity, { type: 'pumping' }> => record.type === 'pumping');
  const sleeps = today.filter((record): record is Extract<MomActivity, { type: 'sleep' }> => record.type === 'sleep');
  const moods = today.filter((record): record is Extract<MomActivity, { type: 'mood' }> => record.type === 'mood');

  const latestPumping = pumping.reduce<Extract<MomActivity, { type: 'pumping' }> | null>((latest, record) => {
    if (!latest) return record;
    return new Date(record.occurredAt).getTime() > new Date(latest.occurredAt).getTime() ? record : latest;
  }, null);

  const latestMood = moods.reduce<Extract<MomActivity, { type: 'mood' }> | null>((latest, record) => {
    if (!latest) return record;
    return new Date(record.occurredAt).getTime() > new Date(latest.occurredAt).getTime() ? record : latest;
  }, null);

  return {
    pumpingAmountMl: pumping.reduce((sum, record) => sum + record.amountMl, 0),
    pumpingCount: pumping.length,
    sleepMinutes: sleeps.reduce((sum, record) => sum + record.durationMinutes, 0),
    latestMood,
    lastPumpingAt: latestPumping?.occurredAt ?? null,
  };
}

export function getBabyActivitiesForDay(records: BabyActivity[], now: Date, limit?: number): BabyActivity[] {
  const today = records
    .filter((record) => isInLocalDay(record.occurredAt, now))
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  return limit == null ? today : today.slice(0, limit);
}

export function getMomActivitiesForDay(records: MomActivity[], now: Date, limit?: number): MomActivity[] {
  const today = records
    .filter((record) => isInLocalDay(record.occurredAt, now))
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  return limit == null ? today : today.slice(0, limit);
}

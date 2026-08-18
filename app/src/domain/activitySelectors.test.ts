import { describe, expect, it } from 'vitest';
import type { BabyActivity, MomActivity } from '@/types';
import {
  getBabyActivitiesForDay,
  getMomActivitiesForDay,
  selectBabyTodayMetrics,
  selectMomTodayMetrics,
} from './activitySelectors';

const now = new Date(2026, 7, 16, 15, 0, 0);

function baby(record: Partial<BabyActivity> & Pick<BabyActivity, 'type'>): BabyActivity {
  return {
    id: crypto.randomUUID(),
    owner: 'baby',
    occurredAt: new Date(2026, 7, 16, 8, 0, 0).toISOString(),
    createdAt: new Date().toISOString(),
    ...record,
  } as BabyActivity;
}

function mom(record: Partial<MomActivity> & Pick<MomActivity, 'type'>): MomActivity {
  return {
    id: crypto.randomUUID(),
    owner: 'mom',
    occurredAt: new Date(2026, 7, 16, 8, 0, 0).toISOString(),
    createdAt: new Date().toISOString(),
    ...record,
  } as MomActivity;
}

describe('activitySelectors', () => {
  it('calculates baby metrics from the current local day only', () => {
    const records: BabyActivity[] = [
      baby({ type: 'feeding', amountMl: 90, method: 'bottle' }),
      baby({ type: 'feeding', amountMl: 60, method: 'bottle', occurredAt: new Date(2026, 7, 16, 11, 0, 0).toISOString() }),
      baby({ type: 'diaper', diaperKind: 'wet' }),
      baby({ type: 'sleep', durationMinutes: 75 }),
      baby({ type: 'feeding', amountMl: 999, method: 'bottle', occurredAt: new Date(2026, 7, 15, 23, 0, 0).toISOString() }),
    ];

    expect(selectBabyTodayMetrics(records, now)).toEqual({
      feedingAmountMl: 150,
      feedingCount: 2,
      diaperCount: 1,
      sleepMinutes: 75,
      lastFeedingAt: records[1].occurredAt,
    });
  });

  it('calculates mom pumping, sleep and latest mood from real records', () => {
    const records: MomActivity[] = [
      mom({ type: 'pumping', amountMl: 120, side: 'both' }),
      mom({ type: 'pumping', amountMl: 80, side: 'left', occurredAt: new Date(2026, 7, 16, 12, 0, 0).toISOString() }),
      mom({ type: 'sleep', durationMinutes: 180 }),
      mom({ type: 'mood', mood: 'good', occurredAt: new Date(2026, 7, 16, 13, 0, 0).toISOString() }),
    ];

    const result = selectMomTodayMetrics(records, now);
    expect(result.pumpingAmountMl).toBe(200);
    expect(result.pumpingCount).toBe(2);
    expect(result.sleepMinutes).toBe(180);
    expect(result.lastPumpingAt).toBe(records[1].occurredAt);
    expect(result.latestMood?.type).toBe('mood');
  });

  it('returns only today activities for the home diary, newest first', () => {
    const yesterdayBaby = baby({ type: 'health_note', occurredAt: new Date(2026, 7, 15, 23, 0, 0).toISOString(), note: 'Hôm qua' });
    const morningBaby = baby({ type: 'feeding', amountMl: 90, method: 'bottle' });
    const noonBaby = baby({ type: 'diaper', diaperKind: 'wet', occurredAt: new Date(2026, 7, 16, 12, 0, 0).toISOString() });
    const yesterdayMom = mom({ type: 'recovery_note', occurredAt: new Date(2026, 7, 15, 22, 0, 0).toISOString(), note: 'Hôm qua' });
    const todayMom = mom({ type: 'mood', mood: 'good' });

    expect(getBabyActivitiesForDay([yesterdayBaby, morningBaby, noonBaby], now).map((item) => item.id))
      .toEqual([noonBaby.id, morningBaby.id]);
    expect(getMomActivitiesForDay([yesterdayMom, todayMom], now).map((item) => item.id))
      .toEqual([todayMom.id]);
  });
});

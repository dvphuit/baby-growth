import { describe, expect, it } from 'vitest';
import type { BabyActivity, GrowthHistoryRecord, MomActivity } from '@/types';
import { buildTimelineEntries, filterTimelineByLocalDateRange, type DerivedTimelineEntry } from './timelineSelectors';

function entry(id: string, year: number, month: number, day: number): DerivedTimelineEntry {
  return {
    id,
    occurredAt: new Date(year, month - 1, day, 12, 0, 0).toISOString(),
    owner: 'baby',
    type: 'note',
    title: id,
    detail: '',
    stats: [],
  };
}

describe('filterTimelineByLocalDateRange', () => {
  it('includes both boundary dates and excludes adjacent days', () => {
    const entries = [entry('before', 2026, 8, 9), entry('start', 2026, 8, 10), entry('end', 2026, 8, 13), entry('after', 2026, 8, 14)];
    expect(filterTimelineByLocalDateRange(entries, '2026-08-10', '2026-08-13').map((item) => item.id)).toEqual(['start', 'end']);
  });
});

describe('buildTimelineEntries', () => {
  it('does not generate placeholder notes for records without a user note', () => {
    const occurredAt = new Date(2026, 7, 18, 8, 0, 0).toISOString();
    const babyActivity: BabyActivity = {
      id: 'baby-feed', owner: 'baby', type: 'feeding', amountMl: 90, method: 'bottle',
      occurredAt, createdAt: occurredAt,
    };
    const momActivity: MomActivity = {
      id: 'mom-pump', owner: 'mom', type: 'pumping', amountMl: 80, side: 'both',
      occurredAt, createdAt: occurredAt,
    };
    const growth: GrowthHistoryRecord = {
      id: 'growth', date: '2026-08-18', ageText: '8 tháng', weight: 9, height: 72,
      headCirc: 44.5, percentileLabel: '', status: 'optimal', note: '',
    };

    const entries = buildTimelineEntries({ babyActivities: [babyActivity], momActivities: [momActivity], growthHistory: [growth] });

    expect(entries.map((item) => item.detail)).toEqual(['', '', '']);
  });
});

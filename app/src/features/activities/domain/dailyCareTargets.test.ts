import { describe, expect, it } from 'vitest';
import { getAgeInMonths, getFeedingRecommendation, getMilkTarget, getSleepTarget, getTemperatureStatus } from './dailyCareTargets';

const now = new Date(2026, 7, 17, 10, 0, 0);

describe('dailyCareTargets', () => {
  it('calculates completed local calendar months', () => {
    expect(getAgeInMonths('2026-01-17', now)).toBe(7);
    expect(getAgeInMonths('2026-01-18', now)).toBe(6);
  });

  it('uses age-based CDC sleep ranges', () => {
    expect(getSleepTarget('2026-01-17', now).label).toBe('12–16 giờ / 24 giờ');
    expect(getSleepTarget('2024-08-17', now).label).toBe('11–14 giờ / 24 giờ');
    expect(getSleepTarget('2026-07-17', now).label).toBe('14–17 giờ / 24 giờ');
  });

  it('uses weight for early formula reference and caps the daily estimate', () => {
    expect(getMilkTarget('2026-05-17', 5, now).targetMl).toBe(830);
    expect(getMilkTarget('2026-05-17', 8, now).targetMl).toBe(960);
  });

  it('uses the complementary-feeding guide under 12 months and no fixed ml target after that', () => {
    expect(getMilkTarget('2026-01-17', 8, now).targetMl).toBe(600);
    expect(getMilkTarget('2025-10-17', 9, now).targetMl).toBe(400);
    expect(getMilkTarget('2025-01-17', 10, now).targetMl).toBeNull();
  });

  it('calculates single feeding recommendation based on age and weight', () => {
    // 2-month-old baby with 5.5kg
    const rec2m = getFeedingRecommendation('2026-06-17', 5.5, now);
    expect(rec2m.minMl).toBeGreaterThanOrEqual(90);
    expect(rec2m.maxMl).toBeLessThanOrEqual(160);
    expect(rec2m.ageText).toContain('2–4 tháng tuổi');

    // Newborn 2-day-old
    const recNewborn = getFeedingRecommendation('2026-08-15', 3.2, now);
    expect(recNewborn.minMl).toBe(30);
    expect(recNewborn.maxMl).toBe(60);
  });

  it('evaluates pediatric body temperature tiers and clinical advice', () => {
    expect(getTemperatureStatus(35.5).tier).toBe('hypothermia');
    expect(getTemperatureStatus(36.8).tier).toBe('normal');
    expect(getTemperatureStatus(37.8).tier).toBe('elevated');
    expect(getTemperatureStatus(38.8).tier).toBe('fever');
    expect(getTemperatureStatus(39.8).tier).toBe('high_fever');
    expect(getTemperatureStatus(40).tier).toBe('very_high_fever');
  });
});

import { beforeEach, describe, expect, it } from 'vitest';
import { useBabyStore } from './useBabyStore';
import { useMomStore } from './useMomStore';

describe('tracking profile reset', () => {
  beforeEach(() => {
    useBabyStore.getState().resetToDefaults();
  });

  it('keeps the onboarding profile and exactly one birth measurement', () => {
    useBabyStore.getState().initializeChildProfile({
      childName: 'Bơ', childFullName: 'Nguyễn An', birthDate: '2026-01-05', birthTime: '07:30',
      gender: 'girl', bloodType: 'A+', childAvatar: '/baby.jpg', momName: 'Mai', momAvatar: '/mom.jpg',
      birthWeight: '3.2 kg', birthHeight: '49 cm', headCircAtBirth: '34 cm', hospital: 'Từ Dũ',
    }, { weight: 3.2, height: 49, headCirc: 34 });
    useBabyStore.getState().addGrowthMeasurement({ weight: 5.1, height: 58, headCirc: 38, date: '2026-03-05' });
    useBabyStore.getState().addExpenseRecord({ amount: 120000, category: 'Sữa', occurredAt: '2026-03-06', note: '' });
    useBabyStore.getState().setMonthlyExpenseBudget(9_000_000);

    useBabyStore.getState().resetTrackingData();

    const state = useBabyStore.getState();
    expect(state.familyData).toMatchObject({ childName: 'Bơ', childFullName: 'Nguyễn An', momName: 'Mai', isInitialized: true });
    expect(state.currentStageData().growthHistory).toHaveLength(1);
    expect(state.currentStageData().growthHistory[0]).toMatchObject({ date: '2026-01-05', weight: 3.2, height: 49, headCirc: 34 });
    expect(state.expenseRecords).toEqual([]);
    expect(state.monthlyExpenseBudget).toBe(5_000_000);
    expect(state.currentStageData().todayVitals).toMatchObject({ temperature: '', sleepTotal: '', milkTotal: '', diaperCount: 0, weight: '3.2 kg' });
    expect(state.currentStageData().motorMilestones.items.every((item) => item.status === 'upcoming')).toBe(true);
  });

  it('keeps Mom identity while clearing Mom tracking metrics', () => {
    useMomStore.setState({ momData: {
      ...useMomStore.getState().momData,
      name: 'Mai',
      wellnessScore: 92,
      pumping: { ...useMomStore.getState().momData.pumping, todayTotal: '180 ml', sessionsToday: 2, history: [{ time: '09:00', amount: '90 ml', note: '' }] },
    }});

    useMomStore.getState().resetTrackingData();

    const mom = useMomStore.getState().momData;
    expect(mom.name).toBe('Mai');
    expect(mom.pumping.history).toEqual([]);
    expect(mom.pumping.sessionsToday).toBe(0);
    expect(mom.pumping.todayTotal).toBe('0 ml');
  });
});

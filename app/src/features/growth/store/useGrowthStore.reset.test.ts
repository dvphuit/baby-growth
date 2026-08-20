import { beforeEach, describe, expect, it } from 'vitest';
import { useGrowthStore } from '@/features/growth/store/useGrowthStore';
import { initializeChildProfile, resetChildStoresToDefaults, useProfileStore } from '@/features/profile';
import { useExpenseStore } from '@/features/expenses/store/useExpenseStore';

describe('tracking profile reset', () => {
  beforeEach(() => {
    resetChildStoresToDefaults();
    useExpenseStore.getState().resetTrackingData();
  });

  it('keeps the onboarding profile and exactly one birth measurement', () => {
    initializeChildProfile({
      childName: 'Bơ', childFullName: 'Nguyễn An', birthDate: '2026-01-05', birthTime: '07:30',
      gender: 'girl', bloodType: 'A+', childAvatar: '/baby.jpg', momName: 'Mai', momAvatar: '/mom.jpg',
      birthWeight: '3.2 kg', birthHeight: '49 cm', headCircAtBirth: '34 cm', hospital: 'Từ Dũ',
    }, { weight: 3.2, height: 49, headCirc: 34 });
    useGrowthStore.getState().addGrowthMeasurement({ weight: 5.1, height: 58, headCirc: 38, date: '2026-03-05' });
    useExpenseStore.getState().addExpense({ amount: 120000, category: 'Sữa', occurredAt: '2026-03-06', note: '' });
    useExpenseStore.getState().setMonthlyBudget(9_000_000);

    useGrowthStore.getState().resetTrackingData(useProfileStore.getState().familyData);
    useExpenseStore.getState().resetTrackingData();

    const state = useGrowthStore.getState();
    expect(useProfileStore.getState().familyData).toMatchObject({ childName: 'Bơ', childFullName: 'Nguyễn An', momName: 'Mai', isInitialized: true });
    expect(state.currentStageData().growthHistory).toHaveLength(1);
    expect(state.currentStageData().growthHistory[0]).toMatchObject({ date: '2026-01-05', weight: 3.2, height: 49, headCirc: 34 });
    expect(useExpenseStore.getState()).toMatchObject({ expenses: [], monthlyBudget: 5_000_000 });
    expect(state.currentStageData().todayVitals).toMatchObject({ temperature: '', sleepTotal: '', milkTotal: '', diaperCount: 0, weight: '3.2 kg' });
    expect(state.currentStageData().motorMilestones.items.every((item) => item.status === 'upcoming')).toBe(true);
  });

  it('preserves the semantic birth record when it differs from edited profile strings', () => {
    initializeChildProfile({
      childName: 'Bơ', birthDate: '2026-01-05', birthWeight: '3.2 kg', birthHeight: '49 cm',
      headCircAtBirth: '34 cm',
    }, { weight: 3.2, height: 49, headCirc: 34 });
    useGrowthStore.getState().addGrowthMeasurement({
      weight: 5.1, height: 58, headCirc: 38, date: '2026-03-05',
    });
    const beforeReset = useGrowthStore.getState();
    const stage = beforeReset.stages[beforeReset.currentStage];
    const existingBirth = stage.growthHistory.find((record) => record.id.startsWith('gh_birth'));
    expect(existingBirth).toBeDefined();
    if (!existingBirth) return;

    useGrowthStore.setState({
      stages: {
        ...beforeReset.stages,
        [beforeReset.currentStage]: {
          ...stage,
          growthHistory: [
            stage.growthHistory[0],
            { ...existingBirth, id: 'gh_birth_legacy', weight: 3.45, height: 50, headCirc: 35 },
          ],
        },
      },
    });

    useGrowthStore.getState().resetTrackingData(useProfileStore.getState().familyData);

    const resetStage = useGrowthStore.getState().currentStageData();
    expect(resetStage.growthHistory).toHaveLength(1);
    expect(resetStage.growthHistory[0]).toMatchObject({
      id: 'gh_birth_legacy', weight: 3.45, height: 50, headCirc: 35,
    });
    expect(resetStage.todayVitals).toMatchObject({ weight: '3.45 kg', height: '50 cm', headCirc: '35 cm' });
    expect(resetStage.growthChart.weight.child[0]).toBe(3.45);
    expect(resetStage.growthChart.height.child[0]).toBe(50);
    expect(resetStage.growthChart.headCirc.child[0]).toBe(35);
  });

  it('does not fabricate a zero-valued birth record when no birth measurements exist', () => {
    initializeChildProfile({
      childName: 'Bơ', birthDate: '2026-01-05', birthWeight: '', birthHeight: '', headCircAtBirth: '',
    });
    useGrowthStore.getState().addGrowthMeasurement({
      weight: 5.1, height: 58, headCirc: 38, date: '2026-03-05',
    });

    useGrowthStore.getState().resetTrackingData(useProfileStore.getState().familyData);

    const resetStage = useGrowthStore.getState().currentStageData();
    expect(resetStage.growthHistory).toEqual([]);
    expect(resetStage.todayVitals).toMatchObject({ weight: '', height: '', headCirc: '' });
    expect(resetStage.growthChart.weight.child.every((value) => value === null)).toBe(true);
    expect(resetStage.growthChart.height.child.every((value) => value === null)).toBe(true);
    expect(resetStage.growthChart.headCirc.child.every((value) => value === null)).toBe(true);
  });
});

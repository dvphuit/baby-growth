import { describe, expect, it } from 'vitest';
import { INITIAL_DAILY_HABITS, INITIAL_STAGES } from '@/data/seedData';
import { exportGrowthFacts, hydrateGrowthFacts, isGrowthFacts } from './growthPersistence';

const measurement = {
  id: 'gh-test',
  date: '2026-08-20',
  weight: 4.2,
  height: 53,
  headCirc: 36,
  note: 'Theo dõi tại nhà',
  labelIndex: 0,
};

describe('growth persistence facts', () => {
  it('serializes facts without derived stage presentation and rebuilds the projection', () => {
    const habitId = INITIAL_DAILY_HABITS[0]?.id;
    const milestoneId = INITIAL_STAGES.stage_0_1.motorMilestones.items[0]?.id;
    expect(milestoneId).toBeTruthy();

    const facts = {
      currentStage: 'stage_0_1' as const,
      stages: {
        stage_0_1: {
          measurements: [measurement],
          milestones: milestoneId ? [{ id: milestoneId, status: 'completed' as const, dateAchieved: '20/08/2026' }] : [],
        },
      },
      completedHabitIds: habitId ? [habitId] : [],
    };

    expect(isGrowthFacts(facts)).toBe(true);
    const projection = hydrateGrowthFacts(facts);
    expect(projection.stages.stage_0_1.growthHistory[0]).toMatchObject(measurement);
    expect(projection.stages.stage_0_1.todayVitals.weight).toBe('4.2 kg');
    expect(projection.stages.stage_0_1.growthChart.weight.child[0]).toBe(4.2);
    if (milestoneId) {
      expect(projection.stages.stage_0_1.motorMilestones.items.find((item) => item.id === milestoneId)?.status).toBe('completed');
    }
    if (habitId) expect(projection.dailyHabits.find((habit) => habit.id === habitId)?.completed).toBe(true);

    const exported = exportGrowthFacts(projection);
    expect(exported).toEqual(facts);
    const serialized = JSON.stringify(exported);
    expect(serialized).not.toContain('growthChart');
    expect(serialized).not.toContain('todayVitals');
    expect(serialized).not.toContain('motorMilestones');
    expect(serialized).not.toContain('growthScore');
  });
});

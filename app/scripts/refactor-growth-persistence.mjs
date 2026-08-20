import { readFileSync, writeFileSync } from 'node:fs';

function replaceExact(file, from, to) {
  const source = readFileSync(file, 'utf8');
  if (!source.includes(from)) throw new Error(`Expected text not found in ${file}: ${from.slice(0, 120)}`);
  writeFileSync(file, source.replace(from, to));
}

writeFileSync('src/features/growth/store/growthPersistence.ts', `import { INITIAL_DAILY_HABITS, INITIAL_STAGES } from '@/data/seedData';
import type { DailyHabit, StageData, StageKey } from '@/types';

const STAGE_KEYS: StageKey[] = ['stage_0_1', 'stage_1_5', 'stage_6_12', 'stage_13_18'];
const STAGE_KEY_SET = new Set<string>(STAGE_KEYS);

export interface GrowthMeasurementFact {
  id: string;
  date: string;
  weight: number;
  height: number;
  headCirc: number;
  note: string;
  labelIndex?: number;
}

export interface GrowthMilestoneFact {
  id: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  dateAchieved: string | null;
}

export interface GrowthStageFacts {
  measurements: GrowthMeasurementFact[];
  milestones: GrowthMilestoneFact[];
}

export interface GrowthFacts {
  currentStage: StageKey;
  stages: Partial<Record<StageKey, GrowthStageFacts>>;
  completedHabitIds: string[];
}

interface GrowthProjection {
  currentStage: StageKey;
  stages: Record<string, StageData>;
  dailyHabits: DailyHabit[];
}

function timestamp(value: string): number {
  const parsed = new Date(value).getTime();
  if (Number.isFinite(parsed)) return parsed;
  const match = value.match(/^(\\d{1,2})[/-](\\d{1,2})[/-](\\d{4})$/);
  if (!match) return 0;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), 12).getTime();
}

function statusLabel(status: GrowthMilestoneFact['status']): string {
  if (status === 'completed') return 'Đạt chuẩn';
  if (status === 'in-progress') return 'Đang tập';
  return 'Sắp tới';
}

export function exportGrowthFacts(projection: GrowthProjection): GrowthFacts {
  const stages: Partial<Record<StageKey, GrowthStageFacts>> = {};

  for (const key of STAGE_KEYS) {
    const stage = projection.stages[key];
    if (!stage) continue;
    const measurements: GrowthMeasurementFact[] = (stage.growthHistory ?? []).map((record) => ({
      id: record.id,
      date: record.date,
      weight: record.weight,
      height: record.height,
      headCirc: record.headCirc,
      note: record.note,
      ...(typeof record.labelIndex === 'number' ? { labelIndex: record.labelIndex } : {}),
    }));
    const milestones: GrowthMilestoneFact[] = (stage.motorMilestones?.items ?? []).flatMap((item) =>
      item.status === 'upcoming' && !item.dateAchieved
        ? []
        : [{ id: item.id, status: item.status, dateAchieved: item.dateAchieved }],
    );
    if (measurements.length || milestones.length) stages[key] = { measurements, milestones };
  }

  return {
    currentStage: projection.currentStage,
    stages,
    completedHabitIds: projection.dailyHabits.filter((habit) => habit.completed).map((habit) => habit.id),
  };
}

export function hydrateGrowthFacts(facts: GrowthFacts): GrowthProjection {
  const stages = structuredClone(INITIAL_STAGES);

  for (const key of STAGE_KEYS) {
    const stage = stages[key];
    const stageFacts = facts.stages[key];
    if (!stage || !stageFacts) continue;

    const history = stageFacts.measurements
      .map((record) => {
        const birthRecord = record.id.startsWith('gh_birth') || record.labelIndex === 0;
        return {
          ...record,
          ageText: birthRecord ? 'Sơ sinh (Lúc chào đời)' : 'Hiện tại',
          percentileLabel: birthRecord ? 'Chuẩn lúc sinh' : '',
          status: 'optimal' as const,
        };
      })
      .sort((a, b) => timestamp(b.date) - timestamp(a.date));

    stage.growthHistory = history;
    const latest = history[0];
    stage.todayVitals = {
      ...stage.todayVitals,
      weight: latest?.weight && latest.weight > 0 ? String(latest.weight) + ' kg' : '',
      height: latest?.height && latest.height > 0 ? String(latest.height) + ' cm' : '',
      headCirc: latest?.headCirc && latest.headCirc > 0 ? String(latest.headCirc) + ' cm' : '',
    };

    const heightChild = stage.growthChart.labels.map(() => null as number | null);
    const weightChild = stage.growthChart.labels.map(() => null as number | null);
    const headChild = stage.growthChart.labels.map(() => null as number | null);
    [...history].reverse().forEach((record) => {
      const index = typeof record.labelIndex === 'number'
        ? record.labelIndex
        : Math.max(0, stage.growthChart.labels.length - 3);
      if (index < 0 || index >= stage.growthChart.labels.length) return;
      if (record.height > 0) heightChild[index] = record.height;
      if (record.weight > 0) weightChild[index] = record.weight;
      if (record.headCirc > 0) headChild[index] = record.headCirc;
    });
    stage.growthChart = {
      ...stage.growthChart,
      height: { ...stage.growthChart.height, child: heightChild },
      weight: { ...stage.growthChart.weight, child: weightChild },
      headCirc: { ...stage.growthChart.headCirc, child: headChild },
    };

    const milestoneFacts = new Map(stageFacts.milestones.map((item) => [item.id, item]));
    const items = stage.motorMilestones.items.map((item) => {
      const fact = milestoneFacts.get(item.id);
      if (!fact) return item;
      return { ...item, status: fact.status, statusLabel: statusLabel(fact.status), dateAchieved: fact.dateAchieved };
    });
    const completedCount = items.filter((item) => item.status === 'completed').length;
    stage.motorMilestones = {
      ...stage.motorMilestones,
      items,
      score: items.length ? Math.round((completedCount / items.length) * 100) : 0,
    };
  }

  const completedHabitIds = new Set(facts.completedHabitIds);
  return {
    currentStage: STAGE_KEY_SET.has(facts.currentStage) ? facts.currentStage : 'stage_0_1',
    stages,
    dailyHabits: structuredClone(INITIAL_DAILY_HABITS).map((habit) => ({
      ...habit,
      completed: completedHabitIds.has(habit.id),
    })),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isMeasurement(value: unknown): value is GrowthMeasurementFact {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.date === 'string'
    && typeof value.weight === 'number'
    && typeof value.height === 'number'
    && typeof value.headCirc === 'number'
    && typeof value.note === 'string'
    && (value.labelIndex === undefined || typeof value.labelIndex === 'number');
}

function isMilestone(value: unknown): value is GrowthMilestoneFact {
  return isRecord(value)
    && typeof value.id === 'string'
    && (value.status === 'completed' || value.status === 'in-progress' || value.status === 'upcoming')
    && (value.dateAchieved === null || typeof value.dateAchieved === 'string');
}

export function isGrowthFacts(value: unknown): value is GrowthFacts {
  if (!isRecord(value) || typeof value.currentStage !== 'string' || !STAGE_KEY_SET.has(value.currentStage)) return false;
  if (!isRecord(value.stages) || !Array.isArray(value.completedHabitIds) || !value.completedHabitIds.every((id) => typeof id === 'string')) return false;
  return Object.entries(value.stages).every(([key, stage]) =>
    STAGE_KEY_SET.has(key)
      && isRecord(stage)
      && Array.isArray(stage.measurements)
      && stage.measurements.every(isMeasurement)
      && Array.isArray(stage.milestones)
      && stage.milestones.every(isMilestone),
  );
}
`);

writeFileSync('src/features/growth/store/growthPersistence.test.ts', `import { describe, expect, it } from 'vitest';
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
`);

replaceExact(
  'src/features/growth/store/useGrowthStore.ts',
  "import { generateId } from '@/utils/format';",
  "import { generateId } from '@/utils/format';\nimport { exportGrowthFacts, hydrateGrowthFacts, type GrowthFacts } from './growthPersistence';",
);
replaceExact(
  'src/features/growth/store/useGrowthStore.ts',
  '  persist(\n    (set, get) => ({',
  '  persist<GrowthStoreState, [], [], GrowthFacts>(\n    (set, get) => ({',
);
replaceExact(
  'src/features/growth/store/useGrowthStore.ts',
  "      name: 'babygrowth_v4_growth',\n      storage: createJSONStorage(() => indexedDbStorage),",
  "      name: 'babygrowth_v4_growth',\n      storage: createJSONStorage(() => indexedDbStorage),\n      partialize: exportGrowthFacts,\n      merge: (persisted, current) => ({ ...current, ...hydrateGrowthFacts(persisted) }),",
);

replaceExact(
  'src/features/sync/appSnapshot.ts',
  "import { useGrowthStore } from '@/features/growth/store/useGrowthStore';",
  "import { useGrowthStore } from '@/features/growth/store/useGrowthStore';\nimport { exportGrowthFacts, hydrateGrowthFacts, isGrowthFacts, type GrowthFacts } from '@/features/growth/store/growthPersistence';",
);
replaceExact(
  'src/features/sync/appSnapshot.ts',
  "  BabyActivity,\n  DailyHabit,\n  FamilyData,\n  MomActivity,\n  ProfileMode,\n  StageData,\n  StageKey,\n  TimelineItem,",
  "  BabyActivity,\n  FamilyData,\n  MomActivity,\n  ProfileMode,\n  TimelineItem,",
);
replaceExact(
  'src/features/sync/appSnapshot.ts',
  "  growth: {\n    currentStage: StageKey;\n    stages: Record<string, StageData>;\n    dailyHabits: DailyHabit[];\n  };",
  '  growth: GrowthFacts;',
);
replaceExact(
  'src/features/sync/appSnapshot.ts',
  "    growth: {\n      currentStage: growth.currentStage,\n      stages: structuredClone(growth.stages),\n      dailyHabits: structuredClone(growth.dailyHabits),\n    },",
  '    growth: exportGrowthFacts(growth),',
);
replaceExact(
  'src/features/sync/appSnapshot.ts',
  "    && isRecord(growth)\n    && typeof growth.currentStage === 'string'\n    && isRecord(growth.stages)\n    && Array.isArray(growth.dailyHabits)",
  '    && isGrowthFacts(growth)',
);
replaceExact(
  'src/features/sync/appSnapshot.ts',
  "  useGrowthStore.setState({\n    currentStage: parsed.growth.currentStage,\n    stages: structuredClone(parsed.growth.stages),\n    dailyHabits: structuredClone(parsed.growth.dailyHabits),\n  });",
  '  useGrowthStore.setState(hydrateGrowthFacts(parsed.growth));',
);

replaceExact(
  '../ARCHITECTURE.md',
  'The current growth store still contains some historical derived fields inside `StageData`. Those fields remain in the snapshot until the growth feature is split into raw measurements and calculated selectors. New code must not add another derived field to persistence.',
  '`GrowthFacts` persists only measurement facts, milestone progress, the active stage, and completed habit IDs. `StageData` is an in-memory projection rebuilt from those facts plus static reference data. WHO chart series, vitals summaries, scores, labels, and other calculated presentation are not persisted.',
);
replaceExact(
  '../ARCHITECTURE.md',
  '`services/localDb.ts` maps Zustand store names to the current physical namespace, `babygrowth_v4_*`.',
  '`data/localDb.ts` provides the current physical persistence boundary for `babygrowth_v4_*` records.',
);

console.log('Raw growth persistence migration applied.');

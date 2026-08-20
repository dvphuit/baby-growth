import { INITIAL_STAGES } from '@/data/seedData';
import type { GrowthChartData, GrowthHistoryRecord, StageKey } from '@/types';

const SEEDED_GROWTH_IDS = new Set(
  Object.values(INITIAL_STAGES).flatMap((stage) => (stage.growthHistory ?? []).map((record) => record.id)),
);

export function isSeedGrowthRecord(record: GrowthHistoryRecord): boolean {
  return SEEDED_GROWTH_IDS.has(record.id);
}

export function getRealGrowthHistory(records: GrowthHistoryRecord[] | undefined): GrowthHistoryRecord[] {
  return (records ?? []).filter((record) => !isSeedGrowthRecord(record));
}

export function buildRealGrowthChart(
  stageKey: StageKey,
  chart: GrowthChartData,
  records: GrowthHistoryRecord[] | undefined,
): GrowthChartData {
  const baseline = INITIAL_STAGES[stageKey]?.growthChart ?? chart;
  const labels = [...baseline.labels];
  const heightChild: (number | null)[] = labels.map(() => null);
  const weightChild: (number | null)[] = labels.map(() => null);
  const headChild: (number | null)[] = labels.map(() => null);

  getRealGrowthHistory(records).forEach((record) => {
    const index = typeof record.labelIndex === 'number' && record.labelIndex >= 0 && record.labelIndex < labels.length
      ? record.labelIndex
      : labels.length - 1;
    if (record.height > 0) heightChild[index] = record.height;
    if (record.weight > 0) weightChild[index] = record.weight;
    if (record.headCirc > 0) headChild[index] = record.headCirc;
  });

  return {
    labels,
    height: { ...baseline.height, child: heightChild },
    weight: { ...baseline.weight, child: weightChild },
    headCirc: { ...baseline.headCirc, child: headChild },
  };
}

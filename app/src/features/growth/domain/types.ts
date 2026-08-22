export type StageKey = 'stage_0_1' | 'stage_1_5' | 'stage_6_12' | 'stage_13_18';

export type GrowthMetric = 'height' | 'weight' | 'headCirc';

export interface Vitals {
  weight: string;
  height: string;
  headCirc: string;
  temperature: string;
  sleepTotal: string;
  milkTotal: string;
  diaperCount: number;
  mood: string;
  moodEmoji: string;
}

export interface MetricSeries {
  child: (number | null)[];
  whoP50: number[];
  whoP97: number[];
  whoP3: number[];
}

export interface GrowthChartData {
  labels: string[];
  height: MetricSeries;
  weight: MetricSeries;
  headCirc: MetricSeries;
}

export interface GrowthHistoryRecord {
  id: string;
  date: string;
  ageText: string;
  labelIndex?: number;
  weight: number;
  height: number;
  headCirc: number;
  percentileLabel: string;
  status: 'optimal' | 'attention' | 'warning';
  note: string;
}

export type GrowthMeasurementInput = Pick<
  GrowthHistoryRecord,
  'weight' | 'height' | 'headCirc'
> & Partial<Pick<GrowthHistoryRecord, 'date' | 'labelIndex' | 'note'>>;

export type GrowthMeasurementPatch = Partial<Pick<
  GrowthHistoryRecord,
  'date' | 'labelIndex' | 'weight' | 'height' | 'headCirc' | 'note'
>>;

export interface MotorMilestoneItem {
  id: string;
  name: string;
  ageWindow: string;
  icon: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  statusLabel: string;
  dateAchieved: string | null;
  note: string;
}

export interface MotorMilestones {
  score: number;
  scoreLabel: string;
  doctorNote: string;
  items: MotorMilestoneItem[];
}

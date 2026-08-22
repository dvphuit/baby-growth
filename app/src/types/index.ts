import type { GrowthChartData, GrowthHistoryRecord, MotorMilestones, StageKey, Vitals } from '@/features/growth';
import type { StageExpenseData } from '@/features/expenses';
export type TabType = 'home' | 'timeline' | 'growth' | 'expenses';

export interface StageData {
  id: StageKey;
  name: string;
  ageRange: string;
  currentAgeText: string;
  growthScore: number;
  growthScoreLabel: string;
  wellnessCategory: string;
  todayVitals: Vitals;
  growthChart: GrowthChartData;
  growthHistory: GrowthHistoryRecord[];
  motorMilestones: MotorMilestones;
  expenses: StageExpenseData;
}

export interface DailyHabit {
  id: string;
  title: string;
  time: string;
  icon: string;
  category: string;
  completed: boolean;
}

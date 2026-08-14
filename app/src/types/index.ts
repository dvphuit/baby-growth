export type StageKey = 'stage_0_1' | 'stage_1_5' | 'stage_6_12' | 'stage_13_18';

export type ProfileMode = 'baby' | 'mom';

export type TabType = 'home' | 'timeline' | 'growth' | 'expenses';

export type GrowthMetric = 'height' | 'weight' | 'headCirc';

export type CalendarViewMode = 'collapsed' | 'expanded';

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

export interface ExpenseCategoryItem {
  name: string;
  amount: string;
  percent: number;
  color: string;
}

export interface ExpenseMonthlyHistory {
  month: string;
  amount: number;
}

export interface StageExpenseData {
  totalMonth: string;
  budgetMonth: string;
  budgetPercent: number;
  categories: ExpenseCategoryItem[];
  monthlyHistory?: ExpenseMonthlyHistory[];
}

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

export interface FamilyData {
  childName: string;
  childFullName: string;
  birthDate: string;
  birthTime?: string;
  gender: 'boy' | 'girl';
  bloodType: string;
  childAvatar: string;
  momName: string;
  momAvatar: string;
  dadName: string;
  dadAvatar: string;
  birthWeight?: string;
  birthHeight?: string;
  headCircAtBirth?: string;
  hospital?: string;
  insuranceCode?: string;
  allergies?: string[];
  notes?: string;
}

export interface PumpingSession {
  time: string;
  amount: string;
  note: string;
}

export interface MomData {
  name: string;
  postpartumDay: string;
  wellnessScore: number;
  mentalHealth: {
    epdsScore: string;
    status: string;
    sleepDebt: string;
  };
  pumping: {
    todayTotal: string;
    sessionsToday: number;
    freezerStock: string;
    lastSession: string;
    time: string;
    history: PumpingSession[];
  };
  recovery: {
    uterusStatus: string;
    lochia: string;
    weightLoss: string;
  };
}

export interface CalendarRangeEvent {
  id: string;
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  color: string;
  icon: string;
  badge: string;
  note: string;
}

export interface TimelineItem {
  id: string;
  stage?: StageKey;
  date: string;
  timeFormatted: string;
  time: string;
  author: string;
  authorAvatar: string;
  title: string;
  content: string;
  mediaUrl?: string | null;
  mediaType?: 'photo' | 'video' | null;
  stats: string[];
  likes: number;
  comments: number;
  userLiked: boolean;
  tag: string;
  tagType: 'milestone' | 'feeding' | 'mom' | 'health' | 'general';
  type?: 'growth' | 'mom' | 'daily' | 'milestone';
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export interface AIChatKnowledge {
  doctorName: string;
  status: string;
  suggestedQuestions: string[];
  mockReplies: Record<string, string>;
}

export interface DailyHabit {
  id: string;
  title: string;
  time: string;
  icon: string;
  category: string;
  completed: boolean;
}

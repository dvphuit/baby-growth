import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { indexedDbStorage } from '@/services/localDb';
import type { StageKey, StageData, DailyHabit, GrowthHistoryRecord, FamilyData } from '@/types';
import type { ExpenseRecord } from '@/types/expense';
import { INITIAL_STAGES, INITIAL_DAILY_HABITS, FAMILY_DATA } from '@/data/seedData';
import { generateId } from '@/utils/format';

interface BabyStoreState {
  currentStage: StageKey;
  stages: Record<string, StageData>;
  dailyHabits: DailyHabit[];
  familyData: FamilyData;
  expenseRecords: ExpenseRecord[];
  monthlyExpenseBudget: number;
  currentStageData: () => StageData;
  setStage: (stage: StageKey) => void;
  setMonthlyExpenseBudget: (budget: number) => void;
  toggleHabit: (id: string) => void;
  initializeChildProfile: (
    profile: Partial<FamilyData>,
    initialVitals?: { weight?: number; height?: number; headCirc?: number },
  ) => void;
  updateFamilyData: (data: Partial<FamilyData>) => void;
  addGrowthMeasurement: (measurement: { weight: number; height: number; headCirc: number; date?: string; note?: string }) => void;
  updateGrowthMeasurement: (id: string, patch: Partial<Pick<GrowthHistoryRecord, 'date' | 'weight' | 'height' | 'headCirc' | 'note'>>) => void;
  deleteGrowthMeasurement: (id: string) => void;
  toggleMilestone: (milestoneId: string, status?: 'completed' | 'in-progress' | 'upcoming', dateAchieved?: string) => void;
  addExpenseRecord: (input: Pick<ExpenseRecord, 'amount' | 'category' | 'occurredAt' | 'note'>) => ExpenseRecord;
  updateExpenseRecord: (id: string, patch: Partial<Pick<ExpenseRecord, 'amount' | 'category' | 'occurredAt' | 'note'>>) => void;
  deleteExpenseRecord: (id: string) => void;
  resetTrackingData: () => void;
  resetToDefaults: () => void;
}


function createExpenseId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `expense-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function growthDateTimestamp(value: string): number {
  const parsed = new Date(value).getTime();
  if (Number.isFinite(parsed)) return parsed;
  const match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!match) return 0;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), 12).getTime();
}

export const useBabyStore = create<BabyStoreState>()(
  persist(
    (set, get) => ({
      currentStage: 'stage_0_1',
      stages: INITIAL_STAGES,
      dailyHabits: INITIAL_DAILY_HABITS,
      familyData: FAMILY_DATA,
      expenseRecords: [],
      monthlyExpenseBudget: 5_000_000,
      setMonthlyExpenseBudget: (budget) => set({ monthlyExpenseBudget: Math.max(0, budget) }),
      currentStageData: () => {
        const { stages, currentStage } = get();
        return stages[currentStage] || stages['stage_0_1'] || INITIAL_STAGES['stage_0_1'];
      },
      setStage: (stage) => set({ currentStage: stage }),
      toggleHabit: (id) => set((state) => ({ dailyHabits: state.dailyHabits.map((habit) => habit.id === id ? { ...habit, completed: !habit.completed } : habit) })),
      updateFamilyData: (updates) => set((state) => ({ familyData: { ...state.familyData, ...updates } })),

      initializeChildProfile: (profile, initialVitals) => {
        const birth = profile.birthDate ? new Date(profile.birthDate) : new Date();
        const now = new Date();
        const diffMonths = Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth());

        let targetStage: StageKey = 'stage_0_1';
        if (diffMonths > 12 * 12) targetStage = 'stage_13_18';
        else if (diffMonths > 5 * 12) targetStage = 'stage_6_12';
        else if (diffMonths > 12) targetStage = 'stage_1_5';

        const updatedFamily: FamilyData = {
          ...FAMILY_DATA,
          ...profile,
          isInitialized: true,
        };

        set((prevState) => {
          const stage = { ...prevState.stages[targetStage] };
          const w = initialVitals?.weight || (profile.birthWeight ? parseFloat(profile.birthWeight) : 0) || 0;
          const h = initialVitals?.height || (profile.birthHeight ? parseFloat(profile.birthHeight) : 0) || 0;
          const hc = initialVitals?.headCirc || (profile.headCircAtBirth ? parseFloat(profile.headCircAtBirth) : 0) || 0;

          if (w > 0 || h > 0 || hc > 0) {
            const birthRecord: GrowthHistoryRecord = {
              id: generateId('gh_birth'),
              date: profile.birthDate || new Date().toISOString().split('T')[0],
              ageText: 'Sơ sinh (Lúc chào đời)',
              labelIndex: 0,
              weight: w,
              height: h,
              headCirc: hc,
              percentileLabel: 'Chuẩn lúc sinh',
              status: 'optimal',
              note: 'Chỉ số thể chất lúc sinh của Bé.',
            };
            stage.growthHistory = [birthRecord];
            stage.todayVitals = {
              ...stage.todayVitals,
              weight: w > 0 ? `${w} kg` : '',
              height: h > 0 ? `${h} cm` : '',
              headCirc: hc > 0 ? `${hc} cm` : '',
            };
            if (stage.growthChart?.labels) {
              const newH = [...stage.growthChart.height.child];
              const newW = [...stage.growthChart.weight.child];
              const newHC = [...stage.growthChart.headCirc.child];
              if (h > 0) newH[0] = h;
              if (w > 0) newW[0] = w;
              if (hc > 0) newHC[0] = hc;
              stage.growthChart = {
                ...stage.growthChart,
                height: { ...stage.growthChart.height, child: newH },
                weight: { ...stage.growthChart.weight, child: newW },
                headCirc: { ...stage.growthChart.headCirc, child: newHC },
              };
            }
          }

          return {
            ...prevState,
            currentStage: targetStage,
            familyData: updatedFamily,
            stages: {
              ...prevState.stages,
              [targetStage]: stage,
            },
          };
        });
      },


      addGrowthMeasurement: ({ weight, height, headCirc, date, note }) => {
        const dateStr = date || new Date().toISOString().split('T')[0];
        const stageData = get().currentStageData();
        const ageText = stageData.currentAgeText || 'Hiện tại';
        set((prevState) => {
          const currentStage = prevState.currentStage;
          const stage = { ...prevState.stages[currentStage] };
          if (!stage) return prevState;
          stage.todayVitals = {
            ...stage.todayVitals,
            weight: weight > 0 ? `${weight} kg` : stage.todayVitals.weight,
            height: height > 0 ? `${height} cm` : stage.todayVitals.height,
            headCirc: headCirc > 0 ? `${headCirc} cm` : stage.todayVitals.headCirc,
          };
          let labelIndex: number | undefined;
          if (stage.growthChart?.labels) {
            const idx = Math.max(0, stage.growthChart.labels.length - 3);
            labelIndex = idx;
            if (idx < stage.growthChart.labels.length) {
              const newH = [...stage.growthChart.height.child];
              const newW = [...stage.growthChart.weight.child];
              const newHC = [...stage.growthChart.headCirc.child];
              if (height > 0) newH[idx] = height;
              if (weight > 0) newW[idx] = weight;
              if (headCirc > 0) newHC[idx] = headCirc;
              stage.growthChart = {
                ...stage.growthChart,
                height: { ...stage.growthChart.height, child: newH },
                weight: { ...stage.growthChart.weight, child: newW },
                headCirc: { ...stage.growthChart.headCirc, child: newHC },
              };
            }
          }
          const newRecord: GrowthHistoryRecord = {
            id: generateId('gh'), date: dateStr, ageText, labelIndex, weight, height, headCirc,
            percentileLabel: '', status: 'optimal', note: note?.trim() ?? '',
          };
          stage.growthHistory = [newRecord, ...(stage.growthHistory || [])];
          return { ...prevState, stages: { ...prevState.stages, [currentStage]: stage } };
        });
      },

      updateGrowthMeasurement: (id, patch) => {
        set((prevState) => {
          const currentStage = prevState.currentStage;
          const stage = { ...prevState.stages[currentStage] };
          if (!stage?.growthHistory) return prevState;

          const currentRecord = stage.growthHistory.find((record) => record.id === id);
          if (!currentRecord) return prevState;
          const updatedRecord = { ...currentRecord, ...patch, id: currentRecord.id };
          const updatedHistory = stage.growthHistory
            .map((record) => record.id === id ? updatedRecord : record)
            .sort((a, b) => growthDateTimestamp(b.date) - growthDateTimestamp(a.date));

          if (typeof updatedRecord.labelIndex === 'number' && stage.growthChart?.labels) {
            const index = updatedRecord.labelIndex;
            const heightValues = [...stage.growthChart.height.child];
            const weightValues = [...stage.growthChart.weight.child];
            const headValues = [...stage.growthChart.headCirc.child];
            if (index >= 0 && index < stage.growthChart.labels.length) {
              heightValues[index] = updatedRecord.height;
              weightValues[index] = updatedRecord.weight;
              headValues[index] = updatedRecord.headCirc;
              stage.growthChart = {
                ...stage.growthChart,
                height: { ...stage.growthChart.height, child: heightValues },
                weight: { ...stage.growthChart.weight, child: weightValues },
                headCirc: { ...stage.growthChart.headCirc, child: headValues },
              };
            }
          }

          const latest = updatedHistory[0];
          if (latest) {
            stage.todayVitals = {
              ...stage.todayVitals,
              weight: latest.weight > 0 ? `${latest.weight} kg` : stage.todayVitals.weight,
              height: latest.height > 0 ? `${latest.height} cm` : stage.todayVitals.height,
              headCirc: latest.headCirc > 0 ? `${latest.headCirc} cm` : stage.todayVitals.headCirc,
            };
          }
          stage.growthHistory = updatedHistory;
          return { ...prevState, stages: { ...prevState.stages, [currentStage]: stage } };
        });
      },

      deleteGrowthMeasurement: (id: string) => {
        set((prevState) => {
          const currentStage = prevState.currentStage;
          const stage = { ...prevState.stages[currentStage] };
          if (!stage || !stage.growthHistory) return prevState;
          const removedRecord = stage.growthHistory.find((rec) => rec.id === id);
          if (!removedRecord) return prevState;
          const updatedHistory = stage.growthHistory.filter((rec) => rec.id !== id);
          const latest = updatedHistory[0];
          stage.todayVitals = {
            ...stage.todayVitals,
            weight: latest?.weight && latest.weight > 0 ? `${latest.weight} kg` : '',
            height: latest?.height && latest.height > 0 ? `${latest.height} cm` : '',
            headCirc: latest?.headCirc && latest.headCirc > 0 ? `${latest.headCirc} cm` : '',
          };
          if (typeof removedRecord.labelIndex === 'number' && stage.growthChart?.labels) {
            const index = removedRecord.labelIndex;
            const fallback = updatedHistory.find((record) => record.labelIndex === index);
            const heightValues = [...stage.growthChart.height.child];
            const weightValues = [...stage.growthChart.weight.child];
            const headValues = [...stage.growthChart.headCirc.child];
            if (index >= 0 && index < stage.growthChart.labels.length) {
              heightValues[index] = fallback?.height && fallback.height > 0 ? fallback.height : null;
              weightValues[index] = fallback?.weight && fallback.weight > 0 ? fallback.weight : null;
              headValues[index] = fallback?.headCirc && fallback.headCirc > 0 ? fallback.headCirc : null;
              stage.growthChart = {
                ...stage.growthChart,
                height: { ...stage.growthChart.height, child: heightValues },
                weight: { ...stage.growthChart.weight, child: weightValues },
                headCirc: { ...stage.growthChart.headCirc, child: headValues },
              };
            }
          }
          stage.growthHistory = updatedHistory;
          return { ...prevState, stages: { ...prevState.stages, [currentStage]: stage } };
        });
      },

      toggleMilestone: (milestoneId: string, targetStatus?: 'completed' | 'in-progress' | 'upcoming', dateAchieved?: string) => {
        const todayStr = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
        set((prevState) => {
          const currentStage = prevState.currentStage;
          const stage = { ...prevState.stages[currentStage] };
          if (!stage || !stage.motorMilestones?.items) return prevState;

          const updatedItems = stage.motorMilestones.items.map((item) => {
            if (item.id !== milestoneId) return item;
            const nextStatus: 'completed' | 'in-progress' | 'upcoming' = targetStatus ?? (item.status === 'completed' ? 'in-progress' : 'completed');
            const nextStatusLabel = nextStatus === 'completed' ? 'Đạt chuẩn' : nextStatus === 'in-progress' ? 'Đang tập' : 'Sắp tới';
            const nextDate = nextStatus === 'completed' ? (dateAchieved || item.dateAchieved || todayStr) : null;
            return {
              ...item,
              status: nextStatus,
              statusLabel: nextStatusLabel,
              dateAchieved: nextDate,
            };
          });

          const completedCount = updatedItems.filter((i) => i.status === 'completed').length;
          const totalCount = updatedItems.length;
          const calculatedScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : stage.motorMilestones.score;

          stage.motorMilestones = {
            ...stage.motorMilestones,
            items: updatedItems,
            score: calculatedScore,
          };

          return { ...prevState, stages: { ...prevState.stages, [currentStage]: stage } };
        });
      },

      addExpenseRecord: (input) => {
        const now = new Date().toISOString();
        const record: ExpenseRecord = {
          id: createExpenseId(), amount: input.amount, category: input.category, occurredAt: input.occurredAt,
          note: input.note, createdAt: now, updatedAt: now,
        };
        set((state) => ({ expenseRecords: [record, ...(state.expenseRecords ?? [])] }));
        return record;
      },
      updateExpenseRecord: (id, patch) => set((state) => ({
        expenseRecords: (state.expenseRecords ?? []).map((record) => record.id === id
          ? { ...record, ...patch, id: record.id, createdAt: record.createdAt, updatedAt: new Date().toISOString() }
          : record),
      })),
      deleteExpenseRecord: (id) => set((state) => ({ expenseRecords: (state.expenseRecords ?? []).filter((record) => record.id !== id) })),
      resetTrackingData: () => {
        const existingBirthRecord = Object.values(get().stages)
          .flatMap((stage) => stage.growthHistory ?? [])
          .find((record) => record.id.startsWith('gh_birth')
            || (record.ageText === 'Sơ sinh (Lúc chào đời)' && record.labelIndex === 0));
        const {
          childName,
          childFullName,
          birthDate,
          birthTime,
          gender,
          bloodType,
          childAvatar,
          momName,
          momAvatar,
          birthWeight,
          birthHeight,
          headCircAtBirth,
          hospital,
        } = get().familyData;
        const birth = birthDate ? new Date(birthDate) : new Date();
        const now = new Date();
        const diffMonths = Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth());

        let currentStage: StageKey = 'stage_0_1';
        if (diffMonths > 12 * 12) currentStage = 'stage_13_18';
        else if (diffMonths > 5 * 12) currentStage = 'stage_6_12';
        else if (diffMonths > 12) currentStage = 'stage_1_5';

        const preservedFamily: FamilyData = {
          isInitialized: true,
          childName,
          childFullName,
          birthDate,
          birthTime,
          gender,
          bloodType,
          childAvatar,
          momName,
          momAvatar,
          birthWeight,
          birthHeight,
          headCircAtBirth,
          hospital,
        };
        const stages = structuredClone(INITIAL_STAGES);
        const positiveValue = (value: number | string | undefined): number => {
          const parsed = typeof value === 'number' ? value : parseFloat(value || '');
          return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
        };
        const existingWeight = positiveValue(existingBirthRecord?.weight);
        const existingHeight = positiveValue(existingBirthRecord?.height);
        const existingHeadCirc = positiveValue(existingBirthRecord?.headCirc);
        const hasExistingBirthMeasurement = existingWeight > 0 || existingHeight > 0 || existingHeadCirc > 0;
        const weight = hasExistingBirthMeasurement ? existingWeight : positiveValue(birthWeight);
        const height = hasExistingBirthMeasurement ? existingHeight : positiveValue(birthHeight);
        const headCirc = hasExistingBirthMeasurement ? existingHeadCirc : positiveValue(headCircAtBirth);
        const hasBirthMeasurement = weight > 0 || height > 0 || headCirc > 0;
        const stage = stages[currentStage];

        stage.growthHistory = hasBirthMeasurement
          ? [{
              ...(hasExistingBirthMeasurement ? existingBirthRecord : undefined),
              id: hasExistingBirthMeasurement ? existingBirthRecord!.id : 'gh_birth',
              date: hasExistingBirthMeasurement
                ? existingBirthRecord!.date
                : birthDate || new Date().toISOString().split('T')[0],
              ageText: 'Sơ sinh (Lúc chào đời)',
              labelIndex: 0,
              weight,
              height,
              headCirc,
              percentileLabel: hasExistingBirthMeasurement
                ? existingBirthRecord!.percentileLabel
                : 'Chuẩn lúc sinh',
              status: hasExistingBirthMeasurement ? existingBirthRecord!.status : 'optimal',
              note: hasExistingBirthMeasurement
                ? existingBirthRecord!.note
                : 'Chỉ số thể chất lúc sinh của Bé.',
            }]
          : [];
        stage.todayVitals = {
          ...stage.todayVitals,
          weight: weight > 0 ? `${weight} kg` : '',
          height: height > 0 ? `${height} cm` : '',
          headCirc: headCirc > 0 ? `${headCirc} cm` : '',
        };
        if (hasBirthMeasurement) {
          if (weight > 0) stage.growthChart.weight.child[0] = weight;
          if (height > 0) stage.growthChart.height.child[0] = height;
          if (headCirc > 0) stage.growthChart.headCirc.child[0] = headCirc;
        }
        stage.motorMilestones = {
          ...stage.motorMilestones,
          score: 0,
          items: stage.motorMilestones.items.map((item) => ({
            ...item,
            status: 'upcoming',
            statusLabel: 'Sắp tới',
            dateAchieved: null,
          })),
        };

        set({
          currentStage,
          stages,
          dailyHabits: structuredClone(INITIAL_DAILY_HABITS),
          familyData: preservedFamily,
          expenseRecords: [],
          monthlyExpenseBudget: 5_000_000,
        });
      },
      resetToDefaults: () => set({
        currentStage: 'stage_0_1',
        stages: INITIAL_STAGES,
        dailyHabits: INITIAL_DAILY_HABITS,
        familyData: FAMILY_DATA,
        expenseRecords: [],
        monthlyExpenseBudget: 5_000_000,
      }),
    }),
    {
      name: 'babygrowth_v2_baby',
      storage: createJSONStorage(() => indexedDbStorage),
      merge: (persistedState, currentState) => {
        const typedPersisted = (persistedState as Partial<BabyStoreState>) || {};
        return {
          ...currentState,
          ...typedPersisted,
          expenseRecords: typedPersisted.expenseRecords ?? [],
          monthlyExpenseBudget: typeof typedPersisted.monthlyExpenseBudget === 'number'
            ? typedPersisted.monthlyExpenseBudget
            : 5_000_000,
        };
      },
    },
  ),
);

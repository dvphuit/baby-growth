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
  currentStageData: () => StageData;
  setStage: (stage: StageKey) => void;
  toggleHabit: (id: string) => void;
  updateFamilyData: (data: Partial<FamilyData>) => void;
  addGrowthMeasurement: (measurement: { weight: number; height: number; headCirc: number; date?: string; note?: string }) => void;
  addExpenseRecord: (input: Pick<ExpenseRecord, 'amount' | 'category' | 'occurredAt' | 'note'>) => ExpenseRecord;
  updateExpenseRecord: (id: string, patch: Partial<Pick<ExpenseRecord, 'amount' | 'category' | 'occurredAt' | 'note'>>) => void;
  deleteExpenseRecord: (id: string) => void;
  resetToDefaults: () => void;
}

function createExpenseId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `expense-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const useBabyStore = create<BabyStoreState>()(
  persist(
    (set, get) => ({
      currentStage: 'stage_0_1',
      stages: INITIAL_STAGES,
      dailyHabits: INITIAL_DAILY_HABITS,
      familyData: FAMILY_DATA,
      expenseRecords: [],
      currentStageData: () => {
        const { stages, currentStage } = get();
        return stages[currentStage] || stages['stage_0_1'] || INITIAL_STAGES['stage_0_1'];
      },
      setStage: (stage) => set({ currentStage: stage }),
      toggleHabit: (id) => set((state) => ({ dailyHabits: state.dailyHabits.map((habit) => habit.id === id ? { ...habit, completed: !habit.completed } : habit) })),
      updateFamilyData: (updates) => set((state) => ({ familyData: { ...state.familyData, ...updates } })),

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

      resetToDefaults: () => set({ currentStage: 'stage_0_1', stages: INITIAL_STAGES, dailyHabits: INITIAL_DAILY_HABITS, familyData: FAMILY_DATA, expenseRecords: [] }),
    }),
    { name: 'babygrowth_v2_baby', storage: createJSONStorage(() => indexedDbStorage) },
  ),
);

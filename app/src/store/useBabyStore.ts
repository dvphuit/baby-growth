import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { indexedDbStorage } from '@/services/localDb';
import type { StageKey, StageData, DailyHabit, GrowthHistoryRecord, FamilyData } from '@/types';
import { INITIAL_STAGES, INITIAL_DAILY_HABITS, FAMILY_DATA } from '@/data/seedData';
import { generateId } from '@/utils/format';
import { useTimelineStore } from './useTimelineStore';

interface BabyStoreState {
  currentStage: StageKey;
  stages: Record<string, StageData>;
  dailyHabits: DailyHabit[];
  familyData: FamilyData;
  currentStageData: () => StageData;
  setStage: (stage: StageKey) => void;
  toggleHabit: (id: string) => void;
  updateFamilyData: (data: Partial<FamilyData>) => void;
  addGrowthMeasurement: (measurement: {
    weight: number;
    height: number;
    headCirc: number;
    date?: string;
    note?: string;
  }) => void;
  resetToDefaults: () => void;
}

export const useBabyStore = create<BabyStoreState>()(
  persist(
    (set, get) => ({
      currentStage: 'stage_0_1',
      stages: INITIAL_STAGES,
      dailyHabits: INITIAL_DAILY_HABITS,
      familyData: FAMILY_DATA,

      currentStageData: () => {
        const { stages, currentStage } = get();
        return stages[currentStage] || stages['stage_0_1'] || INITIAL_STAGES['stage_0_1'];
      },

      setStage: (stage) => set({ currentStage: stage }),

      toggleHabit: (id) => set((state) => ({
        dailyHabits: state.dailyHabits.map((habit) =>
          habit.id === id ? { ...habit, completed: !habit.completed } : habit
        ),
      })),

      updateFamilyData: (updates) => set((state) => ({
        familyData: {
          ...state.familyData,
          ...updates,
        },
      })),

      addGrowthMeasurement: ({ weight, height, headCirc, date, note }) => {
        const dateStr = date || new Date().toISOString().split('T')[0];
        const state = get();
        const stageData = state.currentStageData();
        const ageText = stageData.currentAgeText || 'Hiện tại';
        const noteText = note || 'Bé phát triển khỏe mạnh theo chuẩn WHO.';

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

          if (stage.growthChart && stage.growthChart.labels) {
            const idx = stage.growthChart.labels.length - 3;
            if (idx >= 0 && idx < stage.growthChart.labels.length) {
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
            id: generateId('gh'),
            date: dateStr,
            ageText,
            weight,
            height,
            headCirc,
            percentileLabel: 'P50 - P65 (Chuẩn WHO Tối ưu)',
            status: 'optimal',
            note: noteText,
          };

          stage.growthHistory = [newRecord, ...(stage.growthHistory || [])];

          return { ...prevState, stages: { ...prevState.stages, [currentStage]: stage } };
        });

        // Add to Timeline
        useTimelineStore.getState().addTimelineItem({
          type: 'growth',
          date: dateStr,
          title: `Cập nhật số đo mới: ${weight}kg • ${height}cm 📏`,
          content: `Bé Bơ vừa được ba mẹ đo chỉ số phát triển: Cân nặng ${weight}kg, Chiều cao ${height}cm, Vòng đầu ${headCirc}cm. ${noteText}`,
          stats: [`${weight} kg`, `${height} cm`, `Vòng đầu: ${headCirc} cm`],
          tag: 'Cân đo WHO',
          tagType: 'milestone',
        });
      },

      resetToDefaults: () => set({
        currentStage: 'stage_0_1',
        stages: INITIAL_STAGES,
        dailyHabits: INITIAL_DAILY_HABITS,
        familyData: FAMILY_DATA,
      }),
    }),
    {
      name: 'babygrowth_v2_baby',
      storage: createJSONStorage(() => indexedDbStorage),
    }
  )
);

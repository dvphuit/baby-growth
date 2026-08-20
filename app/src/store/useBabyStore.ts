import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { FAMILY_DATA, INITIAL_DAILY_HABITS, INITIAL_STAGES } from '@/data/seedData';
import { indexedDbStorage } from '@/data/localDb';
import type { DailyHabit, FamilyData, GrowthHistoryRecord, StageData, StageKey } from '@/types';
import { generateId } from '@/utils/format';

interface BabyStoreState {
  currentStage: StageKey;
  stages: Record<string, StageData>;
  dailyHabits: DailyHabit[];
  familyData: FamilyData;
  currentStageData: () => StageData;
  setStage: (stage: StageKey) => void;
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
  resetTrackingData: () => void;
  resetToDefaults: () => void;
}

function growthDateTimestamp(value: string): number {
  const parsed = new Date(value).getTime();
  if (Number.isFinite(parsed)) return parsed;
  const match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!match) return 0;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), 12).getTime();
}

function getStageForBirthDate(birthDate: string): StageKey {
  const birth = birthDate ? new Date(birthDate) : new Date();
  const now = new Date();
  const diffMonths = Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth());
  if (diffMonths > 12 * 12) return 'stage_13_18';
  if (diffMonths > 5 * 12) return 'stage_6_12';
  if (diffMonths > 12) return 'stage_1_5';
  return 'stage_0_1';
}

export const useBabyStore = create<BabyStoreState>()(
  persist(
    (set, get) => ({
      currentStage: 'stage_0_1',
      stages: structuredClone(INITIAL_STAGES),
      dailyHabits: structuredClone(INITIAL_DAILY_HABITS),
      familyData: structuredClone(FAMILY_DATA),
      currentStageData: () => {
        const { stages, currentStage } = get();
        return stages[currentStage] || stages.stage_0_1 || INITIAL_STAGES.stage_0_1;
      },
      setStage: (stage) => set({ currentStage: stage }),
      toggleHabit: (id) => set((state) => ({
        dailyHabits: state.dailyHabits.map((habit) => habit.id === id ? { ...habit, completed: !habit.completed } : habit),
      })),
      updateFamilyData: (updates) => set((state) => ({ familyData: { ...state.familyData, ...updates } })),

      initializeChildProfile: (profile, initialVitals) => {
        const targetStage = getStageForBirthDate(profile.birthDate || '');
        const updatedFamily: FamilyData = { ...FAMILY_DATA, ...profile, isInitialized: true };

        set((prevState) => {
          const stage = structuredClone(prevState.stages[targetStage]);
          const weight = initialVitals?.weight || (profile.birthWeight ? parseFloat(profile.birthWeight) : 0) || 0;
          const height = initialVitals?.height || (profile.birthHeight ? parseFloat(profile.birthHeight) : 0) || 0;
          const headCirc = initialVitals?.headCirc || (profile.headCircAtBirth ? parseFloat(profile.headCircAtBirth) : 0) || 0;

          if (weight > 0 || height > 0 || headCirc > 0) {
            const birthRecord: GrowthHistoryRecord = {
              id: generateId('gh_birth'),
              date: profile.birthDate || new Date().toISOString().split('T')[0],
              ageText: 'Sơ sinh (Lúc chào đời)',
              labelIndex: 0,
              weight,
              height,
              headCirc,
              percentileLabel: 'Chuẩn lúc sinh',
              status: 'optimal',
              note: 'Chỉ số thể chất lúc sinh của Bé.',
            };
            stage.growthHistory = [birthRecord];
            stage.todayVitals = {
              ...stage.todayVitals,
              weight: weight > 0 ? `${weight} kg` : '',
              height: height > 0 ? `${height} cm` : '',
              headCirc: headCirc > 0 ? `${headCirc} cm` : '',
            };
            if (stage.growthChart?.labels) {
              const nextHeight = [...stage.growthChart.height.child];
              const nextWeight = [...stage.growthChart.weight.child];
              const nextHeadCirc = [...stage.growthChart.headCirc.child];
              if (height > 0) nextHeight[0] = height;
              if (weight > 0) nextWeight[0] = weight;
              if (headCirc > 0) nextHeadCirc[0] = headCirc;
              stage.growthChart = {
                ...stage.growthChart,
                height: { ...stage.growthChart.height, child: nextHeight },
                weight: { ...stage.growthChart.weight, child: nextWeight },
                headCirc: { ...stage.growthChart.headCirc, child: nextHeadCirc },
              };
            }
          }

          return {
            ...prevState,
            currentStage: targetStage,
            familyData: updatedFamily,
            stages: { ...prevState.stages, [targetStage]: stage },
          };
        });
      },

      addGrowthMeasurement: ({ weight, height, headCirc, date, note }) => {
        const dateStr = date || new Date().toISOString().split('T')[0];
        const ageText = get().currentStageData().currentAgeText || 'Hiện tại';
        set((prevState) => {
          const currentStage = prevState.currentStage;
          const stage = structuredClone(prevState.stages[currentStage]);
          if (!stage) return prevState;

          stage.todayVitals = {
            ...stage.todayVitals,
            weight: weight > 0 ? `${weight} kg` : stage.todayVitals.weight,
            height: height > 0 ? `${height} cm` : stage.todayVitals.height,
            headCirc: headCirc > 0 ? `${headCirc} cm` : stage.todayVitals.headCirc,
          };
          let labelIndex: number | undefined;
          if (stage.growthChart?.labels) {
            const index = Math.max(0, stage.growthChart.labels.length - 3);
            labelIndex = index;
            if (index < stage.growthChart.labels.length) {
              const nextHeight = [...stage.growthChart.height.child];
              const nextWeight = [...stage.growthChart.weight.child];
              const nextHeadCirc = [...stage.growthChart.headCirc.child];
              if (height > 0) nextHeight[index] = height;
              if (weight > 0) nextWeight[index] = weight;
              if (headCirc > 0) nextHeadCirc[index] = headCirc;
              stage.growthChart = {
                ...stage.growthChart,
                height: { ...stage.growthChart.height, child: nextHeight },
                weight: { ...stage.growthChart.weight, child: nextWeight },
                headCirc: { ...stage.growthChart.headCirc, child: nextHeadCirc },
              };
            }
          }
          const newRecord: GrowthHistoryRecord = {
            id: generateId('gh'),
            date: dateStr,
            ageText,
            labelIndex,
            weight,
            height,
            headCirc,
            percentileLabel: '',
            status: 'optimal',
            note: note?.trim() ?? '',
          };
          stage.growthHistory = [newRecord, ...(stage.growthHistory || [])];
          return { ...prevState, stages: { ...prevState.stages, [currentStage]: stage } };
        });
      },

      updateGrowthMeasurement: (id, patch) => {
        set((prevState) => {
          const currentStage = prevState.currentStage;
          const stage = structuredClone(prevState.stages[currentStage]);
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

      deleteGrowthMeasurement: (id) => {
        set((prevState) => {
          const currentStage = prevState.currentStage;
          const stage = structuredClone(prevState.stages[currentStage]);
          if (!stage?.growthHistory) return prevState;
          const removedRecord = stage.growthHistory.find((record) => record.id === id);
          if (!removedRecord) return prevState;

          const updatedHistory = stage.growthHistory.filter((record) => record.id !== id);
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

      toggleMilestone: (milestoneId, targetStatus, dateAchieved) => {
        const today = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
        set((prevState) => {
          const currentStage = prevState.currentStage;
          const stage = structuredClone(prevState.stages[currentStage]);
          if (!stage?.motorMilestones?.items) return prevState;

          const updatedItems = stage.motorMilestones.items.map((item) => {
            if (item.id !== milestoneId) return item;
            const nextStatus = targetStatus ?? (item.status === 'completed' ? 'in-progress' : 'completed');
            const statusLabel = nextStatus === 'completed' ? 'Đạt chuẩn' : nextStatus === 'in-progress' ? 'Đang tập' : 'Sắp tới';
            const nextDate = nextStatus === 'completed' ? (dateAchieved || item.dateAchieved || today) : null;
            return { ...item, status: nextStatus, statusLabel, dateAchieved: nextDate };
          });
          const completedCount = updatedItems.filter((item) => item.status === 'completed').length;
          const score = updatedItems.length > 0
            ? Math.round((completedCount / updatedItems.length) * 100)
            : stage.motorMilestones.score;
          stage.motorMilestones = { ...stage.motorMilestones, items: updatedItems, score };
          return { ...prevState, stages: { ...prevState.stages, [currentStage]: stage } };
        });
      },

      resetTrackingData: () => {
        const state = get();
        const existingBirthRecord = Object.values(state.stages)
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
        } = state.familyData;
        const currentStage = getStageForBirthDate(birthDate);
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
        const preservedBirthRecord = hasExistingBirthMeasurement ? existingBirthRecord : undefined;

        stage.growthHistory = hasBirthMeasurement
          ? [{
              ...preservedBirthRecord,
              id: preservedBirthRecord?.id ?? 'gh_birth',
              date: preservedBirthRecord?.date ?? (birthDate || new Date().toISOString().split('T')[0]),
              ageText: 'Sơ sinh (Lúc chào đời)',
              labelIndex: 0,
              weight,
              height,
              headCirc,
              percentileLabel: preservedBirthRecord?.percentileLabel ?? 'Chuẩn lúc sinh',
              status: preservedBirthRecord?.status ?? 'optimal',
              note: preservedBirthRecord?.note ?? 'Chỉ số thể chất lúc sinh của Bé.',
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
        });
      },
      resetToDefaults: () => set({
        currentStage: 'stage_0_1',
        stages: structuredClone(INITIAL_STAGES),
        dailyHabits: structuredClone(INITIAL_DAILY_HABITS),
        familyData: structuredClone(FAMILY_DATA),
      }),
    }),
    {
      name: 'babygrowth_v4_baby',
      storage: createJSONStorage(() => indexedDbStorage),
    },
  ),
);

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { indexedDbStorage } from '@/services/localDb';
import type { MomData } from '@/types';
import { INITIAL_MOM_DATA } from '@/data/seedData';
import { currentTimeStr } from '@/utils/date';

interface MomStoreState {
  momData: MomData;
  addPumpingSession: (amountMl: number, side?: string) => void;
  updateMomData: (partial: Partial<MomData>) => void;
}

export const useMomStore = create<MomStoreState>()(
  persist(
    (set, get) => ({
      momData: INITIAL_MOM_DATA,

      addPumpingSession: (amountMl, side = '2 bên') => {
        const nowTime = currentTimeStr();
        const state = get();
        const currentTotalNum = parseInt(state.momData.pumping.todayTotal, 10) || 0;
        const newTotalStr = `${currentTotalNum + amountMl} ml`;

        set((prevState) => ({
          momData: {
            ...prevState.momData,
            pumping: {
              ...prevState.momData.pumping,
              lastSession: `${amountMl} ml`,
              time: `Lúc ${nowTime} (${side})`,
              todayTotal: newTotalStr,
              sessionsToday: prevState.momData.pumping.sessionsToday + 1,
              history: [
                { time: nowTime, amount: `${amountMl} ml`, note: `Hút bên: ${side}` },
                ...(prevState.momData.pumping.history || []),
              ],
            },
          },
        }));
      },

      updateMomData: (partial) => set((state) => ({
        momData: { ...state.momData, ...partial }
      })),
    }),
    {
      name: 'babygrowth_v2_mom',
      storage: createJSONStorage(() => indexedDbStorage),
    }
  )
);

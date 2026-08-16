import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { indexedDbStorage } from '@/services/localDb';
import type { ActivityRecord, BabyActivity, MomActivity } from '@/types';

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `activity-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export interface ActivityStoreState {
  babyActivities: BabyActivity[];
  momActivities: MomActivity[];
  addBabyActivity: (input: Omit<BabyActivity, 'id' | 'createdAt'>) => BabyActivity;
  addMomActivity: (input: Omit<MomActivity, 'id' | 'createdAt'>) => MomActivity;
  updateActivity: (id: string, patch: Partial<ActivityRecord>) => void;
  deleteActivity: (id: string) => void;
}

export const useActivityStore = create<ActivityStoreState>()(
  persist(
    (set) => ({
      babyActivities: [],
      momActivities: [],

      addBabyActivity: (input) => {
        const record = { ...input, id: createId(), createdAt: nowIso() } as BabyActivity;
        set((state) => ({ babyActivities: [record, ...state.babyActivities] }));
        return record;
      },

      addMomActivity: (input) => {
        const record = { ...input, id: createId(), createdAt: nowIso() } as MomActivity;
        set((state) => ({ momActivities: [record, ...state.momActivities] }));
        return record;
      },

      updateActivity: (id, patch) => {
        set((state) => ({
          babyActivities: state.babyActivities.map((record) =>
            record.id === id ? ({ ...record, ...patch, id: record.id, owner: 'baby' } as BabyActivity) : record
          ),
          momActivities: state.momActivities.map((record) =>
            record.id === id ? ({ ...record, ...patch, id: record.id, owner: 'mom' } as MomActivity) : record
          ),
        }));
      },

      deleteActivity: (id) => {
        set((state) => ({
          babyActivities: state.babyActivities.filter((record) => record.id !== id),
          momActivities: state.momActivities.filter((record) => record.id !== id),
        }));
      },
    }),
    {
      name: 'babygrowth_v3_activities',
      storage: createJSONStorage(() => indexedDbStorage),
      partialize: (state) => ({
        babyActivities: state.babyActivities,
        momActivities: state.momActivities,
      }),
    }
  )
);

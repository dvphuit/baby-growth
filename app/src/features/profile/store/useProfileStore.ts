import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { FAMILY_DATA } from '@/data/seedData';
import { indexedDbStorage } from '@/data/localDb';
import type { FamilyData } from '@/features/profile/domain/types';

export interface ProfileStoreState {
  familyData: FamilyData;
  initializeChildProfile: (profile: Partial<FamilyData>) => void;
  updateFamilyData: (data: Partial<FamilyData>) => void;
  resetToDefaults: () => void;
}

export const useProfileStore = create<ProfileStoreState>()(
  persist(
    (set) => ({
      familyData: structuredClone(FAMILY_DATA),
      initializeChildProfile: (profile) => set({
        familyData: { ...structuredClone(FAMILY_DATA), ...profile, isInitialized: true },
      }),
      updateFamilyData: (updates) => set((state) => ({
        familyData: { ...state.familyData, ...updates },
      })),
      resetToDefaults: () => set({ familyData: structuredClone(FAMILY_DATA) }),
    }),
    {
      name: 'babygrowth_v4_profile',
      storage: createJSONStorage(() => indexedDbStorage),
    },
  ),
);

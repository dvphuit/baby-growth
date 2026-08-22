import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { indexedDbStorage } from '@/data/localDb';
import type { TabType } from '@/types';
import type { ProfileMode } from '@/features/profile';

interface UIStoreState {
  currentTab: TabType;
  currentSubView: string | null;
  searchQuery: string;
  profileMode: ProfileMode;
  setTab: (tab: TabType) => void;
  setCurrentSubView: (view: string | null) => void;
  setSearchQuery: (q: string) => void;
  setProfileMode: (mode: ProfileMode) => void;
  resetTrackingData: () => void;
}

export const useUIStore = create<UIStoreState>()(
  persist(
    (set) => ({
      currentTab: 'home',
      currentSubView: null,
      searchQuery: '',
      profileMode: 'baby',
      setTab: (tab) => set({ currentTab: tab, currentSubView: null }),
      setCurrentSubView: (view) => set({ currentSubView: view }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setProfileMode: (mode) => set({ profileMode: mode }),
      resetTrackingData: () => set({ currentTab: 'home', currentSubView: null, searchQuery: '', profileMode: 'baby' }),
    }),
    {
      name: 'babygrowth_v4_ui',
      storage: createJSONStorage(() => indexedDbStorage),
      partialize: (state) => ({
        currentTab: state.currentTab,
        profileMode: state.profileMode,
      }),
    }
  )
);

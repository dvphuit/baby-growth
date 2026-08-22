
import type { FamilyData } from '@/features/profile/domain/types';
import { useGrowthStore } from '@/features/growth/store/useGrowthStore';
import { useProfileStore } from './store/useProfileStore';

type InitialVitals = { weight?: number; height?: number; headCirc?: number };

export function initializeChildProfile(profile: Partial<FamilyData>, initialVitals?: InitialVitals): void {
  useProfileStore.getState().initializeChildProfile(profile);
  useGrowthStore.getState().initializeChildGrowth(profile, initialVitals);
}

export function resetChildStoresToDefaults(): void {
  useProfileStore.getState().resetToDefaults();
  useGrowthStore.getState().resetToDefaults();
}

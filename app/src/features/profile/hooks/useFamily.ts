/**
 * Hook for accessing family profile data reactively from the profile store.
 */
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import type { FamilyData } from '@/features/profile/domain/types';

export function useFamily(): FamilyData {
  return useProfileStore((state) => state.familyData);
}

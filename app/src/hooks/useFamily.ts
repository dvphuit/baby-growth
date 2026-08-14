/**
 * Hook for accessing family profile data reactively from useBabyStore.
 */
import { useBabyStore } from '@/store/useBabyStore';
import type { FamilyData } from '@/types';

export function useFamily(): FamilyData {
  return useBabyStore((state) => state.familyData);
}

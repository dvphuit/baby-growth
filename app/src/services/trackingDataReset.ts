import { waitForLocalRecordWrites } from './localDb';
import {
  overwriteDriveBackupWithLocalData,
  runWithAutoSyncPaused,
  SYNC_KEYS,
} from './googleDriveSync';
import { useActivityStore } from '@/store/useActivityStore';
import { useBabyStore } from '@/store/useBabyStore';
import { useChatStore } from '@/store/useChatStore';
import { useMomStore } from '@/store/useMomStore';
import { useReminderStore } from '@/store/useReminderStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useUIStore } from '@/store/useUIStore';

export type TrackingDataResetResult =
  | { status: 'synced' }
  | { status: 'local-only'; error: string };

export async function resetTrackingData(): Promise<TrackingDataResetResult> {
  return runWithAutoSyncPaused(async () => {
    useBabyStore.getState().resetTrackingData();
    useMomStore.getState().resetTrackingData();
    useActivityStore.getState().resetTrackingData();
    useTimelineStore.getState().resetTrackingData();
    useChatStore.getState().resetTrackingData();
    useReminderStore.getState().resetTrackingData();
    useUIStore.getState().resetTrackingData();

    await waitForLocalRecordWrites(SYNC_KEYS);

    try {
      await overwriteDriveBackupWithLocalData();
      return { status: 'synced' };
    } catch (error) {
      return {
        status: 'local-only',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });
}

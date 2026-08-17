import { waitForLocalRecordWrites } from './localDb';
import {
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

function waitForStoreHydration<T>(store: {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (listener: (state: T) => void) => () => void;
  };
}): Promise<void> {
  if (store.persist.hasHydrated()) return Promise.resolve();

  return new Promise((resolve) => {
    let settled = false;
    let unsubscribe = () => {};
    const finish = () => {
      if (settled) return;
      settled = true;
      unsubscribe();
      resolve();
    };
    unsubscribe = store.persist.onFinishHydration(finish);
    if (store.persist.hasHydrated()) finish();
  });
}

async function waitForTrackingStoresHydrated(): Promise<void> {
  await Promise.all([
    waitForStoreHydration(useBabyStore),
    waitForStoreHydration(useMomStore),
    waitForStoreHydration(useActivityStore),
    waitForStoreHydration(useTimelineStore),
    waitForStoreHydration(useChatStore),
    waitForStoreHydration(useReminderStore),
    waitForStoreHydration(useUIStore),
  ]);
}

export async function resetTrackingData(): Promise<TrackingDataResetResult> {
  return runWithAutoSyncPaused(async ({ overwriteDriveBackupWithLocalData }) => {
    await waitForTrackingStoresHydrated();
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

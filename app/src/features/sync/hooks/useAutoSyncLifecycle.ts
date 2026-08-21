import { useEffect } from 'react';
import { reloadPage } from '@/services/appRuntime';
import { scheduleIdleTask } from '@/shared/lib/idleTask';

const AUTO_SYNC_START_IDLE_TIMEOUT_MS = 3_000;
const AUTO_SYNC_START_FALLBACK_MS = 750;

export function useAutoSyncLifecycle(): void {
  useEffect(() => {
    let disposed = false;
    let stopAutoSync: (() => void) | undefined;

    const cancelStart = scheduleIdleTask(() => {
      void import('@/features/sync/googleDriveSync')
        .then(({ startAutoSync }) => startAutoSync())
        .then((stop) => {
          if (disposed) {
            stop();
          } else {
            stopAutoSync = stop;
          }
        })
        .catch(() => {});
    }, {
      timeoutMs: AUTO_SYNC_START_IDLE_TIMEOUT_MS,
      fallbackDelayMs: AUTO_SYNC_START_FALLBACK_MS,
    });

    const handleRemoteUpdate = () => reloadPage();
    window.addEventListener('babygrowth:remote-updated', handleRemoteUpdate);

    return () => {
      disposed = true;
      cancelStart();
      stopAutoSync?.();
      window.removeEventListener('babygrowth:remote-updated', handleRemoteUpdate);
    };
  }, []);
}

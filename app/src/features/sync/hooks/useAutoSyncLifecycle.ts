import { useEffect } from 'react';
import { reloadPage } from '@/services/appRuntime';

export function useAutoSyncLifecycle(): void {
  useEffect(() => {
    let disposed = false;
    let stopAutoSync: (() => void) | undefined;

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

    const handleRemoteUpdate = () => reloadPage();
    window.addEventListener('babygrowth:remote-updated', handleRemoteUpdate);

    return () => {
      disposed = true;
      stopAutoSync?.();
      window.removeEventListener('babygrowth:remote-updated', handleRemoteUpdate);
    };
  }, []);
}

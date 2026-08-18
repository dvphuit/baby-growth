import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { isMockDataEnabled, seedMockData } from './data/mockData';
import { removeLocalRecord } from './services/localDb';
import { SYNC_KEYS } from './services/googleDriveSync';
import { useBabyStore } from './store/useBabyStore';
import { useMomStore } from './store/useMomStore';
import { useTimelineStore } from './store/useTimelineStore';
import { useReminderStore } from './store/useReminderStore';
import { useChatStore } from './store/useChatStore';
import { useActivityStore } from './store/useActivityStore';

const STORE_KEYS = [...SYNC_KEYS, 'babygrowth_v2_sync_meta'];

/** Wipes all local data and reloads without the `reset` flag so the mock
 * bootstrap can re-seed from a clean state. Handy on devices without DevTools. */
async function handleResetRequest(): Promise<boolean> {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('reset')) return false;

  await Promise.all(STORE_KEYS.map((key) => removeLocalRecord(key)));
  window.localStorage.removeItem('babygrowth_v2_device_id');

  params.delete('reset');
  const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
  window.location.replace(next);
  return true;
}

let mockBootstrapRan = false;

async function bootstrapMockData(): Promise<void> {
  if (mockBootstrapRan || !isMockDataEnabled()) return;
  mockBootstrapRan = true;

  try {
    await Promise.all([
      useBabyStore.persist.rehydrate(),
      useMomStore.persist.rehydrate(),
      useTimelineStore.persist.rehydrate(),
      useReminderStore.persist.rehydrate(),
      useChatStore.persist.rehydrate(),
      useActivityStore.persist.rehydrate(),
    ]);

    const family = useBabyStore.getState().familyData;
    if (family?.isInitialized && family?.childName) return;

    seedMockData();
  } catch (error) {
    console.error('[mock] Không thể nạp dữ liệu mẫu:', error);
  }
}

void handleResetRequest().then((didReset) => {
  if (didReset) return;
  void bootstrapMockData().finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StrictMode>,
    );
  });
});

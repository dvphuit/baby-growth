import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LayoutGroup, MotionConfig } from 'motion/react';
import App from './app/App';
import { isMockDataEnabled, seedMockData } from './data/mockData';
import { SYNC_KEYS } from './features/sync';
import './index.css';
import { removeLocalRecord } from './services/localDb';
import { useActivityStore } from './store/useActivityStore';
import { useBabyStore } from './store/useBabyStore';
import { useExpenseStore } from './store/useExpenseStore';
import { useReminderStore } from './store/useReminderStore';
import { useTimelineStore } from './store/useTimelineStore';

const STORE_KEYS = [...SYNC_KEYS, 'babygrowth_v4_expenses', 'babygrowth_v4_sync_meta'];

/** Wipes the current local persistence generation and reloads without reset. */
async function handleResetRequest(): Promise<boolean> {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('reset')) return false;

  await Promise.all(STORE_KEYS.map((key) => removeLocalRecord(key)));
  window.localStorage.removeItem('babygrowth_v4_device_id');

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
      useTimelineStore.persist.rehydrate(),
      useReminderStore.persist.rehydrate(),
      useActivityStore.persist.rehydrate(),
      useExpenseStore.persist.rehydrate(),
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
    const root = document.getElementById('root');
    if (!root) throw new Error('Missing #root application element.');

    createRoot(root).render(
      <StrictMode>
        <BrowserRouter>
          <MotionConfig reducedMotion="user">
            <LayoutGroup id="haven-app">
              <App />
            </LayoutGroup>
          </MotionConfig>
        </BrowserRouter>
      </StrictMode>,
    );
  });
});

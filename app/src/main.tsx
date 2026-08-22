import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import './index.css';
import { useActivityStore } from '@/features/activities/store/useActivityStore';
import { useGrowthStore } from '@/features/growth/store/useGrowthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { useExpenseStore } from '@/features/expenses/store/useExpenseStore';
import { useReminderStore } from '@/features/reminders/store/useReminderStore';
import { useTimelineStore } from '@/features/timeline/store/useTimelineStore';

async function configureSnapshotRuntime(): Promise<void> {
  const [{ createAppSnapshotRuntime }, { configureAppSnapshotRuntime }] = await Promise.all([
    import('@/app/lifecycle/appSnapshotRuntime'),
    import('@/features/sync'),
  ]);
  configureAppSnapshotRuntime(createAppSnapshotRuntime());
}

async function handleResetRequest(): Promise<boolean> {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('reset')) return false;
  const resetModule = await import('@/app/lifecycle/resetRequest');
  return resetModule.handleResetRequest();
}

let mockBootstrapRan = false;

async function bootstrapMockData(): Promise<void> {
  if (mockBootstrapRan || !import.meta.env.DEV) return;

  const { isMockDataEnabled, seedMockData } = await import('./data/mockData');
  if (!isMockDataEnabled()) return;
  mockBootstrapRan = true;

  try {
    await Promise.all([
      useProfileStore.persist.rehydrate(),
      useGrowthStore.persist.rehydrate(),
      useTimelineStore.persist.rehydrate(),
      useReminderStore.persist.rehydrate(),
      useActivityStore.persist.rehydrate(),
      useExpenseStore.persist.rehydrate(),
    ]);

    const family = useProfileStore.getState().familyData;
    if (family?.isInitialized && family?.childName) return;

    seedMockData();
  } catch (error) {
    console.error('[mock] Không thể nạp dữ liệu mẫu:', error);
  }
}

async function startApp(): Promise<void> {
  await configureSnapshotRuntime();
  const didReset = await handleResetRequest();
  if (didReset) return;

  await bootstrapMockData();
  const root = document.getElementById('root');
  if (!root) throw new Error('Missing #root application element.');

  createRoot(root).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}

void startApp();

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import './index.css';

async function configureSnapshotRuntime(): Promise<void> {
  const [{ createAppSnapshotRuntime }, { configureAppSnapshotRuntime }] = await Promise.all([
    import('@/app/lifecycle/appSnapshotRuntime'),
    import('@/features/sync'),
  ]);
  configureAppSnapshotRuntime(createAppSnapshotRuntime());
}

function hasResetRequest(): boolean {
  return new URLSearchParams(window.location.search).has('reset');
}

async function handleResetRequest(): Promise<boolean> {
  const resetModule = await import('@/app/lifecycle/resetRequest');
  return resetModule.handleResetRequest();
}

function renderApp(): void {
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

async function reportSnapshotRuntimeFailure(error: unknown): Promise<void> {
  console.error('[startup] Không thể khởi tạo snapshot runtime:', error);
  try {
    const { failAppSnapshotRuntimeInitialization } = await import('@/features/sync');
    failAppSnapshotRuntimeInitialization(error);
  } catch {
    // The sync chunk itself may be the failed import. Keep the rendered app usable.
  }
}

async function startApp(): Promise<void> {
  if (hasResetRequest()) {
    const didReset = await handleResetRequest();
    if (didReset) return;
  }

  if (import.meta.env.DEV) {
    const { bootstrapMockData } = await import('./data/bootstrapMockData');
    await bootstrapMockData();
  }

  renderApp();

  const snapshotRuntimeReady = configureSnapshotRuntime();
  void snapshotRuntimeReady.catch(reportSnapshotRuntimeFailure);
}

void startApp();

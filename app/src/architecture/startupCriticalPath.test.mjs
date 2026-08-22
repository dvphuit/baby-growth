import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const source = (path) => readFileSync(join(ROOT, 'src', path), 'utf8');

describe('startup critical path', () => {
  it('renders production UI before loading the cross-domain snapshot runtime', () => {
    const main = source('main.tsx');
    const renderIndex = main.indexOf('renderApp();');
    const snapshotIndex = main.indexOf('const snapshotRuntimeReady = configureSnapshotRuntime();');

    expect(renderIndex).toBeGreaterThan(-1);
    expect(snapshotIndex).toBeGreaterThan(renderIndex);
    expect(main).not.toContain('await configureSnapshotRuntime()');
    expect(main).toContain('void snapshotRuntimeReady.catch(reportSnapshotRuntimeFailure);');
  });

  it('emits durable startup marks without changing the render-before-sync invariant', () => {
    const main = source('main.tsx');
    const renderMarkIndex = main.indexOf("markStartup('render-requested');");
    const snapshotStartIndex = main.indexOf("markStartup('snapshot-runtime-start');");

    expect(main).toContain("markStartup('entry-evaluated');");
    expect(main).toContain("markStartup('snapshot-runtime-ready');");
    expect(main).toContain("markStartup('snapshot-runtime-failed');");
    expect(renderMarkIndex).toBeGreaterThan(-1);
    expect(snapshotStartIndex).toBeGreaterThan(-1);
  });

  it('keeps development store hydration out of the production entry module', () => {
    const main = source('main.tsx');
    const bootstrap = source('data/bootstrapMockData.ts');
    const storeImports = [
      '@/features/activities/store/useActivityStore',
      '@/features/growth/store/useGrowthStore',
      '@/features/profile/store/useProfileStore',
      '@/features/expenses/store/useExpenseStore',
      '@/features/reminders/store/useReminderStore',
      '@/features/timeline/store/useTimelineStore',
    ];

    storeImports.forEach((specifier) => expect(main).not.toContain(specifier));
    expect(main).toContain('if (import.meta.env.DEV)');
    expect(main).toContain("await import('./data/bootstrapMockData')");
    expect(bootstrap).toContain('persist.rehydrate()');
  });

  it('keeps the snapshot public entry free of static Google Drive transport edges', () => {
    const main = source('main.tsx');
    const runtime = source('app/lifecycle/appSnapshotRuntime.ts');
    const syncIndex = source('features/sync/index.ts');

    expect(main).toContain("import('@/features/sync')");
    expect(main).not.toContain('googleDriveSync');
    expect(runtime).toContain("from '@/features/sync'");
    expect(runtime).not.toContain('googleDriveSync');
    expect(syncIndex).not.toContain("export * from './googleDriveSync'");
    expect(syncIndex).not.toContain("from './googleDriveSync'");
    expect(syncIndex).toContain("import('./googleDriveSync')");
  });

  it('keeps auto-sync behind both idle scheduling and snapshot runtime readiness', () => {
    const lifecycle = source('features/sync/hooks/useAutoSyncLifecycle.ts');

    expect(lifecycle).toContain('scheduleIdleTask');
    expect(lifecycle).toContain('waitForAppSnapshotRuntime()');
    expect(lifecycle.indexOf('waitForAppSnapshotRuntime()')).toBeLessThan(lifecycle.indexOf("import('../googleDriveSync')"));
  });
});

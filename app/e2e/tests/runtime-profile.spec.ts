import { expect, test, type CDPSession, type Page } from '@playwright/test';

declare global {
  interface Window {
    __kinlyLongTasks?: number[];
  }
}

type CdpMetrics = Record<string, number>;

interface StartupMarks {
  entryEvaluatedMs: number | null;
  renderRequestedMs: number | null;
  snapshotRuntimeStartMs: number | null;
  snapshotRuntimeReadyMs: number | null;
}

interface BrowserStartupProfile {
  navigation: {
    responseStartMs: number | null;
    domContentLoadedMs: number | null;
    loadEventEndMs: number | null;
    firstContentfulPaintMs: number | null;
    transferBytes: number | null;
    encodedBodyBytes: number | null;
  };
  startupMarks: StartupMarks;
  longTasks: {
    count: number;
    totalMs: number;
    maxMs: number;
  };
  resources: {
    count: number;
    transferBytes: number;
    scriptTransferBytes: number;
  };
}

interface RuntimeProfile extends BrowserStartupProfile {
  cpu: {
    taskMs: number | null;
    scriptMs: number | null;
    layoutMs: number | null;
    styleRecalcMs: number | null;
  };
  heap: {
    usedBytes: number | null;
    totalBytes: number | null;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function installLongTaskObserver(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__kinlyLongTasks = [];
    if (typeof PerformanceObserver !== 'function') return;

    try {
      const observer = new PerformanceObserver((list) => {
        const store = window.__kinlyLongTasks ?? (window.__kinlyLongTasks = []);
        list.getEntries().forEach((entry) => store.push(entry.duration));
      });
      observer.observe({ type: 'longtask', buffered: true });
    } catch {
      // Long Task API is optional. Other startup metrics remain useful without it.
    }
  });
}

async function readCdpMetrics(client: CDPSession): Promise<CdpMetrics> {
  const response: unknown = await client.send('Performance.getMetrics');
  if (!isRecord(response) || !Array.isArray(response.metrics)) return {};

  const result: CdpMetrics = {};
  for (const metric of response.metrics) {
    if (!isRecord(metric) || typeof metric.name !== 'string' || typeof metric.value !== 'number') continue;
    if (!Number.isFinite(metric.value)) continue;
    result[metric.name] = metric.value;
  }
  return result;
}

function metricDelta(before: CdpMetrics, after: CdpMetrics, name: string): number | null {
  if (!(name in before) || !(name in after)) return null;
  return Math.max(0, after[name] - before[name]);
}

async function waitForSnapshotRuntime(page: Page): Promise<void> {
  await page.waitForFunction(() => (
    performance.getEntriesByName('kinly:startup:snapshot-runtime-ready', 'mark').length > 0
  ));
}

async function readNavigationProfile(page: Page): Promise<BrowserStartupProfile> {
  return page.evaluate(() => {
    const markStartTime = (name: string): number | null => (
      performance.getEntriesByName(name, 'mark')[0]?.startTime ?? null
    );
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    const navigation = navigationEntry instanceof PerformanceNavigationTiming ? navigationEntry : undefined;
    const paints = performance.getEntriesByType('paint');
    const resources = performance.getEntriesByType('resource').filter(
      (entry): entry is PerformanceResourceTiming => entry instanceof PerformanceResourceTiming,
    );
    const longTasks = window.__kinlyLongTasks ?? [];
    const firstContentfulPaint = paints.find((entry) => entry.name === 'first-contentful-paint')?.startTime ?? null;

    return {
      navigation: {
        responseStartMs: navigation?.responseStart ?? null,
        domContentLoadedMs: navigation?.domContentLoadedEventEnd ?? null,
        loadEventEndMs: navigation?.loadEventEnd ?? null,
        firstContentfulPaintMs: firstContentfulPaint,
        transferBytes: navigation?.transferSize ?? null,
        encodedBodyBytes: navigation?.encodedBodySize ?? null,
      },
      startupMarks: {
        entryEvaluatedMs: markStartTime('kinly:startup:entry-evaluated'),
        renderRequestedMs: markStartTime('kinly:startup:render-requested'),
        snapshotRuntimeStartMs: markStartTime('kinly:startup:snapshot-runtime-start'),
        snapshotRuntimeReadyMs: markStartTime('kinly:startup:snapshot-runtime-ready'),
      },
      longTasks: {
        count: longTasks.length,
        totalMs: longTasks.reduce((sum, duration) => sum + duration, 0),
        maxMs: longTasks.length > 0 ? Math.max(...longTasks) : 0,
      },
      resources: {
        count: resources.length,
        transferBytes: resources.reduce((sum, entry) => sum + entry.transferSize, 0),
        scriptTransferBytes: resources
          .filter((entry) => entry.initiatorType === 'script')
          .reduce((sum, entry) => sum + entry.transferSize, 0),
      },
    };
  });
}

async function captureProfile(
  page: Page,
  beforeCdp: CdpMetrics,
  afterCdp: CdpMetrics,
): Promise<RuntimeProfile> {
  const browser = await readNavigationProfile(page);
  const taskDuration = metricDelta(beforeCdp, afterCdp, 'TaskDuration');
  const scriptDuration = metricDelta(beforeCdp, afterCdp, 'ScriptDuration');
  const layoutDuration = metricDelta(beforeCdp, afterCdp, 'LayoutDuration');
  const styleDuration = metricDelta(beforeCdp, afterCdp, 'RecalcStyleDuration');

  return {
    ...browser,
    cpu: {
      taskMs: taskDuration === null ? null : taskDuration * 1000,
      scriptMs: scriptDuration === null ? null : scriptDuration * 1000,
      layoutMs: layoutDuration === null ? null : layoutDuration * 1000,
      styleRecalcMs: styleDuration === null ? null : styleDuration * 1000,
    },
    heap: {
      usedBytes: afterCdp.JSHeapUsedSize ?? null,
      totalBytes: afterCdp.JSHeapTotalSize ?? null,
    },
  };
}

function expectStartupOrdering(profile: RuntimeProfile): void {
  const { renderRequestedMs, snapshotRuntimeStartMs, snapshotRuntimeReadyMs } = profile.startupMarks;
  if (renderRequestedMs === null || snapshotRuntimeStartMs === null || snapshotRuntimeReadyMs === null) {
    throw new Error(`Missing startup marks: ${JSON.stringify(profile.startupMarks)}`);
  }

  expect(renderRequestedMs).toBeLessThanOrEqual(snapshotRuntimeStartMs);
  expect(snapshotRuntimeStartMs).toBeLessThanOrEqual(snapshotRuntimeReadyMs);
}

test('profiles fresh and returning-user startup without hard runner timing thresholds', async ({ page }, testInfo) => {
  await installLongTaskObserver(page);
  const client = await page.context().newCDPSession(page);
  await client.send('Performance.enable');

  const beforeFresh = await readCdpMetrics(client);
  await page.goto('/');
  await expect(page.locator('#stepGoogleAuth')).toBeVisible();
  await waitForSnapshotRuntime(page);
  const afterFresh = await readCdpMetrics(client);
  const fresh = await captureProfile(page, beforeFresh, afterFresh);
  expectStartupOrdering(fresh);

  await page.locator('#btnDevBypass').click();
  await expect(page.locator('#stepProfileForm')).toBeVisible();
  await page.locator('#inputChildName').fill('Bé Performance');
  await page.locator('#btnCompleteOnboarding').evaluate((button) => {
    if (!(button instanceof HTMLButtonElement) || !button.form) {
      throw new Error('Onboarding submit button must belong to a form.');
    }
    button.form.requestSubmit(button);
  });
  await expect(page.locator('#appMainContent')).toBeVisible();

  const beforeReturning = await readCdpMetrics(client);
  await page.reload();
  await expect(page.locator('#appMainContent')).toBeVisible();
  await waitForSnapshotRuntime(page);
  const afterReturning = await readCdpMetrics(client);
  const returning = await captureProfile(page, beforeReturning, afterReturning);
  expectStartupOrdering(returning);

  const report = {
    chromium: testInfo.project.name,
    fresh,
    returning,
  };
  const json = JSON.stringify(report, null, 2);
  console.log(`[runtime-profile] ${JSON.stringify(report)}`);
  await testInfo.attach('runtime-profile.json', {
    body: json,
    contentType: 'application/json',
  });
});

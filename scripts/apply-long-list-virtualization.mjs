import { existsSync, readFileSync, writeFileSync } from 'node:fs';

function read(path) {
  return readFileSync(path, 'utf8');
}

function write(path, content) {
  writeFileSync(path, content, 'utf8');
}

function replaceOnce(path, before, after) {
  const content = read(path);
  if (content.includes(after)) return;
  const first = content.indexOf(before);
  if (first === -1) throw new Error(`Missing transform anchor in ${path}`);
  if (content.indexOf(before, first + before.length) !== -1) {
    throw new Error(`Ambiguous transform anchor in ${path}`);
  }
  write(path, content.replace(before, after));
}

function appendOnce(path, marker, block) {
  const content = read(path);
  if (content.includes(marker)) return;
  write(path, `${content.trimEnd()}\n\n${block.trim()}\n`);
}

const progressiveHook = `import { useCallback, useEffect, useRef, useState } from 'react';

interface UseProgressiveListOptions {
  totalCount: number;
  initialCount: number;
  batchSize: number;
  resetKey: string;
  rootMargin?: string;
}

export function useProgressiveList({
  totalCount,
  initialCount,
  batchSize,
  resetKey,
  rootMargin = '720px 0px',
}: UseProgressiveListOptions) {
  const safeInitialCount = Math.max(1, Math.floor(initialCount));
  const safeBatchSize = Math.max(1, Math.floor(batchSize));
  const [visibleCount, setVisibleCount] = useState(() => Math.min(totalCount, safeInitialCount));
  const sentinelRef = useRef<HTMLDivElement>(null);
  const autoLoadAvailable = typeof IntersectionObserver !== 'undefined';
  const hasMore = visibleCount < totalCount;

  const revealMore = useCallback(() => {
    setVisibleCount((current) => Math.min(totalCount, current + safeBatchSize));
  }, [safeBatchSize, totalCount]);

  useEffect(() => {
    setVisibleCount(Math.min(totalCount, safeInitialCount));
  }, [resetKey, safeInitialCount]);

  useEffect(() => {
    setVisibleCount((current) => Math.min(totalCount, Math.max(current, Math.min(totalCount, safeInitialCount))));
  }, [safeInitialCount, totalCount]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!autoLoadAvailable || !hasMore || !sentinel) return undefined;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) revealMore();
    }, { rootMargin, threshold: 0 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [autoLoadAvailable, hasMore, revealMore, rootMargin]);

  return {
    autoLoadAvailable,
    hasMore,
    revealMore,
    sentinelRef,
    visibleCount,
  };
}
`;

const progressiveHookTest = `import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useProgressiveList } from './useProgressiveList';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useProgressiveList', () => {
  it('reveals bounded batches and resets when the list scope changes', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { result, rerender } = renderHook(
      ({ totalCount, resetKey }) => useProgressiveList({
        totalCount,
        initialCount: 12,
        batchSize: 8,
        resetKey,
      }),
      { initialProps: { totalCount: 40, resetKey: 'first' } },
    );

    expect(result.current.visibleCount).toBe(12);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.autoLoadAvailable).toBe(false);

    act(() => result.current.revealMore());
    expect(result.current.visibleCount).toBe(20);

    rerender({ totalCount: 40, resetKey: 'second' });
    expect(result.current.visibleCount).toBe(12);

    rerender({ totalCount: 7, resetKey: 'second' });
    expect(result.current.visibleCount).toBe(7);
    expect(result.current.hasMore).toBe(false);
  });
});
`;

const progressiveBoundary = `import type { RefObject } from 'react';

interface ProgressiveListBoundaryProps {
  autoLoadAvailable: boolean;
  fallbackLabel: string;
  hasMore: boolean;
  onLoadMore: () => void;
  sentinelRef: RefObject<HTMLDivElement | null>;
}

export function ProgressiveListBoundary({
  autoLoadAvailable,
  fallbackLabel,
  hasMore,
  onLoadMore,
  sentinelRef,
}: ProgressiveListBoundaryProps) {
  if (!hasMore) return null;

  return (
    <div
      ref={sentinelRef}
      className="progressive-list-sentinel"
      aria-hidden={autoLoadAvailable ? true : undefined}
    >
      {!autoLoadAvailable && (
        <button type="button" className="progressive-list-fallback" onClick={onLoadMore}>
          {fallbackLabel}
        </button>
      )}
    </div>
  );
}
`;

if (!existsSync('app/src/shared/hooks/useProgressiveList.ts')) {
  write('app/src/shared/hooks/useProgressiveList.ts', progressiveHook);
}
if (!existsSync('app/src/shared/hooks/useProgressiveList.test.tsx')) {
  write('app/src/shared/hooks/useProgressiveList.test.tsx', progressiveHookTest);
}
if (!existsSync('app/src/shared/ui/ProgressiveListBoundary.tsx')) {
  write('app/src/shared/ui/ProgressiveListBoundary.tsx', progressiveBoundary);
}

replaceOnce(
  'app/src/features/timeline/TimelineView.tsx',
  "import { HavenCalendar, type HavenDateRange } from '@/shared/ui/HavenCalendar';",
  "import { HavenCalendar, type HavenDateRange } from '@/shared/ui/HavenCalendar';\nimport { ProgressiveListBoundary } from '@/shared/ui/ProgressiveListBoundary';\nimport { useProgressiveList } from '@/shared/hooks/useProgressiveList';",
);
replaceOnce(
  'app/src/features/timeline/TimelineView.tsx',
  "  }, [visibleEntries]);\n  const calendarBounds = useMemo(() => {",
  "  }, [visibleEntries]);\n  const timelineWindow = useProgressiveList({\n    totalCount: entryGroups.length,\n    initialCount: 7,\n    batchSize: 7,\n    resetKey: `${ownerFilter}:${selectedRange.start}:${selectedRange.end ?? ''}`,\n  });\n  const renderedEntryGroups = entryGroups.slice(0, timelineWindow.visibleCount);\n  const calendarBounds = useMemo(() => {",
);
replaceOnce(
  'app/src/features/timeline/TimelineView.tsx',
  ") : entryGroups.map((group) => (",
  ") : renderedEntryGroups.map((group) => (",
);
replaceOnce(
  'app/src/features/timeline/TimelineView.tsx',
  "          </section>\n        ))}\n      </section>\n\n      <TimelineEntryDialog",
  "          </section>\n        ))}\n        <ProgressiveListBoundary\n          autoLoadAvailable={timelineWindow.autoLoadAvailable}\n          fallbackLabel=\"Xem thêm nhật ký\"\n          hasMore={timelineWindow.hasMore}\n          onLoadMore={timelineWindow.revealMore}\n          sentinelRef={timelineWindow.sentinelRef}\n        />\n      </section>\n\n      <TimelineEntryDialog",
);

replaceOnce(
  'app/src/features/expenses/ExpensesView.tsx',
  "import React, { useMemo, useState } from 'react';",
  "import React, { useMemo, useState } from 'react';\nimport { useProgressiveList } from '@/shared/hooks/useProgressiveList';\nimport { ProgressiveListBoundary } from '@/shared/ui/ProgressiveListBoundary';",
);
replaceOnce(
  'app/src/features/expenses/ExpensesView.tsx',
  "  }, [displayedExpenses]);\n\n  const monthLabel = `Tháng ${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;",
  "  }, [displayedExpenses]);\n\n  const expenseWindow = useProgressiveList({\n    totalCount: timelineDateGroups.length,\n    initialCount: 10,\n    batchSize: 10,\n    resetKey: `${currentDate.getFullYear()}-${currentDate.getMonth()}-${selectedCategoryFilter ?? 'all'}`,\n  });\n  const renderedTimelineDateGroups = timelineDateGroups.slice(0, expenseWindow.visibleCount);\n\n  const monthLabel = `Tháng ${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;",
);
replaceOnce(
  'app/src/features/expenses/ExpensesView.tsx',
  "            {timelineDateGroups.map((group) => (",
  "            {renderedTimelineDateGroups.map((group) => (",
);
replaceOnce(
  'app/src/features/expenses/ExpensesView.tsx',
  "            ))}\n          </div>\n        )}\n      </section>",
  "            ))}\n            <ProgressiveListBoundary\n              autoLoadAvailable={expenseWindow.autoLoadAvailable}\n              fallbackLabel=\"Xem thêm khoản chi\"\n              hasMore={expenseWindow.hasMore}\n              onLoadMore={expenseWindow.revealMore}\n              sentinelRef={expenseWindow.sentinelRef}\n            />\n          </div>\n        )}\n      </section>",
);

replaceOnce(
  'app/src/features/growth/GrowthHistory.tsx',
  "import { HavenHeadCircIcon, HavenRulerIcon, HavenScaleIcon } from '@/shared/ui/HavenIcons';",
  "import { HavenHeadCircIcon, HavenRulerIcon, HavenScaleIcon } from '@/shared/ui/HavenIcons';\nimport { ProgressiveListBoundary } from '@/shared/ui/ProgressiveListBoundary';\nimport { useProgressiveList } from '@/shared/hooks/useProgressiveList';",
);
replaceOnce(
  'app/src/features/growth/GrowthHistory.tsx',
  "  const currentStageData = useGrowthStore((state) => state.currentStageData());\n  const deleteGrowthMeasurement = useGrowthStore((state) => state.deleteGrowthMeasurement);\n  const history = getRealGrowthHistory(currentStageData.growthHistory);",
  "  const currentStage = useGrowthStore((state) => state.currentStage);\n  const currentStageData = useGrowthStore((state) => state.currentStageData());\n  const deleteGrowthMeasurement = useGrowthStore((state) => state.deleteGrowthMeasurement);\n  const history = getRealGrowthHistory(currentStageData.growthHistory);\n  const growthWindow = useProgressiveList({\n    totalCount: history.length,\n    initialCount: 12,\n    batchSize: 12,\n    resetKey: currentStage,\n  });\n  const renderedHistory = history.slice(0, growthWindow.visibleCount);",
);
replaceOnce(
  'app/src/features/growth/GrowthHistory.tsx',
  "          {history.map((record) => (",
  "          {renderedHistory.map((record) => (",
);
replaceOnce(
  'app/src/features/growth/GrowthHistory.tsx',
  "          ))}\n        </div>\n      )}",
  "          ))}\n          <ProgressiveListBoundary\n            autoLoadAvailable={growthWindow.autoLoadAvailable}\n            fallbackLabel=\"Xem thêm số đo\"\n            hasMore={growthWindow.hasMore}\n            onLoadMore={growthWindow.revealMore}\n            sentinelRef={growthWindow.sentinelRef}\n          />\n        </div>\n      )}",
);

appendOnce(
  'app/src/shared/styles/shared.css',
  '.progressive-list-sentinel {',
  `.progressive-list-sentinel {
  display: flex;
  min-height: 1px;
  justify-content: center;
}

.progressive-list-fallback {
  border: 0;
  border-radius: 999px;
  background: var(--color-surface-soft, rgba(255, 255, 255, 0.72));
  color: var(--color-text-secondary);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  margin-top: 8px;
  padding: 9px 14px;
}
`,
);
appendOnce(
  'app/src/features/expenses/expenses.css',
  '.haven-timeline-day-group {\n  content-visibility: auto;',
  `.haven-timeline-day-group {
  content-visibility: auto;
  contain-intrinsic-size: auto 320px;
}
`,
);
appendOnce(
  'app/src/features/growth/growth-view.css',
  '.haven-growth-history-row {\n  content-visibility: auto;',
  `.haven-growth-history-row {
  content-visibility: auto;
  contain-intrinsic-size: auto 112px;
}
`,
);

replaceOnce(
  'app/src/architecture/performanceAudit.test.mjs',
  "  it('keeps mobile interaction feedback and scrolling on lightweight paths', () => {",
  `  it('progressively mounts long timeline, expense, and growth lists', () => {
    const timeline = source('features/timeline/TimelineView.tsx');
    const expenses = source('features/expenses/ExpensesView.tsx');
    const growthHistory = source('features/growth/GrowthHistory.tsx');
    const progressiveList = source('shared/hooks/useProgressiveList.ts');
    const expenseCss = source('features/expenses/expenses.css');
    const growthCss = source('features/growth/growth-view.css');

    expect(progressiveList).toContain('IntersectionObserver');
    expect(progressiveList).toContain("rootMargin = '720px 0px'");
    expect(timeline).toContain('initialCount: 7');
    expect(timeline).toContain('renderedEntryGroups');
    expect(expenses).toContain('initialCount: 10');
    expect(expenses).toContain('renderedTimelineDateGroups');
    expect(growthHistory).toContain('initialCount: 12');
    expect(growthHistory).toContain('renderedHistory');
    expect(expenseCss).toContain('.haven-timeline-day-group');
    expect(expenseCss).toContain('content-visibility: auto');
    expect(growthCss).toContain('.haven-growth-history-row');
    expect(growthCss).toContain('content-visibility: auto');
  });

  it('keeps mobile interaction feedback and scrolling on lightweight paths', () => {`,
);

console.log('Applied long-list virtualization changes.');

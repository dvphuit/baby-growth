import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const source = (path) => readFileSync(join(ROOT, 'src', path), 'utf8');
const appFile = (path) => readFileSync(join(ROOT, path), 'utf8');

describe('interaction performance audit', () => {
  it('keeps timeline pointer drag off the React state render path', () => {
    const timeline = source('features/timeline/TimelineView.tsx');
    expect(timeline).not.toContain('const [weekDragX, setWeekDragX]');
    expect(timeline).not.toContain('setWeekDragX(');
    expect(timeline).toContain('weekDragXRef');
    expect(timeline).toContain('weekTrackRef.current.style.transform');
  });

  it('defers Quick Log destination prefetch until the browser is idle', () => {
    const modals = source('app/AppModals.tsx');
    expect(modals).toContain('requestIdleCallback');
    expect(modals).toContain('scheduleQuickLogPrefetch');
    expect(modals).not.toContain('if (!modals.isQuickLogOpen) return;\n    void Promise.all([');
  });

  it('measures notebook layout only near the viewport', () => {
    const notebook = source('features/timeline/components/NotebookStory.tsx');
    expect(notebook).toContain('resizeObserver.observe(story)');
    expect(notebook).not.toContain("querySelectorAll<HTMLElement>('.journal-story-item').forEach");
    expect(notebook).toContain('requestAnimationFrame');
    expect(notebook).toContain('IntersectionObserver');
    expect(notebook).toContain("rootMargin: '600px 0px'");
  });

  it('virtualizes offscreen timeline day rendering and enforces entry bundle budgets', () => {
    const notebook = source('features/timeline/components/NotebookStory.tsx');
    const virtualTimeline = source('features/timeline/timeline-performance.css');
    const viteConfig = appFile('vite.config.ts');

    expect(notebook).toContain("import '../timeline-performance.css'");
    expect(virtualTimeline).toContain('content-visibility: auto');
    expect(virtualTimeline).toContain('contain-intrinsic-size: auto 360px');
    expect(viteConfig).toContain('ENTRY_CHUNK_BUDGET_BYTES = 500_000');
    expect(viteConfig).toContain('ENTRY_GZIP_BUDGET_BYTES = 165_000');
    expect(viteConfig).toContain('performanceBudgetPlugin()');
    expect(viteConfig).toContain('this.error(');
  });

  it('keeps optional sync, reset, mock, and onboarding code off the startup import graph', () => {
    const main = source('main.tsx');
    const app = source('app/App.tsx');
    const mediaUrl = source('features/timeline/hooks/useTimelineMediaUrl.ts');
    expect(main).not.toContain("from './data/mockData'");
    expect(main).not.toContain("from './features/sync'");
    expect(main).toContain("await import('./data/mockData')");
    expect(main).toContain("await import('@/app/lifecycle/resetRequest')");
    expect(app).not.toContain("import { OnboardingView } from '@/app/onboarding/OnboardingView'");
    expect(app).toContain("await import('@/app/onboarding/OnboardingView')");
    expect(mediaUrl).not.toContain("from '@/features/sync'");
    expect(mediaUrl).toContain("await import('@/features/sync/googleDriveSync')");
  });

  it('keeps persistent navigation and pull content free of permanent expensive compositing hints', () => {
    const header = source('shared/styles/header.css');
    const bottomNav = source('shared/styles/bottom-nav.css');
    const pullToRefresh = source('shared/ui/PullToRefresh.css');
    expect(header).not.toContain('backdrop-filter');
    expect(bottomNav).not.toContain('backdrop-filter');
    expect(pullToRefresh).not.toContain('will-change: transform');
  });

  it('keeps route and modal motion bounded on large surfaces', () => {
    const routes = source('app/AppRoutes.tsx');
    const bottomSheet = source('shared/ui/BottomSheet.tsx');
    const dialog = source('shared/ui/HavenDialog.tsx');

    expect(routes).not.toContain('AnimatePresence');
    expect(routes).not.toContain('exit="exit"');
    expect(routes).toContain("location.key !== 'default'");

    expect(bottomSheet).toContain('layoutId={surfaceLayoutId}');
    expect(bottomSheet).not.toMatch(/<motion\.div\s+layout\s+layoutId=\{surfaceLayoutId\}/);
    expect(dialog).toContain('layoutId={surfaceLayoutId}');
    expect(dialog).not.toMatch(/<motion\.div\s+layout\s+layoutId=\{surfaceLayoutId\}/);
    expect(dialog).toContain('duration: 0.16');
    expect(dialog).not.toContain('scale: 0.995');
  });

  it('keeps the baby timeline runtime behind an idle lazy boundary', () => {
    const homeView = source('features/home/components/HomeView.tsx');
    const babyHome = source('features/home/components/BabyHomeView.tsx');
    const idleTimeline = source('features/home/components/IdleHomeTimelinePreview.tsx');
    const lazyTimeline = source('features/home/components/LazyHomeTimelinePreview.tsx');
    const timelineContent = source('features/home/components/TimelinePreviewContent.tsx');
    const homeMoment = source('features/timeline/components/HomeMomentStoryItem.tsx');
    const lazyDialog = source('features/home/components/LazyTimelineEntryDialog.tsx');
    const lazyPreview = source('features/home/components/LazyMomentMediaPreview.tsx');

    expect(homeView).not.toContain("import { MomHomeView } from './MomHomeView'");
    expect(homeView).toContain("import('./MomHomeView')");
    expect(babyHome).toContain("from './IdleHomeTimelinePreview'");
    expect(babyHome).not.toContain("from '@/features/timeline/");
    expect(babyHome).not.toContain('useHomeTimeline');
    expect(babyHome).not.toContain('NotebookStory');
    expect(babyHome).not.toContain('LazyTimelineEntryDialog');
    expect(babyHome).not.toContain('LazyMomentMediaPreview');

    expect(idleTimeline).toContain('requestIdleCallback');
    expect(idleTimeline).toContain('<LazyHomeTimelinePreview');
    expect(lazyTimeline).toContain("import('./TimelinePreviewContent')");
    expect(timelineContent).toContain('useHomeTimeline');
    expect(timelineContent).toContain('NotebookStory');
    expect(timelineContent).toContain('LazyTimelineEntryDialog');
    expect(timelineContent).toContain('LazyMomentMediaPreview');

    expect(homeMoment).not.toContain("from './TimelineEntryDialog'");
    expect(homeMoment).toContain("from '@/features/timeline/components/TimelineMediaButton'");
    expect(lazyDialog).toContain("import('@/features/timeline/components/TimelineEntryDialog')");
    expect(lazyPreview).toContain("import('@/features/timeline/components/MomentMediaPreview')");
    expect(lazyDialog).toContain('DIALOG_EXIT_RETENTION_MS = 280');
    expect(lazyPreview).toContain('PREVIEW_EXIT_RETENTION_MS = 280');
  });

  it('keeps large public images out of precache and optimizes Home decor delivery', () => {
    const viteConfig = appFile('vite.config.ts');
    const serviceWorker = source('sw.ts');
    const babyHome = source('features/home/components/BabyHomeView.tsx');

    expect(viteConfig).not.toContain("'**/*.{js,css,html,svg,png,ico}'");
    expect(viteConfig).toContain("'pwa-*.png'");
    expect(serviceWorker).toContain("new CacheFirst({ cacheName: 'babygrowth-runtime-images' })");
    expect(babyHome).toContain('/assets/decor/care-milk.webp');
    expect(babyHome).toContain('/assets/decor/care-sleep.webp');
    expect(babyHome).not.toContain('/assets/decor/care-milk.png');
    expect((babyHome.match(/decoding="async"/g) ?? [])).toHaveLength(4);
  });

  it('progressively mounts long timeline, expense, and growth lists', () => {
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

  it('keeps mobile interaction feedback and scrolling on lightweight paths', () => {
    const app = source('app/App.tsx');
    const routes = source('app/AppRoutes.tsx');
    const routePreload = source('app/routePreload.ts');
    const modals = source('app/hooks/useAppModals.ts');
    const bottomNav = source('shared/ui/BottomNav.tsx');
    const bottomNavCss = source('shared/styles/bottom-nav.css');
    const pullToRefresh = source('shared/ui/PullToRefresh.tsx');
    const header = source('shared/ui/Header.tsx');
    const babyHome = source('features/home/components/BabyHomeView.tsx');
    const momHome = source('features/home/components/MomHomeView.tsx');
    const segmentClock = source('features/home/components/SegmentClock.tsx');
    const dayReference = source('shared/hooks/useLocalDayReference.ts');

    expect(pullToRefresh).toContain("root.addEventListener('touchmove', onTouchMove, { passive: true });");
    expect(pullToRefresh).not.toContain('event.preventDefault()');
    expect(pullToRefresh).not.toContain('passive: false');

    expect(bottomNav).not.toContain("from 'motion/react'");
    expect(bottomNav).not.toContain('layoutId=');
    expect(bottomNav).toContain('onPointerDown={handleRouteIntent}');
    expect(bottomNavCss).toContain('.nav-tab-item:active');
    expect(bottomNavCss).toContain('.fab-center-btn:active');

    expect(routePreload).toContain('export function preloadAppRoute');
    expect(routes).not.toContain('export function preloadAppRoute');
    expect(routes).toContain('memo(function AppRoutes');
    expect(app).toContain('onRouteIntent={preloadAppRoute}');
    expect(modals).toContain('useCallback');
    expect(header).toContain('useUIStore((state) => state.profileMode)');

    expect(babyHome).not.toContain("from '@/shared/hooks/useLiveNow'");
    expect(momHome).not.toContain("from '@/shared/hooks/useLiveNow'");
    expect(babyHome).toContain('<LiveSegmentClock />');
    expect(momHome).toContain('<LiveSegmentClock />');
    expect(segmentClock).toContain('LiveSegmentClock');
    expect(dayReference).toContain('scheduleMidnightCheck');
  });
  it('scopes Motion shared-layout projection to modal and media flows', () => {
    const main = source('main.tsx');
    const modals = source('app/AppModals.tsx');
    const timeline = source('features/timeline/TimelineView.tsx');
    const homeTimeline = source('features/home/components/TimelinePreviewContent.tsx');

    expect(main).not.toContain('LayoutGroup');
    expect(modals).toContain('<LayoutGroup id="quick-log-modals">');
    expect(timeline).toContain('<LayoutGroup id="timeline-media-page">');
    expect(homeTimeline).toContain('<LayoutGroup id="home-baby-timeline-media">');
    expect(homeTimeline).toContain('<LayoutGroup id="home-mom-timeline-media">');
  });

});

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const source = (path) => readFileSync(join(ROOT, 'src', path), 'utf8');

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

  it('observes the notebook container instead of every story item', () => {
    const notebook = source('features/timeline/components/NotebookStory.tsx');
    expect(notebook).toContain('resizeObserver?.observe(story)');
    expect(notebook).not.toContain("querySelectorAll<HTMLElement>('.journal-story-item').forEach");
    expect(notebook).toContain('requestAnimationFrame');
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

  it('keeps the full timeline editor and preview out of the Home runtime import path', () => {
    const babyHome = source('features/home/components/BabyHomeView.tsx');
    const momHome = source('features/home/components/MomHomeView.tsx');
    const homeTimeline = source('features/home/hooks/useHomeTimeline.ts');
    const homeMoment = source('features/timeline/components/HomeMomentStoryItem.tsx');
    const lazyDialog = source('features/home/components/LazyTimelineEntryDialog.tsx');
    const lazyPreview = source('features/home/components/LazyMomentMediaPreview.tsx');
    expect(babyHome).not.toContain("from '@/features/timeline'");
    expect(momHome).not.toContain("from '@/features/timeline'");
    expect(homeTimeline).not.toContain("from '@/features/timeline'");
    expect(homeMoment).not.toContain("from './TimelineEntryDialog'");
    expect(homeMoment).toContain("from '@/features/timeline/components/TimelineMediaButton'");
    expect(babyHome).toContain('LazyTimelineEntryDialog');
    expect(momHome).toContain('LazyTimelineEntryDialog');
    expect(babyHome).toContain('LazyMomentMediaPreview');
    expect(momHome).toContain('LazyMomentMediaPreview');
    expect(lazyDialog).toContain("import('@/features/timeline/components/TimelineEntryDialog')");
    expect(lazyPreview).toContain("import('@/features/timeline/components/MomentMediaPreview')");
    expect(lazyDialog).toContain('DIALOG_EXIT_RETENTION_MS = 280');
    expect(lazyPreview).toContain('PREVIEW_EXIT_RETENTION_MS = 280');
  });
});

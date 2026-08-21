import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const source = (path) => readFileSync(join(ROOT, 'src', path), 'utf8');

function expectInsideScope(text, scopeId, tokens) {
  const start = text.indexOf(`<LayoutGroup id="${scopeId}">`);
  const end = text.indexOf('</LayoutGroup>', start);

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  for (const token of tokens) {
    const position = text.indexOf(token, start);
    expect(position).toBeGreaterThan(start);
    expect(position).toBeLessThan(end);
  }

  return end;
}

describe('Motion shared-layout scope', () => {
  it('keeps the application root out of a global LayoutGroup', () => {
    expect(source('main.tsx')).not.toContain('LayoutGroup');
  });

  it('limits the shared Quick Log group to morphing modal destinations', () => {
    const modals = source('app/AppModals.tsx');
    const groupEnd = expectInsideScope(modals, 'quick-log-modals', [
      '<QuickLogModal',
      '<ActivityLogModal',
      '<AddGrowthModal',
      '<AddPumpingModal',
      '<AddExpenseModal',
      '<AddPostModal',
    ]);

    expect(modals.indexOf('<EditProfileModal', groupEnd)).toBeGreaterThan(groupEnd);
    expect(modals.indexOf('<NotificationModal', groupEnd)).toBeGreaterThan(groupEnd);
  });

  it('keeps Timeline media origins, detail dialog, and preview in one local group', () => {
    const timeline = source('features/timeline/TimelineView.tsx');
    expectInsideScope(timeline, 'timeline-media-page', [
      'layoutId={`moment-timeline-',
      '<TimelineEntryDialog',
      '<MomentMediaPreview',
    ]);
  });

  it('keeps Home media origins and portaled previews in owner-local groups', () => {
    const home = source('features/home/components/TimelinePreviewContent.tsx');

    expectInsideScope(home, 'home-baby-timeline-media', [
      '<HomeMomentStoryItem',
      '<LazyTimelineEntryDialog',
      '<LazyMomentMediaPreview',
    ]);
    expectInsideScope(home, 'home-mom-timeline-media', [
      '<HomeMomentStoryItem',
      '<LazyTimelineEntryDialog',
      '<LazyMomentMediaPreview',
    ]);
  });
});

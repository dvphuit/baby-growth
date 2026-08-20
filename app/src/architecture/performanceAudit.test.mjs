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
});

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const source = (path) => readFileSync(join(ROOT, 'src', path), 'utf8');

describe('growth and mom Home runtime performance', () => {
  it('keeps the mom timeline behind the shared idle boundary', () => {
    const momHome = source('features/home/components/MomHomeView.tsx');
    const timelineContent = source('features/home/components/TimelinePreviewContent.tsx');

    expect(momHome).toContain("from './IdleHomeTimelinePreview'");
    expect(momHome).toContain('<IdleHomeTimelinePreview owner="mom"');
    expect(momHome).not.toContain('NotebookStory');
    expect(momHome).not.toContain('useHomeTimeline');
    expect(momHome).not.toContain('LazyTimelineEntryDialog');
    expect(momHome).not.toContain('LazyMomentMediaPreview');
    expect(timelineContent).toContain('function MomTimelinePreview');
    expect(timelineContent).toContain("useHomeTimeline({ owner: 'mom'");
  });

  it('updates the existing WHO chart without animation or recreation', () => {
    const chart = source('features/growth/WHOChart.tsx');

    expect(chart.match(/new Chart</g) ?? []).toHaveLength(1);
    expect(chart).toContain('animation: false');
    expect(chart).toContain("chart.update('none')");
    expect(chart).toContain('chart.data.datasets = datasets');
    expect(chart).not.toContain('chartInstanceRef.current.destroy();');
  });
});

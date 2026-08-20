import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (path) => readFileSync(join(process.cwd(), 'src', path), 'utf8');

describe('home timeline performance boundary', () => {
  it('keeps timeline rendering outside dashboard startup path', () => {
    const home = source('features/home/components/BabyHomeView.tsx');

    expect(home).not.toContain("from '@/features/timeline/components/NotebookStory'");
    expect(home).not.toContain("from '@/features/timeline/components/HomeMomentStoryItem'");
    expect(home).not.toContain("from '../hooks/useHomeTimeline'");
  });
});

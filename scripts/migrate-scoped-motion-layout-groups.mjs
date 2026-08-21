import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();

function file(path) {
  return join(root, path);
}

function read(path) {
  return readFileSync(file(path), 'utf8');
}

function write(path, content) {
  writeFileSync(file(path), content);
}

function replaceOnce(path, before, after) {
  const source = read(path);
  if (source.includes(after)) return;
  const first = source.indexOf(before);
  if (first === -1 || source.indexOf(before, first + before.length) !== -1) {
    throw new Error(`Expected one migration target in ${path}`);
  }
  write(path, source.replace(before, after));
}

replaceOnce(
  'app/src/main.tsx',
  "import { LayoutGroup, MotionConfig } from 'motion/react';",
  "import { MotionConfig } from 'motion/react';",
);
replaceOnce(
  'app/src/main.tsx',
  '          <MotionConfig reducedMotion="user">\n            <LayoutGroup id="haven-app">\n              <App />\n            </LayoutGroup>\n          </MotionConfig>',
  '          <MotionConfig reducedMotion="user">\n            <App />\n          </MotionConfig>',
);

replaceOnce(
  'app/src/app/AppModals.tsx',
  "import { lazy, Suspense, useEffect, useState } from 'react';",
  "import { lazy, Suspense, useEffect, useState } from 'react';\nimport { LayoutGroup } from 'motion/react';",
);
replaceOnce(
  'app/src/app/AppModals.tsx',
  '    <Suspense fallback={<LazyModalFallback />}>\n      {quickLogMounted && (',
  '    <Suspense fallback={<LazyModalFallback />}>\n      <LayoutGroup id="quick-log-modals">\n      {quickLogMounted && (',
);
replaceOnce(
  'app/src/app/AppModals.tsx',
  '      {profileMounted && (',
  '      </LayoutGroup>\n      {profileMounted && (',
);

replaceOnce(
  'app/src/features/timeline/TimelineView.tsx',
  "import { useMemo, useRef, useState } from 'react';",
  "import { useMemo, useRef, useState } from 'react';\nimport { LayoutGroup } from 'motion/react';",
);
replaceOnce(
  'app/src/features/timeline/TimelineView.tsx',
  '      <section className="journal-feed" key={`${ownerFilter}-${selectedRange.start}-${selectedRange.end ?? \'open\'}`} aria-live="polite">',
  '      <LayoutGroup id="timeline-media-page">\n      <section className="journal-feed" key={`${ownerFilter}-${selectedRange.start}-${selectedRange.end ?? \'open\'}`} aria-live="polite">',
);
replaceOnce(
  'app/src/features/timeline/TimelineView.tsx',
  '      <MomentMediaPreview preview={momentPreview} onClose={() => setMomentPreview(null)} />\n    </main>',
  '      <MomentMediaPreview preview={momentPreview} onClose={() => setMomentPreview(null)} />\n      </LayoutGroup>\n    </main>',
);

replaceOnce(
  'app/src/features/home/components/TimelinePreviewContent.tsx',
  "import { useMemo } from 'react';",
  "import { useMemo } from 'react';\nimport { LayoutGroup } from 'motion/react';",
);
replaceOnce(
  'app/src/features/home/components/TimelinePreviewContent.tsx',
  'function BabyTimelinePreview({ onAddActivity }: { onAddActivity: () => void }) {\n',
  'function BabyTimelinePreview({ onAddActivity }: { onAddActivity: () => void }) {\n',
);
replaceOnce(
  'app/src/features/home/components/TimelinePreviewContent.tsx',
  '  return (\n    <>\n      <section className="haven-activity-surface" aria-labelledby="baby-recent-title">',
  '  return (\n    <LayoutGroup id="home-baby-timeline-media">\n      <section className="haven-activity-surface" aria-labelledby="baby-recent-title">',
);
replaceOnce(
  'app/src/features/home/components/TimelinePreviewContent.tsx',
  '      <LazyMomentMediaPreview preview={momentPreview} onClose={closeMomentPreview} />\n    </>\n  );\n}\n\nfunction MomTimelinePreview',
  '      <LazyMomentMediaPreview preview={momentPreview} onClose={closeMomentPreview} />\n    </LayoutGroup>\n  );\n}\n\nfunction MomTimelinePreview',
);
replaceOnce(
  'app/src/features/home/components/TimelinePreviewContent.tsx',
  '  return (\n    <>\n      <section className="haven-activity-surface haven-activity-surface-mom" aria-labelledby="mom-recent-title">',
  '  return (\n    <LayoutGroup id="home-mom-timeline-media">\n      <section className="haven-activity-surface haven-activity-surface-mom" aria-labelledby="mom-recent-title">',
);
replaceOnce(
  'app/src/features/home/components/TimelinePreviewContent.tsx',
  '      <LazyMomentMediaPreview preview={momentPreview} onClose={closeMomentPreview} />\n    </>\n  );\n}\n\nexport function TimelinePreviewContent',
  '      <LazyMomentMediaPreview preview={momentPreview} onClose={closeMomentPreview} />\n    </LayoutGroup>\n  );\n}\n\nexport function TimelinePreviewContent',
);

const auditPath = 'app/src/architecture/performanceAudit.test.mjs';
let audit = read(auditPath);
const auditMarker = "scopes Motion shared-layout projection to modal and media flows";
if (!audit.includes(auditMarker)) {
  const insertion = `\n  it('${auditMarker}', () => {\n    const main = source('main.tsx');\n    const modals = source('app/AppModals.tsx');\n    const timeline = source('features/timeline/TimelineView.tsx');\n    const homeTimeline = source('features/home/components/TimelinePreviewContent.tsx');\n\n    expect(main).not.toContain('LayoutGroup');\n    expect(modals).toContain('<LayoutGroup id="quick-log-modals">');\n    expect(timeline).toContain('<LayoutGroup id="timeline-media-page">');\n    expect(homeTimeline).toContain('<LayoutGroup id="home-baby-timeline-media">');\n    expect(homeTimeline).toContain('<LayoutGroup id="home-mom-timeline-media">');\n  });\n`;
  const end = audit.lastIndexOf('\n});');
  if (end === -1) throw new Error(`Could not find audit suite end in ${auditPath}`);
  audit = `${audit.slice(0, end)}${insertion}${audit.slice(end)}`;
  write(auditPath, audit);
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const sourceRoot = file('app/src');
const productionTsx = walk(sourceRoot).filter((path) => path.endsWith('.tsx') && !path.endsWith('.test.tsx'));
const layoutGroupFiles = productionTsx
  .filter((path) => readFileSync(path, 'utf8').includes('LayoutGroup'))
  .map((path) => relative(root, path).replaceAll('\\', '/'))
  .sort();
const expectedLayoutGroupFiles = [
  'app/src/app/AppModals.tsx',
  'app/src/features/home/components/TimelinePreviewContent.tsx',
  'app/src/features/timeline/TimelineView.tsx',
].sort();
if (JSON.stringify(layoutGroupFiles) !== JSON.stringify(expectedLayoutGroupFiles)) {
  throw new Error(`Unexpected LayoutGroup production scope: ${layoutGroupFiles.join(', ')}`);
}

const layoutIdFiles = productionTsx
  .filter((path) => readFileSync(path, 'utf8').includes('layoutId='))
  .map((path) => relative(root, path).replaceAll('\\', '/'))
  .sort();
const expectedLayoutIdFiles = [
  'app/src/features/timeline/components/MomentMediaPreview.tsx',
  'app/src/features/timeline/components/TimelineEntryDialog.tsx',
  'app/src/features/timeline/components/TimelineMediaButton.tsx',
  'app/src/shared/ui/BottomSheet.tsx',
  'app/src/shared/ui/HavenDialog.tsx',
].sort();
if (JSON.stringify(layoutIdFiles) !== JSON.stringify(expectedLayoutIdFiles)) {
  throw new Error(`Unexpected layoutId production owners: ${layoutIdFiles.join(', ')}`);
}

const main = read('app/src/main.tsx');
if (main.includes('LayoutGroup')) throw new Error('Root LayoutGroup must stay removed');

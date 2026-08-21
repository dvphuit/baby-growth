import { readFileSync, rmSync, writeFileSync } from 'node:fs';

function read(path) {
  return readFileSync(path, 'utf8');
}

function write(path, value) {
  writeFileSync(path, value.endsWith('\n') ? value : `${value}\n`);
}

function replaceOnce(path, before, after, label = before) {
  const input = read(path);
  if (!input.includes(before)) throw new Error(`${path}: missing ${label}`);
  write(path, input.replace(before, after));
}

function transform(path, callback) {
  write(path, callback(read(path)));
}

transform('app/src/main.tsx', (input) => {
  let next = input.replace("import { MotionConfig } from 'motion/react';\n", '');
  const before = `        <BrowserRouter>\n          <MotionConfig reducedMotion="user">\n            <App />\n          </MotionConfig>\n        </BrowserRouter>`;
  const after = `        <BrowserRouter>\n          <App />\n        </BrowserRouter>`;
  if (!next.includes(before)) throw new Error('main.tsx: missing MotionConfig wrapper');
  return next.replace(before, after);
});

transform('app/src/app/AppModals.tsx', (input) => {
  let next = input
    .replace(/^import \{ LayoutGroup \} from 'motion\/react';\n/m, '')
    .replace(/^import \{ ModalMotionScope \} from '@\/shared\/motion\/ModalMotionScope';\n/m, '')
    .replace(/^const QUICK_LOG_SURFACE_ID[^\n]*\n/m, '')
    .replace(/^\s*<LayoutGroup id="quick-log-modals">\s*\n/m, '')
    .replace(/^\s*<\/LayoutGroup>\s*\n/m, '');

  const openCount = (next.match(/<ModalMotionScope layoutId=\{QUICK_LOG_SURFACE_ID\}>/g) ?? []).length;
  const closeCount = (next.match(/<\/ModalMotionScope>/g) ?? []).length;
  if (openCount === 0 || openCount !== closeCount) throw new Error(`AppModals.tsx: unexpected Motion scope count ${openCount}/${closeCount}`);
  next = next
    .replace(/^\s*<ModalMotionScope layoutId=\{QUICK_LOG_SURFACE_ID\}>\s*\n/gm, '')
    .replace(/^\s*<\/ModalMotionScope>\s*\n/gm, '');
  return next;
});

transform('app/src/features/home/components/TimelinePreviewContent.tsx', (input) => {
  let next = input.replace("import { LayoutGroup } from 'motion/react';\n", '');
  const opens = (next.match(/<LayoutGroup id="home-(?:baby|mom)-timeline-media">/g) ?? []).length;
  const closes = (next.match(/<\/LayoutGroup>/g) ?? []).length;
  if (opens !== 2 || closes !== 2) throw new Error(`TimelinePreviewContent.tsx: unexpected LayoutGroup count ${opens}/${closes}`);
  next = next
    .replace('<LayoutGroup id="home-baby-timeline-media">', '<>')
    .replace('<LayoutGroup id="home-mom-timeline-media">', '<>')
    .replace(/<\/LayoutGroup>/g, '</>');
  return next;
});

transform('app/src/features/timeline/TimelineView.tsx', (input) => {
  let next = input.replace("import { LayoutGroup } from 'motion/react';\n", '');
  if (!next.includes('<LayoutGroup id="timeline-media-page">') || !next.includes('</LayoutGroup>')) {
    throw new Error('TimelineView.tsx: missing timeline LayoutGroup');
  }
  return next
    .replace(/^\s*<LayoutGroup id="timeline-media-page">\s*\n/m, '')
    .replace(/^\s*<\/LayoutGroup>\s*\n/m, '');
});

transform('app/src/features/timeline/components/TimelineEntryDialog.tsx', (input) => {
  let next = input
    .replace("import { motion } from 'motion/react';\n", '')
    .replace("import { havenLayoutTransition } from '@/shared/motion/motionPresets';\n", '');
  const videoCount = (next.match(/<motion\.video/g) ?? []).length;
  const imageCount = (next.match(/<motion\.img/g) ?? []).length;
  if (videoCount !== 1 || imageCount !== 1) throw new Error(`TimelineEntryDialog.tsx: unexpected media motion count ${videoCount}/${imageCount}`);
  next = next
    .replace('<motion.video', '<video')
    .replace('<motion.img', '<img')
    .replace(/^\s*layoutId=\{layoutId\}\s*\n/gm, '')
    .replace(/^\s*transition=\{havenLayoutTransition\}\s*\n/gm, '');
  return next;
});

replaceOnce(
  'app/src/index.css',
  "@import './shared/motion/animations.css';",
  "@import './shared/styles/native-animations.css';",
  'Motion animation stylesheet import',
);

transform('app/src/shared/styles/bottom-sheet.css', (input) => input
  .replace('MOTION-POWERED BOTTOM SHEET & GESTURES', 'NATIVE BOTTOM SHEET & GESTURES')
  .replace('  will-change: transform;\n', ''));

transform('app/package.json', (input) => {
  const packageJson = JSON.parse(input);
  if (!packageJson.dependencies?.motion) throw new Error('package.json: Motion dependency already missing');
  delete packageJson.dependencies.motion;
  return `${JSON.stringify(packageJson, null, 2)}\n`;
});

transform('app/src/architecture/performanceAudit.test.mjs', (input) => {
  const first = /  it\('uses native route transitions while keeping modal Motion bounded', \(\) => \{[\s\S]*?\n  \}\);\n\n(?=  it\('keeps the baby timeline runtime behind an idle lazy boundary')/;
  if (!first.test(input)) throw new Error('performanceAudit: missing route/modal Motion contract');
  let next = input.replace(first, `  it('uses browser-native animation paths for routes, overlays, and gestures', () => {\n    const routes = source('app/AppRoutes.tsx');\n    const bottomNav = source('shared/ui/BottomNav.tsx');\n    const header = source('shared/ui/Header.tsx');\n    const nativeTransitions = source('shared/styles/native-transitions.css');\n    const nativeAnimations = source('shared/styles/native-animations.css');\n    const bottomSheet = source('shared/ui/BottomSheet.tsx');\n    const dialog = source('shared/ui/HavenDialog.tsx');\n    const mediaPreview = source('features/timeline/components/MomentMediaPreview.tsx');\n\n    expect(routes).not.toContain("from 'motion/react'");\n    expect(routes).toContain('className="app-route-surface"');\n    expect((bottomNav.match(/viewTransition/g) ?? [])).toHaveLength(2);\n    expect(header).toContain("navigate('/profile', { viewTransition: true })");\n    expect(nativeTransitions).toContain('::view-transition-old(root)');\n    expect(nativeTransitions).toContain('::view-transition-new(root)');\n    expect(nativeAnimations).toContain('@media (prefers-reduced-motion: reduce)');\n    expect(bottomSheet).toContain('onPointerMove={handlePointerMove}');\n    expect(bottomSheet).toContain('animateElement(');\n    expect(dialog).toContain('useNativePresence');\n    expect(mediaPreview).toContain('onPointerMove={handlePointerMove}');\n    expect(mediaPreview).toContain('translate3d');\n  });\n\n`);

  const second = /  it\('scopes Motion shared-layout projection to modal and media flows', \(\) => \{[\s\S]*?\n  \}\);\n\n(?=\}\);)/;
  if (!second.test(next)) throw new Error('performanceAudit: missing shared-layout Motion contract');
  next = next.replace(second, `  it('keeps native animation ownership out of the React projection runtime', () => {\n    const main = source('main.tsx');\n    const modals = source('app/AppModals.tsx');\n    const timeline = source('features/timeline/TimelineView.tsx');\n    const homeTimeline = source('features/home/components/TimelinePreviewContent.tsx');\n    const nativeAnimation = source('shared/lib/nativeAnimation.ts');\n\n    expect(main).not.toContain('MotionConfig');\n    expect(modals).not.toContain('LayoutGroup');\n    expect(timeline).not.toContain('LayoutGroup');\n    expect(homeTimeline).not.toContain('LayoutGroup');\n    expect(nativeAnimation).toContain('element.animate');\n    expect(nativeAnimation).toContain('prefersReducedMotion');\n  });\n\n`);
  return next;
});

transform('ARCHITECTURE.md', (input) => {
  let next = input.replace(/^\s+motion\/\s*\n/m, '');
  const section = /## Motion and CSS[\s\S]*?(?=\n## )/;
  if (!section.test(next)) throw new Error('ARCHITECTURE.md: missing Motion section');
  next = next.replace(section, `## Native animation ownership\n\nBrowser-native primitives own runtime animation behavior. CSS transitions and keyframes handle declarative enter/exit and press feedback. The View Transition API handles route-level document transitions. Pointer Events write drag transforms directly to the DOM, and the Web Animations API handles imperative settle/dismiss animation.\n\nReact state must not update on every gesture frame. Keep layout, typography, spacing, colors, borders, and static visual state in CSS. All native animation paths must respect \`prefers-reduced-motion\`.\n`);
  return next;
});

transform('DESIGN.md', (input) => {
  const section = /## Motion[\s\S]*?(?=\n## )/;
  if (!section.test(input)) throw new Error('DESIGN.md: missing Motion section');
  return input.replace(section, `## Native animation\n\nUse browser-native animation primitives. Prefer CSS transitions/keyframes for simple enter, exit, opacity, transform, hover, and press feedback. Use the View Transition API for route-level transitions, Pointer Events for direct manipulation, and the Web Animations API for gesture settle/dismiss sequences.\n\nKeep per-frame gesture values out of React state and avoid animating layout-heavy properties, filters, or permanent compositing hints. Every animation must respect \`prefers-reduced-motion\`.\n`);
});

rmSync('app/src/shared/motion', { recursive: true, force: true });
rmSync('app/src/architecture/motionLayoutScope.test.mjs', { force: true });

console.log('Native animation migration applied.');

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walk(path);
    return entry.isFile() ? [path] : [];
  });
}

function move(fromRelative, toRelative) {
  const from = join(ROOT, fromRelative);
  const to = join(ROOT, toRelative);
  if (!existsSync(from)) throw new Error(`Expected source is missing: ${fromRelative}`);
  if (existsSync(to)) throw new Error(`Refusing to overwrite existing target: ${toRelative}`);
  mkdirSync(dirname(to), { recursive: true });
  renameSync(from, to);
}

function sourceCodeFiles() {
  return walk(SRC).filter((file) => ['.ts', '.tsx', '.js', '.jsx', '.mjs'].includes(extname(file)));
}

const legacyTimelineRoot = join(SRC, 'components', 'timeline');
const featureTimelineRoot = join(SRC, 'features', 'timeline');
const externalTimelineModules = new Set();
for (const file of sourceCodeFiles()) {
  if (file.startsWith(legacyTimelineRoot) || file.startsWith(featureTimelineRoot)) continue;
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(/@\/components\/timeline\/([^'"\s]+)/g)) {
    externalTimelineModules.add(match[1]);
  }
}

move('src/components/common', 'src/shared/ui');
move('src/components/motion', 'src/shared/motion');
move('src/components/timeline', 'src/features/timeline/components');
move('src/components/onboarding', 'src/app/onboarding');

move('src/styles/tokens.css', 'src/shared/styles/tokens.css');
move('src/styles/base.css', 'src/shared/styles/base.css');
move('src/styles/shared.css', 'src/shared/styles/shared.css');
move('src/styles/header.css', 'src/shared/styles/header.css');
move('src/styles/bottom-nav.css', 'src/shared/styles/bottom-nav.css');
move('src/styles/bottom-sheet.css', 'src/shared/styles/bottom-sheet.css');
move('src/styles/modals.css', 'src/shared/styles/modals.css');
move('src/styles/refactor-primitives.css', 'src/shared/styles/tracker-primitives.css');
move('src/styles/haven-primitives.css', 'src/shared/styles/primitives.css');
move('src/styles/animations.css', 'src/shared/motion/animations.css');
move('src/styles/haven-onboarding.css', 'src/app/onboarding/onboarding.css');
move('src/styles/refactorStyles.test.mjs', 'src/architecture/refactorStyles.test.mjs');

const legacyComponentsEntry = join(SRC, 'styles', 'components.css');
if (!existsSync(legacyComponentsEntry)) throw new Error('Expected src/styles/components.css before ownership move.');
rmSync(legacyComponentsEntry);
rmSync(join(SRC, 'styles'), { recursive: true });

writeFileSync(join(SRC, 'index.css'), [
  "@import './shared/styles/tokens.css';",
  "@import './shared/styles/base.css';",
  "@import './shared/styles/shared.css';",
  "@import './shared/styles/header.css';",
  "@import './shared/styles/bottom-nav.css';",
  "@import './shared/styles/bottom-sheet.css';",
  "@import './shared/styles/modals.css';",
  "@import './features/profile/profile.css';",
  "@import './shared/styles/tracker-primitives.css';",
  "@import './features/home/home.css';",
  "@import './features/expenses/expenses.css';",
  "@import './features/growth/growth-view.css';",
  "@import './app/onboarding/onboarding.css';",
  "@import './shared/styles/primitives.css';",
  "@import './features/timeline/timeline.css';",
  "@import './shared/motion/animations.css';",
  '',
].join('\n'));

for (const file of sourceCodeFiles()) {
  let source = readFileSync(file, 'utf8');
  const original = source;
  source = source
    .replaceAll('@/components/common/', '@/shared/ui/')
    .replaceAll('@/components/motion/', '@/shared/motion/')
    .replaceAll('@/components/onboarding/', '@/app/onboarding/')
    .replace(/\.\.\/common\/([^'"\s]+)/g, (_match, modulePath) => `@/shared/ui/${modulePath}`)
    .replace(/\.\.\/motion\/([^'"\s]+)/g, (_match, modulePath) => `@/shared/motion/${modulePath}`);

  const timelineOwned = file.startsWith(join(SRC, 'features', 'timeline'));
  source = source.replace(/@\/components\/timeline\/([^'"\s]+)/g, (_match, modulePath) => (
    timelineOwned ? `@/features/timeline/components/${modulePath}` : '@/features/timeline'
  ));

  if (source !== original) writeFileSync(file, source);
}

const timelineIndexPath = join(SRC, 'features', 'timeline', 'index.ts');
let timelineIndex = readFileSync(timelineIndexPath, 'utf8').trimEnd();
for (const modulePath of [...externalTimelineModules].sort()) {
  const exportLine = `export * from './components/${modulePath}';`;
  if (!timelineIndex.includes(exportLine)) timelineIndex += `\n${exportLine}`;
}
writeFileSync(timelineIndexPath, `${timelineIndex}\n`);

const refactorStyleTestPath = join(SRC, 'architecture', 'refactorStyles.test.mjs');
let refactorStyleTest = readFileSync(refactorStyleTestPath, 'utf8');
refactorStyleTest = refactorStyleTest.replace(
  "readFileSync('src/styles/refactor-primitives.css', 'utf8')",
  "readFileSync('src/shared/styles/tracker-primitives.css', 'utf8')",
);
writeFileSync(refactorStyleTestPath, refactorStyleTest);

const cssAuditPath = join(SRC, 'architecture', 'cssArchitectureAudit.test.mjs');
let cssAudit = readFileSync(cssAuditPath, 'utf8');
cssAudit = cssAudit
  .replace("const STYLES = join(SRC, 'styles');", "const STYLE_ENTRY = join(SRC, 'index.css');")
  .replace("const entry = readFileSync(join(STYLES, 'components.css'), 'utf8');", "const entry = readFileSync(STYLE_ENTRY, 'utf8');")
  .replace('return join(STYLES, importPath);', 'return join(SRC, importPath);');

const ownershipStart = cssAudit.indexOf("  it('keeps feature-owned styles with their features instead of global styles', () => {");
const ownershipEnd = cssAudit.indexOf("  it('reports ownership overlap without changing runtime behavior', () => {");
if (ownershipStart < 0 || ownershipEnd < 0) throw new Error('Could not locate CSS ownership test block.');
const ownershipTest = `  it('keeps feature and shared styles in explicit ownership folders', () => {\n    expect(existsSync(join(SRC, 'styles'))).toBe(false);\n\n    for (const featureFile of [\n      join(SRC, 'features', 'home', 'home.css'),\n      join(SRC, 'features', 'expenses', 'expenses.css'),\n      join(SRC, 'features', 'growth', 'growth.css'),\n      join(SRC, 'features', 'growth', 'growth-view.css'),\n      join(SRC, 'features', 'timeline', 'timeline.css'),\n      join(SRC, 'features', 'profile', 'profile.css'),\n      join(SRC, 'app', 'onboarding', 'onboarding.css'),\n    ]) {\n      expect(existsSync(featureFile), \`${'${relative(ROOT, featureFile)}'} should exist\`).toBe(true);\n    }\n\n    for (const sharedFile of [\n      join(SRC, 'shared', 'styles', 'tokens.css'),\n      join(SRC, 'shared', 'styles', 'base.css'),\n      join(SRC, 'shared', 'styles', 'shared.css'),\n      join(SRC, 'shared', 'styles', 'header.css'),\n      join(SRC, 'shared', 'styles', 'bottom-nav.css'),\n      join(SRC, 'shared', 'styles', 'bottom-sheet.css'),\n      join(SRC, 'shared', 'styles', 'modals.css'),\n      join(SRC, 'shared', 'styles', 'tracker-primitives.css'),\n      join(SRC, 'shared', 'styles', 'primitives.css'),\n      join(SRC, 'shared', 'motion', 'animations.css'),\n    ]) {\n      expect(existsSync(sharedFile), \`${'${relative(ROOT, sharedFile)}'} should exist\`).toBe(true);\n    }\n  });\n\n`;
cssAudit = `${cssAudit.slice(0, ownershipStart)}${ownershipTest}${cssAudit.slice(ownershipEnd)}`;
writeFileSync(cssAuditPath, cssAudit);

const forbiddenLegacyPaths = [
  '@/components/common/',
  '@/components/motion/',
  '@/components/timeline/',
  '@/components/onboarding/',
  '../common/',
  '../motion/',
];
const unresolved = [];
for (const file of sourceCodeFiles()) {
  const source = readFileSync(file, 'utf8');
  for (const token of forbiddenLegacyPaths) {
    if (source.includes(token)) unresolved.push(`${relative(ROOT, file)}: ${token}`);
  }
}
if (unresolved.length > 0) throw new Error(`Legacy component imports remain:\n${unresolved.join('\n')}`);

for (const legacyDirectory of [
  join(SRC, 'components', 'common'),
  join(SRC, 'components', 'motion'),
  join(SRC, 'components', 'timeline'),
  join(SRC, 'components', 'onboarding'),
  join(SRC, 'styles'),
]) {
  if (existsSync(legacyDirectory)) throw new Error(`Legacy ownership directory still exists: ${relative(ROOT, legacyDirectory)}`);
}

console.info('Moved component and stylesheet ownership successfully.');
console.info('Timeline public modules:', [...externalTimelineModules].sort());

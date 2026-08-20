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

function sourceCodeFiles() {
  return walk(SRC).filter((file) => ['.ts', '.tsx', '.js', '.jsx', '.mjs'].includes(extname(file)));
}

function move(fromRelative, toRelative) {
  const from = join(ROOT, fromRelative);
  const to = join(ROOT, toRelative);
  if (!existsSync(from)) throw new Error(`Expected source is missing: ${fromRelative}`);
  if (existsSync(to)) throw new Error(`Refusing to overwrite existing target: ${toRelative}`);
  mkdirSync(dirname(to), { recursive: true });
  renameSync(from, to);
}

function removeEmptyDirectory(relativePath) {
  const absolutePath = join(ROOT, relativePath);
  if (!existsSync(absolutePath)) return;
  const entries = readdirSync(absolutePath);
  if (entries.length > 0) {
    throw new Error(`Refusing to remove non-empty legacy directory ${relativePath}: ${entries.join(', ')}`);
  }
  rmSync(absolutePath, { recursive: true });
}

const moves = [
  ['src/domain/activityAssessments.ts', 'src/features/activities/domain/activityAssessments.ts'],
  ['src/domain/activityAssessments.test.ts', 'src/features/activities/domain/activityAssessments.test.ts'],
  ['src/domain/activitySelectors.ts', 'src/features/activities/domain/activitySelectors.ts'],
  ['src/domain/activitySelectors.test.ts', 'src/features/activities/domain/activitySelectors.test.ts'],
  ['src/domain/dailyCareTargets.ts', 'src/features/activities/domain/dailyCareTargets.ts'],
  ['src/domain/dailyCareTargets.test.ts', 'src/features/activities/domain/dailyCareTargets.test.ts'],
  ['src/domain/medicationCatalog.ts', 'src/features/activities/domain/medicationCatalog.ts'],
  ['src/domain/growthSelectors.ts', 'src/features/growth/domain/growthSelectors.ts'],
  ['src/domain/reminderScheduler.ts', 'src/features/reminders/domain/reminderScheduler.ts'],
  ['src/domain/reminderScheduler.test.ts', 'src/features/reminders/domain/reminderScheduler.test.ts'],
  ['src/domain/timelineMedia.ts', 'src/features/timeline/domain/timelineMedia.ts'],
  ['src/domain/timelineSelectors.ts', 'src/features/timeline/domain/timelineSelectors.ts'],
  ['src/domain/timelineSelectors.test.ts', 'src/features/timeline/domain/timelineSelectors.test.ts'],

  ['src/store/useActivityStore.ts', 'src/features/activities/store/useActivityStore.ts'],
  ['src/store/useActivityStore.test.ts', 'src/features/activities/store/useActivityStore.test.ts'],
  ['src/store/useExpenseStore.ts', 'src/features/expenses/store/useExpenseStore.ts'],
  ['src/store/useReminderStore.ts', 'src/features/reminders/store/useReminderStore.ts'],
  ['src/store/useTimelineStore.ts', 'src/features/timeline/store/useTimelineStore.ts'],

  ['src/hooks/useAppModals.ts', 'src/app/hooks/useAppModals.ts'],
  ['src/hooks/useAppModals.test.tsx', 'src/app/hooks/useAppModals.test.tsx'],
  ['src/hooks/useThemeColor.ts', 'src/app/hooks/useThemeColor.ts'],
  ['src/hooks/useThemeColor.test.ts', 'src/app/hooks/useThemeColor.test.ts'],
  ['src/hooks/useAutoSyncLifecycle.ts', 'src/features/sync/hooks/useAutoSyncLifecycle.ts'],
  ['src/hooks/useAutoSyncLifecycle.test.tsx', 'src/features/sync/hooks/useAutoSyncLifecycle.test.tsx'],
  ['src/hooks/useCalendar.ts', 'src/features/timeline/hooks/useCalendar.ts'],
  ['src/hooks/useFamily.ts', 'src/features/profile/hooks/useFamily.ts'],
  ['src/hooks/useReminderLifecycle.ts', 'src/features/reminders/hooks/useReminderLifecycle.ts'],
  ['src/hooks/useTimelineMediaUrl.ts', 'src/features/timeline/hooks/useTimelineMediaUrl.ts'],
  ['src/hooks/useToast.ts', 'src/shared/hooks/useToast.ts'],

  ['src/services/localDb.ts', 'src/data/localDb.ts'],
  ['src/services/localDb.test.ts', 'src/data/localDb.test.ts'],
  ['src/services/diagnosticLog.ts', 'src/app/diagnostics/diagnosticLog.ts'],
  ['src/services/diagnosticLog.test.ts', 'src/app/diagnostics/diagnosticLog.test.ts'],
  ['src/services/trackingDataReset.ts', 'src/app/lifecycle/trackingDataReset.ts'],
  ['src/services/trackingDataReset.test.ts', 'src/app/lifecycle/trackingDataReset.test.ts'],
  ['src/services/notificationService.ts', 'src/features/reminders/services/notificationService.ts'],
  ['src/services/timelineMediaDriveSync.ts', 'src/features/sync/timelineMediaDriveSync.ts'],
  ['src/services/timelineMediaDriveSync.test.ts', 'src/features/sync/timelineMediaDriveSync.test.ts'],
  ['src/services/timelineMediaSyncProgress.ts', 'src/features/sync/timelineMediaSyncProgress.ts'],
  ['src/services/googleDriveSync.test.ts', 'src/features/sync/googleDriveSync.test.ts'],
];

for (const [from, to] of moves) move(from, to);

const googleDriveWrapper = join(SRC, 'services', 'googleDriveSync.ts');
if (!existsSync(googleDriveWrapper)) throw new Error('Expected Google Drive compatibility wrapper before cleanup.');
const wrapperSource = readFileSync(googleDriveWrapper, 'utf8').trim();
if (wrapperSource !== "export * from '@/features/sync/googleDriveSync';") {
  throw new Error('Google Drive compatibility wrapper changed; refusing to delete it blindly.');
}
rmSync(googleDriveWrapper);

const replacements = new Map([
  ['@/domain/activityAssessments', '@/features/activities/domain/activityAssessments'],
  ['@/domain/activitySelectors', '@/features/activities/domain/activitySelectors'],
  ['@/domain/dailyCareTargets', '@/features/activities/domain/dailyCareTargets'],
  ['@/domain/medicationCatalog', '@/features/activities/domain/medicationCatalog'],
  ['@/domain/growthSelectors', '@/features/growth/domain/growthSelectors'],
  ['@/domain/reminderScheduler', '@/features/reminders/domain/reminderScheduler'],
  ['@/domain/timelineMedia', '@/features/timeline/domain/timelineMedia'],
  ['@/domain/timelineSelectors', '@/features/timeline/domain/timelineSelectors'],

  ['@/store/useActivityStore', '@/features/activities/store/useActivityStore'],
  ['@/store/useExpenseStore', '@/features/expenses/store/useExpenseStore'],
  ['@/store/useReminderStore', '@/features/reminders/store/useReminderStore'],
  ['@/store/useTimelineStore', '@/features/timeline/store/useTimelineStore'],

  ['@/hooks/useAppModals', '@/app/hooks/useAppModals'],
  ['@/hooks/useThemeColor', '@/app/hooks/useThemeColor'],
  ['@/hooks/useAutoSyncLifecycle', '@/features/sync/hooks/useAutoSyncLifecycle'],
  ['@/hooks/useCalendar', '@/features/timeline/hooks/useCalendar'],
  ['@/hooks/useFamily', '@/features/profile/hooks/useFamily'],
  ['@/hooks/useReminderLifecycle', '@/features/reminders/hooks/useReminderLifecycle'],
  ['@/hooks/useTimelineMediaUrl', '@/features/timeline/hooks/useTimelineMediaUrl'],
  ['@/hooks/useToast', '@/shared/hooks/useToast'],

  ['@/services/localDb', '@/data/localDb'],
  ['@/services/diagnosticLog', '@/app/diagnostics/diagnosticLog'],
  ['@/services/trackingDataReset', '@/app/lifecycle/trackingDataReset'],
  ['@/services/notificationService', '@/features/reminders/services/notificationService'],
  ['@/services/timelineMediaDriveSync', '@/features/sync/timelineMediaDriveSync'],
  ['@/services/timelineMediaSyncProgress', '@/features/sync/timelineMediaSyncProgress'],
  ['@/services/googleDriveSync', '@/features/sync'],
]);

for (const file of sourceCodeFiles()) {
  let source = readFileSync(file, 'utf8');
  const original = source;
  for (const [from, to] of replacements) source = source.replaceAll(from, to);

  if (file === join(SRC, 'app', 'lifecycle', 'trackingDataReset.ts')) {
    source = source.replace("from './localDb'", "from '@/data/localDb'");
  }

  if (source !== original) writeFileSync(file, source);
}

writeFileSync(join(SRC, 'store', 'index.ts'), [
  "export { useUIStore } from './useUIStore';",
  "export { useBabyStore } from './useBabyStore';",
  '',
].join('\n'));

removeEmptyDirectory('src/domain');
removeEmptyDirectory('src/hooks');

const architectureAuditPath = join(SRC, 'architecture', 'architectureAudit.test.mjs');
let architectureAudit = readFileSync(architectureAuditPath, 'utf8');
const tokenAnchor = "  ['babygrowth_v4_mom', 'removed Mom store must not reappear as a persistence key'],";
if (!architectureAudit.includes(tokenAnchor)) throw new Error('Architecture audit token anchor changed.');
architectureAudit = architectureAudit.replace(tokenAnchor, [
  tokenAnchor,
  "  ['@/domain/', 'domain logic must be owned by a feature'],",
  "  ['@/hooks/', 'hooks must be owned by app, feature, or shared boundaries'],",
  "  ['@/store/useActivityStore', 'activity state must be owned by the activities feature'],",
  "  ['@/store/useExpenseStore', 'expense state must be owned by the expenses feature'],",
  "  ['@/store/useReminderStore', 'reminder state must be owned by the reminders feature'],",
  "  ['@/store/useTimelineStore', 'timeline state must be owned by the timeline feature'],",
  "  ['@/services/googleDriveSync', 'Google Drive sync must use the sync feature boundary'],",
].join('\n'));

const testAnchor = "  it('uses a non-AI package identity in package metadata and lockfile', () => {";
if (!architectureAudit.includes(testAnchor)) throw new Error('Architecture audit test anchor changed.');
const ownershipTest = `  it('keeps domain logic, hooks, and feature stores with their owners', () => {\n    expect(existsSync(join(SRC, 'domain'))).toBe(false);\n    expect(existsSync(join(SRC, 'hooks'))).toBe(false);\n\n    for (const legacyPath of [\n      join(SRC, 'store', 'useActivityStore.ts'),\n      join(SRC, 'store', 'useExpenseStore.ts'),\n      join(SRC, 'store', 'useReminderStore.ts'),\n      join(SRC, 'store', 'useTimelineStore.ts'),\n      join(SRC, 'services', 'googleDriveSync.ts'),\n      join(SRC, 'services', 'localDb.ts'),\n      join(SRC, 'services', 'notificationService.ts'),\n      join(SRC, 'services', 'timelineMediaDriveSync.ts'),\n      join(SRC, 'services', 'timelineMediaSyncProgress.ts'),\n    ]) {\n      expect(existsSync(legacyPath), \`${'${relative(ROOT, legacyPath)}'} should not remain\`).toBe(false);\n    }\n  });\n\n`;
architectureAudit = architectureAudit.replace(testAnchor, `${ownershipTest}${testAnchor}`);
writeFileSync(architectureAuditPath, architectureAudit);

const unresolved = [];
const forbiddenImportTokens = [
  '@/domain/',
  '@/hooks/',
  '@/store/useActivityStore',
  '@/store/useExpenseStore',
  '@/store/useReminderStore',
  '@/store/useTimelineStore',
  '@/services/googleDriveSync',
  '@/services/localDb',
  '@/services/notificationService',
  '@/services/timelineMediaDriveSync',
  '@/services/timelineMediaSyncProgress',
];
for (const file of sourceCodeFiles()) {
  const source = readFileSync(file, 'utf8');
  for (const token of forbiddenImportTokens) {
    if (source.includes(token)) unresolved.push(`${relative(ROOT, file)}: ${token}`);
  }
}
if (unresolved.length > 0) {
  throw new Error(`Legacy ownership imports remain:\n${unresolved.join('\n')}`);
}

console.info('Moved domain, hooks, feature stores, and owner-specific services successfully.');

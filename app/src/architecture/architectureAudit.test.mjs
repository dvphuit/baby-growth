import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

const FORBIDDEN_PRODUCTION_TOKENS = [
  ['useMomStore', 'Mom tracking must use unified activity records'],
  ['@/components/modals/', 'feature-specific modals must be owned by features'],
  ['AIDoctorChatModal', 'AI chat was removed from the product'],
  ['useChatStore', 'AI chat state was removed from the product'],
  ['HomeAIBanner', 'AI home surfaces were removed from the product'],
  ['AIAdviceCard', 'AI home surfaces were removed from the product'],
  ['growth-ai-', 'growth reference UI must not retain AI naming'],
  ['growthLiveAiFeedback', 'growth reference UI must not retain AI naming'],
  ['babygrowth_v2_', 'production persistence must use the current generation directly'],
  ['babygrowth_v3_', 'production persistence must use the current generation directly'],
  ['babygrowth_v4_mom', 'removed Mom store must not reappear as a persistence key'],
  ['useBabyStore', 'profile and growth state must not be recombined into a baby store'],
  ['babygrowth_v4_baby', 'profile and growth persistence must use separate ownership keys'],
  ['@/domain/', 'domain logic must be owned by a feature'],
  ['@/hooks/', 'hooks must be owned by app, feature, or shared boundaries'],
  ['@/store/useActivityStore', 'activity state must be owned by the activities feature'],
  ['@/store/useExpenseStore', 'expense state must be owned by the expenses feature'],
  ['@/store/useReminderStore', 'reminder state must be owned by the reminders feature'],
  ['@/store/useTimelineStore', 'timeline state must be owned by the timeline feature'],
  ['@/services/googleDriveSync', 'Google Drive sync must use the sync feature boundary'],
];

const IMPORT_PATTERN = /(?:import|export)\s+(?:[^'\"]*?\s+from\s+)?['\"]([^'\"]+)['\"]|import\(\s*['\"]([^'\"]+)['\"]\s*\)/g;

// Existing debt is named explicitly so the shared boundary can be enforced now
// without turning this guard PR into an unrelated feature-ownership refactor.
// Remove an exception as soon as its owning feature absorbs the module.
const LEGACY_SHARED_FEATURE_IMPORTS = new Set([
  'shared/ui/HavenMedicationPicker.tsx -> @/features/activities/domain/medicationCatalog',
]);

function productionFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return productionFiles(path);
    if (!entry.isFile()) return [];
    if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(entry.name)) return [];
    return /\.[cm]?[jt]sx?$/.test(entry.name) ? [path] : [];
  });
}

function importsFrom(content) {
  const imports = [];
  for (const match of content.matchAll(IMPORT_PATTERN)) {
    imports.push(match[1] ?? match[2]);
  }
  return imports;
}

function findForbiddenTokens() {
  const issues = [];
  for (const file of productionFiles(SRC)) {
    const content = readFileSync(file, 'utf8');
    for (const [token, reason] of FORBIDDEN_PRODUCTION_TOKENS) {
      if (content.includes(token)) {
        issues.push(`${relative(ROOT, file)}: ${reason} (${token})`);
      }
    }
  }
  return issues;
}

function findSharedFeatureImports() {
  const sharedRoot = join(SRC, 'shared');
  const issues = [];
  for (const file of productionFiles(sharedRoot)) {
    const sourcePath = relative(SRC, file).replaceAll('\\', '/');
    const content = readFileSync(file, 'utf8');
    for (const specifier of importsFrom(content)) {
      if (!specifier.startsWith('@/features/')) continue;
      const issue = `${sourcePath} -> ${specifier}`;
      if (!LEGACY_SHARED_FEATURE_IMPORTS.has(issue)) issues.push(issue);
    }
  }
  return issues;
}

describe('architecture acceptance guard', () => {
  it('keeps removed AI and legacy persistence paths out of production source', () => {
    expect(findForbiddenTokens()).toEqual([]);
  });

  it('keeps product features under explicit ownership boundaries', () => {
    for (const feature of ['activities', 'home', 'timeline', 'growth', 'expenses', 'reminders', 'profile', 'sync']) {
      const featurePath = join(SRC, 'features', feature);
      expect(existsSync(featurePath), `${feature} feature should exist`).toBe(true);
      expect(statSync(featurePath).isDirectory(), `${feature} should be a directory`).toBe(true);
    }
  });

  it('prevents shared production code from taking new feature dependencies', () => {
    expect(findSharedFeatureImports()).toEqual([]);
  });

  it('does not keep the removed modal or mom-store modules', () => {
    expect(existsSync(join(SRC, 'store', 'useMomStore.ts'))).toBe(false);
    expect(existsSync(join(SRC, 'components', 'modals'))).toBe(false);
  });

  it('keeps domain logic, hooks, and feature stores with their owners', () => {
    expect(existsSync(join(SRC, 'domain'))).toBe(false);
    expect(existsSync(join(SRC, 'hooks'))).toBe(false);

    for (const legacyPath of [
      join(SRC, 'store', 'useActivityStore.ts'),
      join(SRC, 'store', 'useExpenseStore.ts'),
      join(SRC, 'store', 'useReminderStore.ts'),
      join(SRC, 'store', 'useTimelineStore.ts'),
      join(SRC, 'services', 'googleDriveSync.ts'),
      join(SRC, 'services', 'localDb.ts'),
      join(SRC, 'services', 'notificationService.ts'),
      join(SRC, 'services', 'timelineMediaDriveSync.ts'),
      join(SRC, 'services', 'timelineMediaSyncProgress.ts'),
    ]) {
      expect(existsSync(legacyPath), `${relative(ROOT, legacyPath)} should not remain`).toBe(false);
    }
  });

  it('uses a non-AI package identity in package metadata and lockfile', () => {
    const packageJson = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    const packageLock = JSON.parse(readFileSync(join(ROOT, 'package-lock.json'), 'utf8'));
    expect(packageJson.name).toBe('babygrowth');
    expect(packageLock.name).toBe('babygrowth');
    expect(packageLock.packages?.['']?.name).toBe('babygrowth');
    expect(JSON.stringify(packageLock)).not.toContain('babygrowth-ai');
  });
});

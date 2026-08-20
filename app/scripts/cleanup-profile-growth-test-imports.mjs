import { readFileSync, writeFileSync } from 'node:fs';

const GROWTH_IMPORT = "import { useGrowthStore } from '@/features/growth/store/useGrowthStore';\n";
const PROFILE_IMPORT = "import { initializeChildProfile, resetChildStoresToDefaults, useProfileStore } from '@/features/profile';";

const files = [
  ['src/app/App.test.tsx', false, ['initializeChildProfile', 'resetChildStoresToDefaults']],
  ['src/app/lifecycle/trackingDataReset.test.ts', true, ['initializeChildProfile', 'resetChildStoresToDefaults']],
  ['src/app/onboarding/OnboardingView.test.tsx', false, ['resetChildStoresToDefaults', 'useProfileStore']],
  ['src/features/profile/ProfileView.test.tsx', false, ['resetChildStoresToDefaults', 'useProfileStore']],
  ['src/features/sync/appSnapshot.test.ts', false, ['initializeChildProfile', 'resetChildStoresToDefaults', 'useProfileStore']],
  ['src/features/sync/googleDriveSync.test.ts', false, ['initializeChildProfile', 'resetChildStoresToDefaults']],
  ['src/features/timeline/AddPostModal.test.tsx', false, ['resetChildStoresToDefaults']],
  ['src/features/timeline/TimelineView.test.tsx', true, ['resetChildStoresToDefaults', 'useProfileStore']],
];

for (const [file, keepGrowthStore, profileSymbols] of files) {
  let source = readFileSync(file, 'utf8');
  if (!source.includes(PROFILE_IMPORT)) {
    throw new Error(`Expected generated profile import in ${file}`);
  }
  if (!keepGrowthStore) source = source.replace(GROWTH_IMPORT, '');
  source = source.replace(
    PROFILE_IMPORT,
    `import { ${profileSymbols.join(', ')} } from '@/features/profile';`,
  );
  writeFileSync(file, source);
}

console.log('Generated test imports pruned successfully.');

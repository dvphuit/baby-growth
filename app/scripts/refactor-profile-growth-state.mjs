import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

function read(relativePath) {
  return readFileSync(join(ROOT, relativePath), 'utf8');
}

function write(relativePath, content) {
  const absolute = join(ROOT, relativePath);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, content);
}

function replaceExact(relativePath, from, to) {
  const absolute = join(ROOT, relativePath);
  const source = readFileSync(absolute, 'utf8');
  if (!source.includes(from)) {
    throw new Error(`Expected text not found in ${relativePath}: ${from.slice(0, 100)}`);
  }
  writeFileSync(absolute, source.replaceAll(from, to));
}

function replaceRegex(relativePath, pattern, replacement) {
  const absolute = join(ROOT, relativePath);
  const source = readFileSync(absolute, 'utf8');
  if (!pattern.test(source)) {
    throw new Error(`Expected pattern not found in ${relativePath}: ${pattern}`);
  }
  pattern.lastIndex = 0;
  writeFileSync(absolute, source.replace(pattern, replacement));
}

function walk(directory) {
  if (!existsSync(directory)) return [];
  const { readdirSync } = awaitImportFs();
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walk(path);
    return entry.isFile() ? [path] : [];
  });
}

function awaitImportFs() {
  return { readdirSync: (directory, options) => {
    // Kept as a tiny indirection so all filesystem mutations stay centralized in this script.
    return globalThis.__readdirSync(directory, options);
  } };
}

// Install the one read primitive used by walk without adding another top-level import group.
const { readdirSync } = await import('node:fs');
globalThis.__readdirSync = readdirSync;

const oldStorePath = 'src/store/useBabyStore.ts';
const oldStore = read(oldStorePath);
let growthStore = oldStore;

growthStore = growthStore
  .replace("import { FAMILY_DATA, INITIAL_DAILY_HABITS, INITIAL_STAGES } from '@/data/seedData';", "import { INITIAL_DAILY_HABITS, INITIAL_STAGES } from '@/data/seedData';")
  .replace('interface BabyStoreState {', 'export interface GrowthStoreState {')
  .replace('  familyData: FamilyData;\n', '')
  .replace('  updateFamilyData: (data: Partial<FamilyData>) => void;\n', '')
  .replace('  initializeChildProfile: (', '  initializeChildGrowth: (')
  .replace('  resetTrackingData: () => void;', '  resetTrackingData: (familyData: FamilyData) => void;')
  .replace('export const useBabyStore = create<BabyStoreState>()(', 'export const useGrowthStore = create<GrowthStoreState>()(')
  .replace('      familyData: structuredClone(FAMILY_DATA),\n', '')
  .replace("      updateFamilyData: (updates) => set((state) => ({ familyData: { ...state.familyData, ...updates } })),\n\n", '')
  .replace('      initializeChildProfile: (profile, initialVitals) => {', '      initializeChildGrowth: (profile, initialVitals) => {')
  .replace("        const updatedFamily: FamilyData = { ...FAMILY_DATA, ...profile, isInitialized: true };\n\n", '')
  .replace('            familyData: updatedFamily,\n', '')
  .replace('      resetTrackingData: () => {', '      resetTrackingData: (familyData) => {')
  .replace('          familyData: preservedFamily,\n', '')
  .replace('        familyData: structuredClone(FAMILY_DATA),\n', '')
  .replace("      name: 'babygrowth_v4_baby',", "      name: 'babygrowth_v4_growth',");

const familyResetPattern = /        const \{\n          childName,[\s\S]*?        \} = state\.familyData;\n        const currentStage = getStageForBirthDate\(birthDate\);\n        const preservedFamily: FamilyData = \{[\s\S]*?        \};\n/;
if (!familyResetPattern.test(growthStore)) {
  throw new Error('Could not isolate profile preservation block in legacy baby store.');
}
growthStore = growthStore.replace(
  familyResetPattern,
  "        const { birthDate, birthWeight, birthHeight, headCircAtBirth } = familyData;\n        const currentStage = getStageForBirthDate(birthDate);\n",
);

for (const forbidden of ['useBabyStore', 'BabyStoreState', 'babygrowth_v4_baby', 'familyData: structuredClone(FAMILY_DATA)']) {
  if (growthStore.includes(forbidden)) throw new Error(`Growth store still contains legacy ownership: ${forbidden}`);
}

write('src/features/growth/store/useGrowthStore.ts', growthStore);

write('src/features/profile/store/useProfileStore.ts', `import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { FAMILY_DATA } from '@/data/seedData';
import { indexedDbStorage } from '@/data/localDb';
import type { FamilyData } from '@/types';

export interface ProfileStoreState {
  familyData: FamilyData;
  initializeChildProfile: (profile: Partial<FamilyData>) => void;
  updateFamilyData: (data: Partial<FamilyData>) => void;
  resetToDefaults: () => void;
}

export const useProfileStore = create<ProfileStoreState>()(
  persist(
    (set) => ({
      familyData: structuredClone(FAMILY_DATA),
      initializeChildProfile: (profile) => set({
        familyData: { ...structuredClone(FAMILY_DATA), ...profile, isInitialized: true },
      }),
      updateFamilyData: (updates) => set((state) => ({
        familyData: { ...state.familyData, ...updates },
      })),
      resetToDefaults: () => set({ familyData: structuredClone(FAMILY_DATA) }),
    }),
    {
      name: 'babygrowth_v4_profile',
      storage: createJSONStorage(() => indexedDbStorage),
    },
  ),
);
`);

write('src/features/profile/profileLifecycle.ts', `import type { FamilyData } from '@/types';
import { useGrowthStore } from '@/features/growth/store/useGrowthStore';
import { useProfileStore } from './store/useProfileStore';

type InitialVitals = { weight?: number; height?: number; headCirc?: number };

export function initializeChildProfile(profile: Partial<FamilyData>, initialVitals?: InitialVitals): void {
  useProfileStore.getState().initializeChildProfile(profile);
  useGrowthStore.getState().initializeChildGrowth(profile, initialVitals);
}

export function resetChildStoresToDefaults(): void {
  useProfileStore.getState().resetToDefaults();
  useGrowthStore.getState().resetToDefaults();
}
`);

// Public feature boundaries.
replaceExact(
  'src/features/profile/index.ts',
  "export { ProfileView } from './ProfileView';\n",
  "export { ProfileView } from './ProfileView';\nexport { initializeChildProfile, resetChildStoresToDefaults } from './profileLifecycle';\nexport { useProfileStore } from './store/useProfileStore';\n",
);
replaceExact(
  'src/features/growth/index.ts',
  "export { GrowthView } from './GrowthView';\n",
  "export { GrowthView } from './GrowthView';\nexport { useGrowthStore } from './store/useGrowthStore';\n",
);

// App composition and lifecycle.
replaceExact('src/app/App.tsx', "import { useBabyStore } from '@/store/useBabyStore';", "import { useProfileStore } from '@/features/profile/store/useProfileStore';");
replaceExact('src/app/App.tsx', 'useBabyStore((state) => state.familyData)', 'useProfileStore((state) => state.familyData)');

replaceExact('src/app/lifecycle/trackingDataReset.ts', "import { useBabyStore } from '@/store/useBabyStore';", "import { useGrowthStore } from '@/features/growth/store/useGrowthStore';\nimport { useProfileStore } from '@/features/profile/store/useProfileStore';");
replaceExact('src/app/lifecycle/trackingDataReset.ts', '    waitForStoreHydration(useBabyStore),', '    waitForStoreHydration(useGrowthStore),\n    waitForStoreHydration(useProfileStore),');
replaceExact('src/app/lifecycle/trackingDataReset.ts', '    useBabyStore.getState().resetTrackingData();', '    useGrowthStore.getState().resetTrackingData(useProfileStore.getState().familyData);');

replaceExact('src/app/onboarding/OnboardingView.tsx', "import { useBabyStore } from '@/store/useBabyStore';", "import { initializeChildProfile } from '@/features/profile';");
replaceExact('src/app/onboarding/OnboardingView.tsx', '  const initializeChildProfile = useBabyStore((s) => s.initializeChildProfile);\n', '');

// Data bootstrap and shared UI.
replaceExact('src/data/mockData.ts', "import { useBabyStore } from '@/store/useBabyStore';", "import { initializeChildProfile } from '@/features/profile';\nimport { useGrowthStore } from '@/features/growth/store/useGrowthStore';");
replaceExact('src/data/mockData.ts', '  const baby = useBabyStore.getState();\n  baby.initializeChildProfile(MOCK_FAMILY, BIRTH_VITALS);\n\n  const babyAfter = useBabyStore.getState();', '  initializeChildProfile(MOCK_FAMILY, BIRTH_VITALS);\n\n  const growth = useGrowthStore.getState();');
replaceExact('src/data/mockData.ts', "    if (!babyAfter.stages[babyAfter.currentStage]?.growthHistory?.some((item) => item.id === record.id)) {\n      babyAfter.addGrowthMeasurement({", "    if (!growth.currentStageData().growthHistory.some((item) => item.id === record.id)) {\n      growth.addGrowthMeasurement({");

replaceExact('src/shared/ui/HavenMilkAmountInput.tsx', "import { useBabyStore } from '@/store/useBabyStore';", "import { useGrowthStore } from '@/features/growth/store/useGrowthStore';\nimport { useProfileStore } from '@/features/profile/store/useProfileStore';");
replaceExact('src/shared/ui/HavenMilkAmountInput.tsx', 'useBabyStore((s) => s.familyData)', 'useProfileStore((s) => s.familyData)');
replaceExact('src/shared/ui/HavenMilkAmountInput.tsx', 'useBabyStore((s) => s.currentStageData())', 'useGrowthStore((s) => s.currentStageData())');

replaceExact('src/main.tsx', "import { useBabyStore } from './store/useBabyStore';", "import { useGrowthStore } from '@/features/growth/store/useGrowthStore';\nimport { useProfileStore } from '@/features/profile/store/useProfileStore';");
replaceExact('src/main.tsx', '      useBabyStore.persist.rehydrate(),', '      useProfileStore.persist.rehydrate(),\n      useGrowthStore.persist.rehydrate(),');
replaceExact('src/main.tsx', '    const family = useBabyStore.getState().familyData;', '    const family = useProfileStore.getState().familyData;');

// Profile feature.
replaceExact('src/features/profile/ProfileView.tsx', "import { useBabyStore } from '@/store/useBabyStore';", "import { useGrowthStore } from '@/features/growth/store/useGrowthStore';");
replaceExact('src/features/profile/ProfileView.tsx', 'useBabyStore((state) => state.currentStageData())', 'useGrowthStore((state) => state.currentStageData())');
replaceExact('src/features/profile/hooks/useFamily.ts', 'Hook for accessing family profile data reactively from useBabyStore.', 'Hook for accessing family profile data reactively from the profile store.');
replaceExact('src/features/profile/hooks/useFamily.ts', "import { useBabyStore } from '@/store/useBabyStore';", "import { useProfileStore } from '@/features/profile/store/useProfileStore';");
replaceExact('src/features/profile/hooks/useFamily.ts', 'return useBabyStore((state) => state.familyData);', 'return useProfileStore((state) => state.familyData);');
replaceExact('src/features/profile/EditProfileModal.tsx', "import { useBabyStore } from '@/store/useBabyStore';", "import { useProfileStore } from '@/features/profile/store/useProfileStore';");
replaceExact('src/features/profile/EditProfileModal.tsx', 'useBabyStore((state) => state.updateFamilyData)', 'useProfileStore((state) => state.updateFamilyData)');

// Growth feature.
for (const file of [
  'src/features/growth/MilestoneRoadmap.tsx',
  'src/features/growth/AddGrowthModal.tsx',
  'src/features/growth/GrowthHistory.tsx',
  'src/features/home/components/BabyHomeView.tsx',
]) {
  replaceExact(file, "import { useBabyStore } from '@/store/useBabyStore';", "import { useGrowthStore } from '@/features/growth/store/useGrowthStore';");
  replaceExact(file, 'useBabyStore(', 'useGrowthStore(');
}
replaceExact('src/features/growth/GrowthView.tsx', "import { useBabyStore } from '@/store/useBabyStore';", "import { useGrowthStore } from '@/features/growth/store/useGrowthStore';\nimport { useProfileStore } from '@/features/profile/store/useProfileStore';");
replaceExact('src/features/growth/GrowthView.tsx', 'useBabyStore((state) => state.currentStage)', 'useGrowthStore((state) => state.currentStage)');
replaceExact('src/features/growth/GrowthView.tsx', 'useBabyStore((state) => state.currentStageData())', 'useGrowthStore((state) => state.currentStageData())');
replaceExact('src/features/growth/GrowthView.tsx', 'useBabyStore((state) => state.familyData)', 'useProfileStore((state) => state.familyData)');

// Timeline feature.
replaceExact('src/features/timeline/store/useTimelineStore.ts', "import { useBabyStore } from '@/store/useBabyStore';", "import { useGrowthStore } from '@/features/growth/store/useGrowthStore';\nimport { useProfileStore } from '@/features/profile/store/useProfileStore';");
replaceExact('src/features/timeline/store/useTimelineStore.ts', '        const babyState = useBabyStore.getState();\n        const currentStage = babyState.currentStage;\n        const family = babyState.familyData;', '        const currentStage = useGrowthStore.getState().currentStage;\n        const family = useProfileStore.getState().familyData;');

replaceExact('src/features/timeline/TimelineView.tsx', "import { useBabyStore } from '@/store/useBabyStore';", "import { useGrowthStore } from '@/features/growth/store/useGrowthStore';\nimport { useProfileStore } from '@/features/profile/store/useProfileStore';");
replaceExact('src/features/timeline/TimelineView.tsx', 'useBabyStore((state) => state.currentStageData().growthHistory)', 'useGrowthStore((state) => state.currentStageData().growthHistory)');
replaceExact('src/features/timeline/TimelineView.tsx', 'useBabyStore((state) => state.familyData.birthDate)', 'useProfileStore((state) => state.familyData.birthDate)');

replaceExact('src/features/timeline/components/TimelineEntryDialog.tsx', "import { useBabyStore } from '@/store/useBabyStore';", "import { useGrowthStore } from '@/features/growth/store/useGrowthStore';\nimport { useProfileStore } from '@/features/profile/store/useProfileStore';");
replaceExact('src/features/timeline/components/TimelineEntryDialog.tsx', 'useBabyStore((state) => state.updateGrowthMeasurement)', 'useGrowthStore((state) => state.updateGrowthMeasurement)');
replaceExact('src/features/timeline/components/TimelineEntryDialog.tsx', 'useBabyStore((state) => state.familyData.birthDate)', 'useProfileStore((state) => state.familyData.birthDate)');
replaceExact('src/features/timeline/components/TimelineEntryDialog.tsx', 'useBabyStore((state) => state.deleteGrowthMeasurement)', 'useGrowthStore((state) => state.deleteGrowthMeasurement)');

// Snapshot and sync boundary.
replaceExact('src/features/sync/appSnapshot.ts', "import { useBabyStore } from '@/store/useBabyStore';", "import { useGrowthStore } from '@/features/growth/store/useGrowthStore';\nimport { useProfileStore } from '@/features/profile/store/useProfileStore';");
replaceExact('src/features/sync/appSnapshot.ts', '  const baby = useBabyStore.getState();', '  const profile = useProfileStore.getState();\n  const growth = useGrowthStore.getState();');
replaceExact('src/features/sync/appSnapshot.ts', '      familyData: structuredClone(baby.familyData),', '      familyData: structuredClone(profile.familyData),');
replaceExact('src/features/sync/appSnapshot.ts', '      currentStage: baby.currentStage,\n      stages: structuredClone(baby.stages),\n      dailyHabits: structuredClone(baby.dailyHabits),', '      currentStage: growth.currentStage,\n      stages: structuredClone(growth.stages),\n      dailyHabits: structuredClone(growth.dailyHabits),');
replaceExact('src/features/sync/appSnapshot.ts', '  useBabyStore.setState({\n    familyData: structuredClone(parsed.profile.familyData),\n    currentStage: parsed.growth.currentStage,\n    stages: structuredClone(parsed.growth.stages),\n    dailyHabits: structuredClone(parsed.growth.dailyHabits),\n  });', '  useProfileStore.setState({ familyData: structuredClone(parsed.profile.familyData) });\n  useGrowthStore.setState({\n    currentStage: parsed.growth.currentStage,\n    stages: structuredClone(parsed.growth.stages),\n    dailyHabits: structuredClone(parsed.growth.dailyHabits),\n  });');
replaceExact('src/features/sync/appSnapshot.ts', '    useBabyStore.subscribe(listener),', '    useProfileStore.subscribe(listener),\n    useGrowthStore.subscribe(listener),');
replaceExact('src/features/sync/googleDriveSync.ts', "  'babygrowth_v4_baby',", "  'babygrowth_v4_profile',\n  'babygrowth_v4_growth',");

// Tests: use lifecycle helpers for paired setup/reset, and owner stores for assertions.
const pairedTestFiles = [
  'src/app/App.test.tsx',
  'src/app/onboarding/OnboardingView.test.tsx',
  'src/features/profile/ProfileView.test.tsx',
  'src/features/timeline/AddPostModal.test.tsx',
  'src/features/timeline/TimelineView.test.tsx',
  'src/features/sync/googleDriveSync.test.ts',
  'src/features/sync/appSnapshot.test.ts',
  'src/app/lifecycle/trackingDataReset.test.ts',
  'src/store/trackingProfileReset.test.ts',
];
for (const file of pairedTestFiles) {
  replaceExact(file, "import { useBabyStore } from '@/store/useBabyStore';", "import { useGrowthStore } from '@/features/growth/store/useGrowthStore';\nimport { initializeChildProfile, resetChildStoresToDefaults, useProfileStore } from '@/features/profile';");
  const absolute = join(ROOT, file);
  let source = readFileSync(absolute, 'utf8');
  source = source
    .replaceAll('useBabyStore.getState().resetToDefaults();', 'resetChildStoresToDefaults();')
    .replaceAll('useBabyStore.getState().initializeChildProfile(', 'initializeChildProfile(')
    .replaceAll('useBabyStore.getState().addGrowthMeasurement(', 'useGrowthStore.getState().addGrowthMeasurement(')
    .replaceAll('useBabyStore.getState().resetTrackingData();', 'useGrowthStore.getState().resetTrackingData(useProfileStore.getState().familyData);')
    .replaceAll('useBabyStore.getState().currentStageData()', 'useGrowthStore.getState().currentStageData()')
    .replaceAll('useBabyStore.getState().updateFamilyData(', 'useProfileStore.getState().updateFamilyData(');
  writeFileSync(absolute, source);
}

// Simple growth-only tests.
for (const file of [
  'src/features/growth/GrowthHistory.test.tsx',
  'src/features/growth/MilestoneRoadmap.test.tsx',
  'src/features/growth/GrowthView.test.tsx',
]) {
  replaceExact(file, "import { useBabyStore } from '@/store/useBabyStore';", "import { useGrowthStore } from '@/features/growth/store/useGrowthStore';");
  const absolute = join(ROOT, file);
  writeFileSync(absolute, readFileSync(absolute, 'utf8').replaceAll('useBabyStore', 'useGrowthStore'));
}

// Mixed test locals need explicit owner state instead of a merged facade.
replaceExact('src/app/onboarding/OnboardingView.test.tsx', '    const state = useBabyStore.getState();\n    expect(state.familyData.isInitialized).toBe(true);\n    expect(state.familyData.childName).toBe(\'Bé Bơ\');', "    const profile = useProfileStore.getState();\n    expect(profile.familyData.isInitialized).toBe(true);\n    expect(profile.familyData.childName).toBe('Bé Bơ');");
replaceExact('src/features/sync/appSnapshot.test.ts', "    expect(useBabyStore.getState().familyData.childName).toBe('Bé Bơ');", "    expect(useProfileStore.getState().familyData.childName).toBe('Bé Bơ');");

// Timeline tests mutate raw growth state and profile identity independently.
replaceExact('src/features/timeline/TimelineView.test.tsx', 'const state = useBabyStore.getState();', 'const state = useGrowthStore.getState();');
replaceExact('src/features/timeline/TimelineView.test.tsx', 'useBabyStore.setState({', 'useGrowthStore.setState({');
replaceExact('src/features/timeline/TimelineView.test.tsx', "useBabyStore.getState().updateFamilyData({ birthDate: '2026-06-18' });", "useProfileStore.getState().updateFamilyData({ birthDate: '2026-06-18' });");

// Tracking reset test asserts growth and profile separately.
replaceExact('src/app/lifecycle/trackingDataReset.test.ts', '  const baby = useBabyStore.getState();\n  expect(baby.currentStageData().growthHistory)', '  const growth = useGrowthStore.getState();\n  expect(growth.currentStageData().growthHistory)');
replaceExact('src/app/lifecycle/trackingDataReset.test.ts', '  expect(baby.currentStageData().growthHistory[0])', '  expect(growth.currentStageData().growthHistory[0])');

// Preserve focused profile/growth reset coverage under the growth owner.
const resetTestSourcePath = join(ROOT, 'src/store/trackingProfileReset.test.ts');
let resetTest = readFileSync(resetTestSourcePath, 'utf8');
resetTest = resetTest
  .replaceAll('useBabyStore.getState()', 'useGrowthStore.getState()')
  .replaceAll('useBabyStore.setState(', 'useGrowthStore.setState(');
resetTest = resetTest.replaceAll('state.familyData', 'useProfileStore.getState().familyData');
write('src/features/growth/store/useGrowthStore.reset.test.ts', resetTest);
rmSync(resetTestSourcePath);

// Store barrel is now UI-only; domain stores are feature-owned.
write('src/store/index.ts', "export { useUIStore } from './useUIStore';\n");
rmSync(join(ROOT, oldStorePath));

// Architecture guard: mixed store/key may not return.
const architecturePath = 'src/architecture/architectureAudit.test.mjs';
let architecture = read(architecturePath);
const tokenAnchor = "  ['babygrowth_v4_mom', 'removed Mom store must not reappear as a persistence key'],";
if (!architecture.includes(tokenAnchor)) throw new Error('Architecture token anchor changed.');
architecture = architecture.replace(tokenAnchor, [
  tokenAnchor,
  "  ['useBabyStore', 'profile and growth state must not be recombined into a baby store'],",
  "  ['babygrowth_v4_baby', 'profile and growth persistence must use separate ownership keys'],",
].join('\n'));
write(architecturePath, architecture);

// Remove the transient inventory workflow; this migration supersedes it.
const inventoryWorkflow = join(ROOT, '..', '.github', 'workflows', 'refactor-state-inventory.yml');
if (existsSync(inventoryWorkflow)) rmSync(inventoryWorkflow);

// Final source guard.
const sourceFiles = walk(SRC).filter((file) => ['.ts', '.tsx', '.mjs'].includes(extname(file)));
const forbidden = ['useBabyStore', 'babygrowth_v4_baby'];
for (const file of sourceFiles) {
  const source = readFileSync(file, 'utf8');
  for (const token of forbidden) {
    if (source.includes(token) && !file.endsWith('architectureAudit.test.mjs')) {
      throw new Error(`Legacy mixed-state token ${token} remains in ${relative(ROOT, file)}`);
    }
  }
}

console.log('Profile/growth ownership split applied successfully.');

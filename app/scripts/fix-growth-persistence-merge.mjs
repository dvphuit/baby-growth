import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/features/growth/store/useGrowthStore.ts';
let source = readFileSync(file, 'utf8');
const oldImport = "import { exportGrowthFacts, hydrateGrowthFacts, type GrowthFacts } from './growthPersistence';";
const newImport = "import { exportGrowthFacts, hydrateGrowthFacts, isGrowthFacts, type GrowthFacts } from './growthPersistence';";
const oldMerge = '      merge: (persisted, current) => ({ ...current, ...hydrateGrowthFacts(persisted) }),';
const newMerge = '      merge: (persisted, current) => ({ ...current, ...(isGrowthFacts(persisted) ? hydrateGrowthFacts(persisted) : {}) }),';
if (!source.includes(oldImport) || !source.includes(oldMerge)) throw new Error('Expected raw growth merge output not found.');
source = source.replace(oldImport, newImport).replace(oldMerge, newMerge);
writeFileSync(file, source);
console.log('Growth persistence merge validated at the storage boundary.');

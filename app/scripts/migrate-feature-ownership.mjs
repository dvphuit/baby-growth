import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const GLOBAL_TYPES = join(SRC, 'types', 'index.ts');
const SOURCE_PATTERN = /\.[cm]?[jt]sx?$/;

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walk(path);
    return entry.isFile() && SOURCE_PATTERN.test(entry.name) ? [path] : [];
  });
}

function ensureParent(file) {
  mkdirSync(dirname(file), { recursive: true });
}

function move(sourceRelative, targetRelative) {
  const source = join(ROOT, sourceRelative);
  const target = join(ROOT, targetRelative);
  if (!existsSync(source)) throw new Error(`Missing migration source: ${sourceRelative}`);
  if (existsSync(target)) throw new Error(`Migration target already exists: ${targetRelative}`);
  ensureParent(target);
  renameSync(source, target);
}

function featureOwner(file) {
  const rel = relative(SRC, file).replaceAll('\\', '/');
  return rel.match(/^features\/([^/]+)\//)?.[1] ?? null;
}

function importCandidates(sourceFile, specifier) {
  let base;
  if (specifier.startsWith('@/')) base = resolve(SRC, specifier.slice(2));
  else if (specifier.startsWith('.')) base = resolve(dirname(sourceFile), specifier);
  else return [];
  return [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    join(base, 'index.ts'),
    join(base, 'index.tsx'),
  ];
}

const movedModules = new Map([
  [join(SRC, 'shared/ui/HavenMedicationPicker.tsx'), { feature: 'activities', privateModule: '@/features/activities/components/HavenMedicationPicker' }],
  [join(SRC, 'shared/ui/HavenMilkAmountInput.tsx'), { feature: 'activities', privateModule: '@/features/activities/components/HavenMilkAmountInput' }],
  [join(SRC, 'shared/ui/HavenTemperatureInput.tsx'), { feature: 'activities', privateModule: '@/features/activities/components/HavenTemperatureInput' }],
  [join(SRC, 'shared/ui/Header.tsx'), { feature: null, privateModule: '@/app/components/Header' }],
  [join(SRC, 'data/expenseCategories.ts'), { feature: 'expenses', privateModule: '@/features/expenses/domain/expenseCategories' }],
  [join(SRC, 'utils/expenseMath.ts'), { feature: 'expenses', privateModule: '@/features/expenses/domain/expenseMath' }],
]);

function resolveImportTarget(sourceFile, specifier) {
  const candidates = importCandidates(sourceFile, specifier);
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return candidates.find((candidate) => movedModules.has(candidate)) ?? null;
}

function parse(file, text) {
  return ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function replaceRanges(text, edits) {
  return [...edits]
    .sort((a, b) => b.start - a.start)
    .reduce((result, edit) => `${result.slice(0, edit.start)}${edit.text}${result.slice(edit.end)}`, text);
}

function replacementForMovedModule(sourceFile, moved) {
  if (!moved.feature) return moved.privateModule;
  return featureOwner(sourceFile) === moved.feature
    ? moved.privateModule
    : `@/features/${moved.feature}`;
}

function rewriteMovedModuleImports(file) {
  let text = readFileSync(file, 'utf8');
  const sourceFile = parse(file, text);
  const edits = [];

  function visit(node) {
    let literal = null;
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) {
      literal = node.moduleSpecifier;
    } else if (ts.isCallExpression(node) && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require')) {
        literal = node.arguments[0];
      }
    }

    if (literal) {
      const target = resolveImportTarget(file, literal.text);
      const moved = target ? movedModules.get(target) : null;
      if (moved) {
        edits.push({
          start: literal.getStart(sourceFile) + 1,
          end: literal.getEnd() - 1,
          text: replacementForMovedModule(file, moved),
        });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  if (edits.length) writeFileSync(file, replaceRanges(text, edits));
}

const TYPE_GROUPS = {
  activities: [
    'PumpingSession',
    'MomData',
    'BabyActivityType',
    'MomActivityType',
    'ActivityLogType',
    'ActivityBase',
    'BabyActivity',
    'MomActivity',
    'ActivityRecord',
  ],
  profile: ['ProfileMode', 'FamilyData'],
  timeline: ['CalendarViewMode', 'CalendarRangeEvent', 'TimelineItem', 'TimelineMediaItem'],
  growth: [
    'StageKey',
    'GrowthMetric',
    'Vitals',
    'MetricSeries',
    'GrowthChartData',
    'GrowthHistoryRecord',
    'MotorMilestoneItem',
    'MotorMilestones',
  ],
  expenses: ['ExpenseCategoryItem', 'ExpenseMonthlyHistory', 'StageExpenseData'],
};
const TYPE_OWNER = new Map(
  Object.entries(TYPE_GROUPS).flatMap(([feature, names]) => names.map((name) => [name, feature])),
);

function declarationName(statement) {
  if ((ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) && statement.name) {
    return statement.name.text;
  }
  return null;
}

function splitGlobalTypes() {
  const text = readFileSync(GLOBAL_TYPES, 'utf8');
  const sourceFile = parse(GLOBAL_TYPES, text);
  const declarations = new Map();
  const remaining = [];

  for (const statement of sourceFile.statements) {
    const name = declarationName(statement);
    const declarationText = text.slice(statement.getFullStart(), statement.getEnd()).trim();
    if (!name || !TYPE_OWNER.has(name)) remaining.push(declarationText);
    else declarations.set(name, declarationText);
  }

  const headers = {
    activities: '',
    profile: '',
    growth: '',
    expenses: '',
    timeline: "import type { StageKey } from '@/features/growth';\nimport type { ProfileMode } from '@/features/profile';\n\n",
  };

  for (const [feature, names] of Object.entries(TYPE_GROUPS)) {
    const missing = names.filter((name) => !declarations.has(name));
    if (missing.length) throw new Error(`Missing ${feature} type declarations: ${missing.join(', ')}`);
    const target = join(SRC, 'features', feature, 'domain', 'types.ts');
    if (existsSync(target)) throw new Error(`Type target already exists: ${relative(ROOT, target)}`);
    ensureParent(target);
    writeFileSync(target, `${headers[feature]}${names.map((name) => declarations.get(name)).join('\n\n')}\n`);
  }

  const remainingHeader = [
    "import type { GrowthChartData, GrowthHistoryRecord, MotorMilestones, StageKey, Vitals } from '@/features/growth';",
    "import type { StageExpenseData } from '@/features/expenses';",
    '',
  ].join('\n');
  writeFileSync(GLOBAL_TYPES, `${remainingHeader}${remaining.join('\n\n')}\n`);
}

function resolvesToGlobalTypes(sourceFile, specifier) {
  return resolveImportTarget(sourceFile, specifier) === GLOBAL_TYPES;
}

function moduleForType(typeName, sourceFile) {
  const feature = TYPE_OWNER.get(typeName);
  if (!feature) return null;
  return featureOwner(sourceFile) === feature
    ? `@/features/${feature}/domain/types`
    : `@/features/${feature}`;
}

function rewriteGlobalTypeImports(file) {
  let text = readFileSync(file, 'utf8');
  const sourceFile = parse(file, text);
  const edits = [];

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteralLike(statement.moduleSpecifier)) continue;
    if (!resolvesToGlobalTypes(file, statement.moduleSpecifier.text)) continue;
    const clause = statement.importClause;
    if (!clause?.namedBindings || !ts.isNamedImports(clause.namedBindings) || clause.name) {
      throw new Error(`Unsupported global type import in ${relative(ROOT, file)}`);
    }

    const groups = new Map();
    for (const element of clause.namedBindings.elements) {
      const imported = element.propertyName?.text ?? element.name.text;
      const local = element.name.text;
      const targetModule = moduleForType(imported, file) ?? statement.moduleSpecifier.text;
      const list = groups.get(targetModule) ?? [];
      list.push(imported === local ? imported : `${imported} as ${local}`);
      groups.set(targetModule, list);
    }

    const replacement = [...groups.entries()]
      .map(([module, names]) => `import type { ${names.join(', ')} } from '${module}';`)
      .join('\n');
    edits.push({ start: statement.getFullStart(), end: statement.getEnd(), text: `\n${replacement}` });
  }

  if (edits.length) writeFileSync(file, replaceRanges(text, edits));
}

function appendExports(relativePath, lines) {
  const file = join(SRC, relativePath);
  let text = readFileSync(file, 'utf8').trimEnd();
  for (const line of lines) {
    if (!text.includes(line)) text += `\n${line}`;
  }
  writeFileSync(file, `${text}\n`);
}

function updatePublicApis() {
  appendExports('features/activities/index.ts', [
    "export { HavenMedicationPicker } from './components/HavenMedicationPicker';",
    "export { HavenMilkAmountInput } from './components/HavenMilkAmountInput';",
    "export type { HavenMilkAmountInputProps } from './components/HavenMilkAmountInput';",
    "export { HavenTemperatureInput } from './components/HavenTemperatureInput';",
    "export type { HavenTemperatureInputProps } from './components/HavenTemperatureInput';",
    "export type { ActivityBase, ActivityLogType, ActivityRecord, BabyActivity, BabyActivityType, MomActivity, MomActivityType, MomData, PumpingSession } from './domain/types';",
  ]);
  appendExports('features/profile/index.ts', [
    "export { useFamily } from './hooks/useFamily';",
    "export type { FamilyData, ProfileMode } from './domain/types';",
  ]);
  appendExports('features/timeline/index.ts', [
    "export type { CalendarRangeEvent, CalendarViewMode, TimelineItem, TimelineMediaItem } from './domain/types';",
  ]);
  appendExports('features/growth/index.ts', [
    "export type { GrowthChartData, GrowthHistoryRecord, GrowthMetric, MetricSeries, MotorMilestoneItem, MotorMilestones, StageKey, Vitals } from './domain/types';",
  ]);
  appendExports('features/expenses/index.ts', [
    "export * from './domain/expenseCategories';",
    "export * from './domain/expenseMath';",
    "export type { ExpenseCategoryItem, ExpenseMonthlyHistory, StageExpenseData } from './domain/types';",
  ]);
}

function rewriteMovedFeatureDependencies() {
  const replacements = new Map([
    ['@/features/growth/store/useGrowthStore', '@/features/growth'],
    ['@/features/profile/store/useProfileStore', '@/features/profile'],
    ['@/features/profile/hooks/useFamily', '@/features/profile'],
  ]);
  for (const file of [
    join(SRC, 'features/activities/components/HavenMilkAmountInput.tsx'),
    join(SRC, 'app/components/Header.tsx'),
  ]) {
    let text = readFileSync(file, 'utf8');
    for (const [from, to] of replacements) text = text.replaceAll(from, to);
    if (file.endsWith('/Header.tsx')) text = text.replace("from './AppBar'", "from '@/shared/ui/AppBar'");
    writeFileSync(file, text);
  }
}

function updateArchitectureGuard() {
  const file = join(SRC, 'architecture', 'architectureAudit.test.mjs');
  let text = readFileSync(file, 'utf8');
  for (const edge of [
    'shared/ui/HavenMedicationPicker.tsx -> @/features/activities/domain/medicationCatalog',
    'shared/ui/HavenMilkAmountInput.tsx -> @/features/activities/domain/dailyCareTargets',
    'shared/ui/HavenMilkAmountInput.tsx -> @/features/growth/store/useGrowthStore',
    'shared/ui/HavenMilkAmountInput.tsx -> @/features/profile/store/useProfileStore',
    'shared/ui/HavenTemperatureInput.tsx -> @/features/activities/domain/dailyCareTargets',
    'shared/ui/Header.tsx -> @/features/profile/hooks/useFamily',
  ]) {
    text = text.replace(`  '${edge}',\n`, '');
  }

  const marker = "  it('uses a non-AI package identity in package metadata and lockfile', () => {";
  const guard = `  it('keeps feature-owned modules out of legacy shared and global buckets', () => {\n    for (const legacyPath of [\n      join(SRC, 'data', 'expenseCategories.ts'),\n      join(SRC, 'utils', 'expenseMath.ts'),\n      join(SRC, 'shared', 'ui', 'HavenMedicationPicker.tsx'),\n      join(SRC, 'shared', 'ui', 'HavenMilkAmountInput.tsx'),\n      join(SRC, 'shared', 'ui', 'HavenTemperatureInput.tsx'),\n      join(SRC, 'shared', 'ui', 'Header.tsx'),\n    ]) {\n      expect(existsSync(legacyPath), relative(ROOT, legacyPath) + ' should not remain').toBe(false);\n    }\n\n    const globalTypes = readFileSync(join(SRC, 'types', 'index.ts'), 'utf8');\n    for (const ownedType of [\n      'ActivityRecord',\n      'FamilyData',\n      'ProfileMode',\n      'TimelineItem',\n      'TimelineMediaItem',\n      'GrowthHistoryRecord',\n      'GrowthMetric',\n      'StageExpenseData',\n    ]) {\n      expect(globalTypes, ownedType + ' should live with its feature').not.toContain('export interface ' + ownedType);\n      expect(globalTypes, ownedType + ' should live with its feature').not.toContain('export type ' + ownedType);\n    }\n  });\n\n`;
  if (!text.includes('keeps feature-owned modules out of legacy shared and global buckets')) {
    if (!text.includes(marker)) throw new Error('Architecture guard insertion marker is missing');
    text = text.replace(marker, `${guard}${marker}`);
  }
  writeFileSync(file, text);
}

function updateArchitectureDocs() {
  const file = join(ROOT, '..', 'ARCHITECTURE.md');
  let text = readFileSync(file, 'utf8');
  const anchor = 'Shared UI components contain reusable interaction and presentation only. Feature components own domain behavior.\n';
  const addition = `${anchor}\nFeature-owned domain types live with the owning feature and are exported through its public API when another boundary needs them. Do not use the global type barrel as a dumping ground for feature contracts. Domain-specific controls such as feeding, medication, and temperature inputs belong to the Activities feature rather than \`shared/ui\`.\n`;
  if (!text.includes('Do not use the global type barrel as a dumping ground')) {
    if (!text.includes(anchor)) throw new Error('Architecture documentation insertion marker is missing');
    text = text.replace(anchor, addition);
  }
  writeFileSync(file, text);
}

function assertResidue() {
  for (const oldPath of movedModules.keys()) {
    if (existsSync(oldPath)) throw new Error(`Legacy module remains: ${relative(ROOT, oldPath)}`);
  }
  const globalTypes = readFileSync(GLOBAL_TYPES, 'utf8');
  for (const name of TYPE_OWNER.keys()) {
    if (globalTypes.includes(`export interface ${name}`) || globalTypes.includes(`export type ${name}`)) {
      throw new Error(`Feature-owned type remains global: ${name}`);
    }
  }
  for (const file of walk(SRC)) {
    const text = readFileSync(file, 'utf8');
    for (const token of [
      '@/data/expenseCategories',
      '@/utils/expenseMath',
      '@/shared/ui/HavenMedicationPicker',
      '@/shared/ui/HavenMilkAmountInput',
      '@/shared/ui/HavenTemperatureInput',
      '@/shared/ui/Header',
    ]) {
      if (text.includes(token)) throw new Error(`Legacy import ${token} remains in ${relative(ROOT, file)}`);
    }
  }
}

move('src/data/expenseCategories.ts', 'src/features/expenses/domain/expenseCategories.ts');
move('src/utils/expenseMath.ts', 'src/features/expenses/domain/expenseMath.ts');
move('src/shared/ui/HavenMedicationPicker.tsx', 'src/features/activities/components/HavenMedicationPicker.tsx');
move('src/shared/ui/HavenMilkAmountInput.tsx', 'src/features/activities/components/HavenMilkAmountInput.tsx');
move('src/shared/ui/HavenMilkAmountInput.test.tsx', 'src/features/activities/components/HavenMilkAmountInput.test.tsx');
move('src/shared/ui/HavenTemperatureInput.tsx', 'src/features/activities/components/HavenTemperatureInput.tsx');
move('src/shared/ui/HavenTemperatureInput.test.tsx', 'src/features/activities/components/HavenTemperatureInput.test.tsx');
move('src/shared/ui/Header.tsx', 'src/app/components/Header.tsx');

splitGlobalTypes();
updatePublicApis();
rewriteMovedFeatureDependencies();
for (const file of walk(SRC)) rewriteMovedModuleImports(file);
for (const file of walk(SRC)) rewriteGlobalTypeImports(file);
updateArchitectureGuard();
updateArchitectureDocs();
assertResidue();

console.log('Feature ownership migration completed.');

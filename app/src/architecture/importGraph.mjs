import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';

const SOURCE_FILE_PATTERN = /\.[cm]?[jt]sx?$/;
const TEST_FILE_PATTERN = /\.(test|spec)\.[cm]?[jt]sx?$/;

export function productionSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return productionSourceFiles(path);
    if (!entry.isFile()) return [];
    if (TEST_FILE_PATTERN.test(entry.name)) return [];
    return SOURCE_FILE_PATTERN.test(entry.name) ? [path] : [];
  });
}

function moduleSpecifiers(filePath) {
  const sourceFile = ts.createSourceFile(
    filePath,
    readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const specifiers = new Set();

  function add(node) {
    if (node && ts.isStringLiteralLike(node)) specifiers.add(node.text);
  }

  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
      add(node.moduleSpecifier);
    } else if (
      ts.isImportEqualsDeclaration(node)
      && ts.isExternalModuleReference(node.moduleReference)
    ) {
      add(node.moduleReference.expression);
    } else if (ts.isCallExpression(node)) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        add(node.arguments[0]);
      } else if (ts.isIdentifier(node.expression) && node.expression.text === 'require') {
        add(node.arguments[0]);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return [...specifiers];
}

function internalTarget(sourceFile, specifier, srcRoot) {
  if (specifier.startsWith('@/')) return resolve(srcRoot, specifier.slice(2));
  if (specifier.startsWith('.')) return resolve(dirname(sourceFile), specifier);
  return null;
}

function ownerForPath(path, srcRoot) {
  const relativePath = relative(srcRoot, path).replaceAll('\\', '/');
  if (!relativePath || relativePath.startsWith('../')) return null;

  const [boundary, feature] = relativePath.split('/');
  if (boundary === 'features' && feature) return { boundary, feature };
  return { boundary, feature: null };
}

function edge(sourceFile, specifier, srcRoot) {
  return `${relative(srcRoot, sourceFile).replaceAll('\\', '/')} -> ${specifier}`;
}

function isPublicFeatureImport(specifier, feature) {
  return specifier === `@/features/${feature}`;
}

export function findFeatureBoundaryViolations(srcRoot) {
  const violations = [];

  for (const sourceFile of productionSourceFiles(srcRoot)) {
    const sourceOwner = ownerForPath(sourceFile, srcRoot);

    for (const specifier of moduleSpecifiers(sourceFile)) {
      const target = internalTarget(sourceFile, specifier, srcRoot);
      if (!target) continue;

      const targetOwner = ownerForPath(target, srcRoot);
      if (targetOwner?.boundary !== 'features' || !targetOwner.feature) continue;
      if (
        sourceOwner?.boundary === 'features'
        && sourceOwner.feature === targetOwner.feature
      ) {
        continue;
      }

      const dependencyEdge = edge(sourceFile, specifier, srcRoot);
      if (sourceOwner?.boundary === 'shared') {
        violations.push(dependencyEdge);
        continue;
      }

      if (!isPublicFeatureImport(specifier, targetOwner.feature)) {
        violations.push(dependencyEdge);
      }
    }
  }

  return violations.sort();
}

export function findMissingFeaturePublicApis(srcRoot) {
  const featuresRoot = join(srcRoot, 'features');

  return readdirSync(featuresRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((feature) => !existsSync(join(featuresRoot, feature, 'index.ts')))
    .map((feature) => `features/${feature}/index.ts`)
    .sort();
}

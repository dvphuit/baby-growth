import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const SRC_ROOT = join(ROOT, 'src');

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function productionSourceFiles() {
  return walk(SRC_ROOT).filter((path) => {
    if (!/\.(?:ts|tsx)$/.test(path)) return false;
    if (/\.(?:test|spec)\.(?:ts|tsx)$/.test(path)) return false;
    return !path.includes(`${join('src', 'architecture')}`);
  });
}

const MOTION_RESIDUE = [
  /from\s+['"]motion(?:\/react)?['"]/,
  /import\s*\(['"]motion(?:\/react)?['"]\)/,
  /\bmotion\.[A-Za-z]/,
  /\bAnimatePresence\b/,
  /\bLayoutGroup\b/,
  /\bMotionConfig\b/,
];

describe('native animation architecture', () => {
  it('keeps production source free of the Motion runtime API', () => {
    const residues = productionSourceFiles().flatMap((path) => {
      const contents = readFileSync(path, 'utf8');
      if (!MOTION_RESIDUE.some((pattern) => pattern.test(contents))) return [];
      return [relative(ROOT, path)];
    });

    expect(residues, `Motion residues:\n${residues.join('\n')}`).toEqual([]);
  });

  it('keeps Motion out of dependencies and the shared source tree', () => {
    const packageJson = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    const packageLock = JSON.parse(readFileSync(join(ROOT, 'package-lock.json'), 'utf8'));

    expect(packageJson.dependencies?.motion).toBeUndefined();
    expect(packageJson.devDependencies?.motion).toBeUndefined();
    expect(packageLock.packages?.['node_modules/motion']).toBeUndefined();
    expect(existsSync(join(SRC_ROOT, 'shared', 'motion'))).toBe(false);
  });
});

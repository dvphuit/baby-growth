import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const STYLES = join(SRC, 'styles');

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walk(path);
    return entry.isFile() ? [path] : [];
  });
}

function productionSourceText() {
  const files = walk(SRC).filter((file) => {
    if (/\/styles\//.test(file)) return false;
    if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(file)) return false;
    return /\.[cm]?[jt]sx?$/.test(file);
  });
  return files.map((file) => readFileSync(file, 'utf8')).join('\n');
}

function importedStylesheets() {
  const entry = readFileSync(join(STYLES, 'components.css'), 'utf8');
  return [...entry.matchAll(/@import\s+['"]\.\/([^'"]+)['"]/g)].map((match) => match[1]);
}

function classSelectors(css) {
  return new Set([...css.matchAll(/\.([A-Za-z_][A-Za-z0-9_-]*)/g)].map((match) => match[1]));
}

function buildReport() {
  const source = productionSourceText();
  const files = importedStylesheets();
  const selectorsByFile = new Map();
  const filesBySelector = new Map();

  for (const file of files) {
    const selectors = classSelectors(readFileSync(join(STYLES, file), 'utf8'));
    selectorsByFile.set(file, selectors);
    for (const selector of selectors) {
      const owners = filesBySelector.get(selector) ?? [];
      owners.push(file);
      filesBySelector.set(selector, owners);
    }
  }

  const summary = files.map((file) => {
    const selectors = selectorsByFile.get(file) ?? new Set();
    const unused = [...selectors].filter((selector) => !source.includes(selector));
    return {
      file,
      selectors: selectors.size,
      unused: unused.length,
      unusedSample: unused.slice(0, 12),
    };
  });

  const pairCounts = new Map();
  const overlappingSelectors = [];
  for (const [selector, owners] of filesBySelector) {
    if (owners.length < 2) continue;
    overlappingSelectors.push({ selector, owners });
    for (let left = 0; left < owners.length; left += 1) {
      for (let right = left + 1; right < owners.length; right += 1) {
        const key = [owners[left], owners[right]].sort().join(' <> ');
        pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
      }
    }
  }

  const overlaps = [...pairCounts.entries()]
    .map(([pair, count]) => ({ pair, count }))
    .sort((a, b) => b.count - a.count);

  return { summary, overlaps, overlappingSelectors };
}

describe('stylesheet architecture audit', () => {
  it('reports ownership overlap without changing runtime behavior', () => {
    const report = buildReport();
    console.info('[css-architecture-audit]', JSON.stringify({
      files: report.summary,
      overlapPairs: report.overlaps.slice(0, 20),
      overlapSample: report.overlappingSelectors.slice(0, 30),
    }, null, 2));

    expect(report.summary.length).toBeGreaterThan(0);
  });
});

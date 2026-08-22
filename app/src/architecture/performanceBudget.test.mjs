import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const config = readFileSync(join(process.cwd(), 'vite.config.ts'), 'utf8');

describe('build performance budgets', () => {
  it('budgets entry JavaScript, total CSS raw weight, initial CSS gzip, and unbenchmarked WASM', () => {
    expect(config).toContain('ENTRY_CHUNK_BUDGET_BYTES = 500_000');
    expect(config).toContain('ENTRY_GZIP_BUDGET_BYTES = 165_000');
    expect(config).toContain('TOTAL_CSS_BUDGET_BYTES = 250_000');
    expect(config).toContain('INITIAL_CSS_GZIP_BUDGET_BYTES = 40_000');
    expect(config).not.toContain('TOTAL_CSS_GZIP_BUDGET_BYTES');
    expect(config).toContain('importedCssForChunk');
    expect(config).toContain('initialCssFiles.has(output.fileName)');
    expect(config).toContain('WASM_BUNDLE_BUDGET_BYTES = 0');
    expect(config).toContain("output.fileName.endsWith('.css')");
    expect(config).toContain("output.fileName.endsWith('.wasm')");
    expect(config).toContain('Add WASM only with benchmark evidence');
  });
});

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(process.cwd(), 'src/sw.ts'), 'utf8');

describe('service worker auto-update activation', () => {
  it('activates immediately and claims existing clients', () => {
    expect(source).toContain("import { clientsClaim } from 'workbox-core'");
    expect(source).toMatch(/self\.skipWaiting\(\)/);
    expect(source).toMatch(/clientsClaim\(\)/);
  });
});

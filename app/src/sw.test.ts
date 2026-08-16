import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const swPath = fileURLToPath(new URL('./sw.ts', import.meta.url));
const source = readFileSync(swPath, 'utf8');

describe('service worker auto-update activation', () => {
  it('activates immediately and claims existing clients', () => {
    expect(source).toContain("import { clientsClaim } from 'workbox-core'");
    expect(source).toMatch(/self\.skipWaiting\(\)/);
    expect(source).toMatch(/clientsClaim\(\)/);
  });
});

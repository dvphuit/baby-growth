import { describe, expect, it } from 'vitest';
import source from './sw.ts?raw';

describe('service worker auto-update activation', () => {
  it('activates immediately and claims existing clients', () => {
    expect(source).toContain("import { clientsClaim } from 'workbox-core'");
    expect(source).toMatch(/self\.skipWaiting\(\)/);
    expect(source).toMatch(/clientsClaim\(\)/);
  });

  it('refreshes existing app windows when a new worker activates', () => {
    expect(source).toContain("self.addEventListener('activate'");
    expect(source).toMatch(/self\.clients\.matchAll\(\{ type: 'window'/);
    expect(source).toMatch(/navigate\(client\.url\)/);
  });
});

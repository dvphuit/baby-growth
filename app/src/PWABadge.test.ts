import { describe, expect, it } from 'vitest';
import source from './PWABadge.tsx?raw';

describe('PWA update checks', () => {
  it('registers immediately and checks for updates when the app returns to foreground', () => {
    expect(source).toMatch(/immediate\s*:\s*true/);
    expect(source).toContain("document.addEventListener('visibilitychange'");
    expect(source).toContain("window.addEventListener('online'");
    expect(source).toMatch(/\.update\(\)/);
  });
});

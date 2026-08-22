import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

describe('product branding', () => {
  it('keeps the onboarding completion message on Kinly branding', () => {
    const app = readFileSync(join(ROOT, 'src', 'app', 'App.tsx'), 'utf8');

    expect(app).toContain("Chào mừng Ba Mẹ đến với Kinly! Hồ sơ của Bé đã sẵn sàng.");
    expect(app).not.toContain('Chào mừng Ba Mẹ đến với Haven!');
  });
});

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync('src/styles/refactor-primitives.css', 'utf8');

describe('refactored tracker UI styles', () => {
  it('defines the shared primitives used by real-data views', () => {
    const requiredSelectors = [
      '.app-card',
      '.section-header-row',
      '.section-eyebrow',
      '.section-title',
      '.btn-primary-small',
      '.vitals-grid',
      '.vital-item',
      '.vital-label',
      '.empty-state',
      '.timeline-list',
      '.timeline-item-card',
      '.timeline-tag',
      '.timeline-stat-pill',
      '.log-input-control',
    ];

    requiredSelectors.forEach((selector) => {
      expect(css, `${selector} should have a CSS rule`).toContain(selector);
    });
  });
});

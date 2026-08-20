import { describe, expect, it } from 'vitest';
import { havenRouteVariants, havenToastVariants } from './motionPresets';

describe('shared motion presets', () => {
  it('keeps route transitions on compositor-friendly properties', () => {
    expect(havenRouteVariants).toEqual({
      initial: { opacity: 0, y: 6 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -3 },
    });
  });

  it('avoids filter animation on toast transitions', () => {
    expect(havenToastVariants).toEqual({
      hidden: { opacity: 0, y: -14, scale: 0.96 },
      visible: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -8, scale: 0.98 },
    });
  });
});

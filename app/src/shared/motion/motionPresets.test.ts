import { describe, expect, it } from 'vitest';
import {
  havenLayoutTransition,
  havenRouteTransition,
  havenRouteVariants,
  havenSheetVariants,
  havenToastVariants,
} from './motionPresets';

describe('shared motion presets', () => {
  it('keeps route transitions on compositor-friendly properties with a short duration', () => {
    expect(havenRouteVariants).toEqual({
      initial: { opacity: 0, y: 4 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -2 },
    });
    expect(havenRouteTransition).toMatchObject({
      duration: 0.14,
    });
  });

  it('keeps sheet movement on translation without scale animation', () => {
    expect(havenSheetVariants).toEqual({
      hidden: { y: '100%' },
      visible: { y: 0 },
      exit: { y: '100%' },
    });
  });

  it('uses a bounded tween for layout instead of a layout spring', () => {
    expect(havenLayoutTransition).toMatchObject({
      type: 'tween',
      duration: 0.16,
    });
  });

  it('avoids filter animation on toast transitions', () => {
    expect(havenToastVariants).toEqual({
      hidden: { opacity: 0, y: -10, scale: 0.98 },
      visible: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -6, scale: 0.99 },
    });
  });
});

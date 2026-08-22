import { renderHook } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { useThemeColor, getThemeColorForState, THEME_COLORS } from './useThemeColor';

describe('useThemeColor', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('calculates correct theme colors for routes and modals', () => {
    expect(getThemeColorForState('/')).toBe(THEME_COLORS.BABY_APPBAR);
    expect(getThemeColorForState('/timeline')).toBe(THEME_COLORS.BABY_APPBAR);
    expect(getThemeColorForState('/growth')).toBe(THEME_COLORS.BABY_APPBAR);
    expect(getThemeColorForState('/expenses')).toBe(THEME_COLORS.BABY_APPBAR);
    expect(getThemeColorForState('/', false, 'mom')).toBe(THEME_COLORS.MOM_APPBAR);
    expect(getThemeColorForState('/profile')).toBe(THEME_COLORS.CANVAS_LIGHT);
    expect(getThemeColorForState('/', true)).toBe(THEME_COLORS.MODAL_BACKDROP);
    expect(getThemeColorForState('/profile', true)).toBe(THEME_COLORS.MODAL_BACKDROP);
  });

  it('updates meta tag content dynamically on route change', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', '#000000');
    document.head.appendChild(meta);

    const { rerender } = renderHook(
      ({ pathname, isModalOpen, profileMode }: { pathname: string; isModalOpen: boolean; profileMode: 'baby' | 'mom' }) =>
        useThemeColor({ pathname, isModalOpen, profileMode }),
      { initialProps: { pathname: '/', isModalOpen: false, profileMode: 'baby' as 'baby' | 'mom' } },
    );

    expect(meta.getAttribute('content')).toBe(THEME_COLORS.BABY_APPBAR);

    rerender({ pathname: '/', isModalOpen: false, profileMode: 'mom' });
    expect(meta.getAttribute('content')).toBe(THEME_COLORS.MOM_APPBAR);

    rerender({ pathname: '/profile', isModalOpen: false, profileMode: 'mom' });
    expect(meta.getAttribute('content')).toBe(THEME_COLORS.CANVAS_LIGHT);

    rerender({ pathname: '/profile', isModalOpen: true, profileMode: 'mom' });
    expect(meta.getAttribute('content')).toBe(THEME_COLORS.MODAL_BACKDROP);
  });

  it('creates meta tag if one does not exist', () => {
    renderHook(() => useThemeColor({ pathname: '/timeline', isModalOpen: false }));
    const meta = document.querySelector('meta[name="theme-color"]');
    expect(meta).toBeTruthy();
    expect(meta?.getAttribute('content')).toBe(THEME_COLORS.BABY_APPBAR);
  });
});

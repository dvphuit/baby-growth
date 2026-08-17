import { useEffect } from 'react';

interface ThemeColorOptions {
  pathname: string;
  isModalOpen?: boolean;
}

export const THEME_COLORS = {
  HEADER_DARK: '#39261D',
  CANVAS_LIGHT: '#FBF7F2',
  MODAL_BACKDROP: '#201A17',
} as const;

export function getThemeColorForState(pathname: string, isModalOpen?: boolean): string {
  if (isModalOpen) {
    return THEME_COLORS.MODAL_BACKDROP;
  }
  if (pathname === '/profile') {
    return THEME_COLORS.CANVAS_LIGHT;
  }
  return THEME_COLORS.HEADER_DARK;
}

export function useThemeColor({ pathname, isModalOpen }: ThemeColorOptions): void {
  useEffect(() => {
    const targetColor = getThemeColorForState(pathname, isModalOpen);
    let themeMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeMeta) {
      themeMeta = document.createElement('meta');
      themeMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeMeta);
    }
    themeMeta.setAttribute('content', targetColor);
  }, [pathname, isModalOpen]);
}

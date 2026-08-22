import { useEffect } from 'react';

import type { ProfileMode } from '@/features/profile';

interface ThemeColorOptions {
  pathname: string;
  isModalOpen?: boolean;
  profileMode?: ProfileMode;
}

export const THEME_COLORS = {
  BABY_APPBAR: '#FBF7F2',
  MOM_APPBAR: '#FDF7F6',
  CANVAS_LIGHT: '#FBF7F2',
  MODAL_BACKDROP: '#201A17',
} as const;

export function getThemeColorForState(
  pathname: string,
  isModalOpen?: boolean,
  profileMode: ProfileMode = 'baby',
): string {
  if (isModalOpen) {
    return THEME_COLORS.MODAL_BACKDROP;
  }
  if (pathname === '/profile') {
    return THEME_COLORS.CANVAS_LIGHT;
  }
  return profileMode === 'mom' ? THEME_COLORS.MOM_APPBAR : THEME_COLORS.BABY_APPBAR;
}

export function useThemeColor({ pathname, isModalOpen, profileMode }: ThemeColorOptions): void {
  useEffect(() => {
    const targetColor = getThemeColorForState(pathname, isModalOpen, profileMode);
    let themeMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeMeta) {
      themeMeta = document.createElement('meta');
      themeMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeMeta);
    }
    themeMeta.setAttribute('content', targetColor);
  }, [pathname, isModalOpen, profileMode]);
}

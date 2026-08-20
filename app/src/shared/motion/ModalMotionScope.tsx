import type { ReactNode } from 'react';
import { ModalSurfaceLayoutIdContext } from './modalMotionContext';

interface ModalMotionScopeProps {
  layoutId: string;
  children: ReactNode;
}

export function ModalMotionScope({ layoutId, children }: ModalMotionScopeProps) {
  return (
    <ModalSurfaceLayoutIdContext.Provider value={layoutId}>
      {children}
    </ModalSurfaceLayoutIdContext.Provider>
  );
}

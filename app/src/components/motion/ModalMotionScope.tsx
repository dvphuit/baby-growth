import { createContext, useContext, type ReactNode } from 'react';

const ModalSurfaceLayoutIdContext = createContext<string | undefined>(undefined);

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

export function useModalSurfaceLayoutId(): string | undefined {
  return useContext(ModalSurfaceLayoutIdContext);
}

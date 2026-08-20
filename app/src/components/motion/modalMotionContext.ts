import { createContext, useContext } from 'react';

export const ModalSurfaceLayoutIdContext = createContext<string | undefined>(undefined);

export function useModalSurfaceLayoutId(): string | undefined {
  return useContext(ModalSurfaceLayoutIdContext);
}

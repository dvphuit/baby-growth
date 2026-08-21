import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '@/shared/lib/nativeAnimation';

export type NativePresencePhase = 'open' | 'closing';

export function useNativePresence(open: boolean, exitMs = 180): {
  mounted: boolean;
  phase: NativePresencePhase;
} {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    if (!mounted) return;

    const delay = prefersReducedMotion() ? 0 : exitMs;
    if (delay === 0) {
      setMounted(false);
      return;
    }

    const timeoutId = window.setTimeout(() => setMounted(false), delay);
    return () => window.clearTimeout(timeoutId);
  }, [exitMs, mounted, open]);

  return {
    mounted: open || mounted,
    phase: open ? 'open' : 'closing',
  };
}

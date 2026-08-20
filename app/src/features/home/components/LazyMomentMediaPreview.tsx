import { lazy, Suspense, useEffect, useState } from 'react';
import type { MomentMediaPreviewState } from '@/features/timeline/components/MomentMediaPreview';

const PREVIEW_EXIT_RETENTION_MS = 280;
const PREVIEW_PREFETCH_FALLBACK_MS = 1200;

const loadMomentMediaPreview = () => import('@/features/timeline/components/MomentMediaPreview');
const MomentMediaPreview = lazy(async () => ({
  default: (await loadMomentMediaPreview()).MomentMediaPreview,
}));

function schedulePreviewPrefetch(): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const idleId = window.requestIdleCallback(() => { void loadMomentMediaPreview(); }, { timeout: 1600 });
    return () => window.cancelIdleCallback(idleId);
  }

  const timeoutId = window.setTimeout(() => { void loadMomentMediaPreview(); }, PREVIEW_PREFETCH_FALLBACK_MS);
  return () => window.clearTimeout(timeoutId);
}

interface LazyMomentMediaPreviewProps {
  preview: MomentMediaPreviewState | null;
  onClose: () => void;
}

export function LazyMomentMediaPreview({ preview, onClose }: LazyMomentMediaPreviewProps) {
  const [mounted, setMounted] = useState(preview !== null);

  useEffect(() => schedulePreviewPrefetch(), []);

  useEffect(() => {
    if (preview) {
      setMounted(true);
      return;
    }
    if (!mounted) return;

    const timeoutId = window.setTimeout(() => setMounted(false), PREVIEW_EXIT_RETENTION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [mounted, preview]);

  if (!mounted && !preview) return null;

  return (
    <Suspense fallback={null}>
      <MomentMediaPreview preview={preview} onClose={onClose} />
    </Suspense>
  );
}

import { useEffect, useState } from 'react';
import type { ProfileMode } from '@/types';
import { LazyHomeTimelinePreview } from './LazyHomeTimelinePreview';

interface IdleHomeTimelinePreviewProps {
  owner: ProfileMode;
}

export function IdleHomeTimelinePreview({ owner }: IdleHomeTimelinePreviewProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 900 });
      return () => window.cancelIdleCallback(id);
    }

    const id = window.setTimeout(() => setReady(true), 450);
    return () => window.clearTimeout(id);
  }, []);

  if (!ready) return null;

  return <LazyHomeTimelinePreview owner={owner} />;
}

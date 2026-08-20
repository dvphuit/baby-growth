import { useEffect, useState } from 'react';
import type { ProfileMode } from '@/types';
import { LazyHomeTimelinePreview } from './LazyHomeTimelinePreview';

interface IdleHomeTimelinePreviewProps {
  owner: ProfileMode;
  onAddActivity: () => void;
}

export function IdleHomeTimelinePreview({ owner, onAddActivity }: IdleHomeTimelinePreviewProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 900 });
      return () => window.cancelIdleCallback(id);
    }

    const id = window.setTimeout(() => setReady(true), 180);
    return () => window.clearTimeout(id);
  }, []);

  if (!ready) return null;

  return <LazyHomeTimelinePreview owner={owner} onAddActivity={onAddActivity} />;
}

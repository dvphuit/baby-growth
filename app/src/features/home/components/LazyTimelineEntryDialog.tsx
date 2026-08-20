import { lazy, Suspense, useEffect, useState } from 'react';
import type { TimelineEntryDialogProps } from '@/features/timeline/components/TimelineEntryDialog';

const DIALOG_EXIT_RETENTION_MS = 280;
const DIALOG_PREFETCH_FALLBACK_MS = 1200;

const loadTimelineEntryDialog = () => import('@/features/timeline/components/TimelineEntryDialog');
const TimelineEntryDialog = lazy(async () => ({
  default: (await loadTimelineEntryDialog()).TimelineEntryDialog,
}));

function scheduleDialogPrefetch(): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const idleId = window.requestIdleCallback(() => { void loadTimelineEntryDialog(); }, { timeout: 1600 });
    return () => window.cancelIdleCallback(idleId);
  }

  const timeoutId = window.setTimeout(() => { void loadTimelineEntryDialog(); }, DIALOG_PREFETCH_FALLBACK_MS);
  return () => window.clearTimeout(timeoutId);
}

export function LazyTimelineEntryDialog(props: TimelineEntryDialogProps) {
  const [mounted, setMounted] = useState(props.open);

  useEffect(() => scheduleDialogPrefetch(), []);

  useEffect(() => {
    if (props.open) {
      setMounted(true);
      return;
    }
    if (!mounted) return;

    const timeoutId = window.setTimeout(() => setMounted(false), DIALOG_EXIT_RETENTION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [mounted, props.open]);

  if (!mounted && !props.open) return null;

  return (
    <Suspense fallback={null}>
      <TimelineEntryDialog {...props} />
    </Suspense>
  );
}

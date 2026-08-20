import { lazy, Suspense } from 'react';
import type { ProfileMode } from '@/types';

const TimelinePreviewContent = lazy(async () => ({
  default: (await import('./TimelinePreviewContent')).TimelinePreviewContent,
}));

interface HomeTimelineBoundaryProps {
  owner: ProfileMode;
}

export function HomeTimelineBoundary({ owner }: HomeTimelineBoundaryProps) {
  return (
    <Suspense fallback={<div className="route-loading-state" role="status">Đang mở nhật ký…</div>}>
      <TimelinePreviewContent owner={owner} />
    </Suspense>
  );
}

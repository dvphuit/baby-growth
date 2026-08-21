import type { RefObject } from 'react';

interface ProgressiveListBoundaryProps {
  autoLoadAvailable: boolean;
  fallbackLabel: string;
  hasMore: boolean;
  onLoadMore: () => void;
  sentinelRef: RefObject<HTMLDivElement | null>;
}

export function ProgressiveListBoundary({
  autoLoadAvailable,
  fallbackLabel,
  hasMore,
  onLoadMore,
  sentinelRef,
}: ProgressiveListBoundaryProps) {
  if (!hasMore) return null;

  return (
    <div
      ref={sentinelRef}
      className="progressive-list-sentinel"
      aria-hidden={autoLoadAvailable ? true : undefined}
    >
      {!autoLoadAvailable && (
        <button type="button" className="progressive-list-fallback" onClick={onLoadMore}>
          {fallbackLabel}
        </button>
      )}
    </div>
  );
}

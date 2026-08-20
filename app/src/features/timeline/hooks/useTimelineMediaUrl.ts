import { useEffect, useState } from 'react';
import { getLocalMedia } from '@/data/localDb';
import type { TimelineMediaItem } from '@/types';

// Preloading warms an object URL with zero consumers; mounted media components
// own the references that keep it alive. Concurrent blob reads are deduplicated
// separately so Home thumbnails and previews do not hit IndexedDB/Drive twice.
const activeObjectUrls = new Map<string, { url: string; refCount: number }>();
const inFlightMediaLoads = new Map<string, Promise<Blob | null>>();

async function downloadDriveMedia(fileId: string): Promise<Blob | null> {
  const { downloadTimelineMediaFromDrive } = await import('@/features/sync/googleDriveSync');
  return downloadTimelineMediaFromDrive(fileId, { interactive: false });
}

function loadMediaBlob(media: TimelineMediaItem, cacheKey: string): Promise<Blob | null> {
  const existing = inFlightMediaLoads.get(cacheKey);
  if (existing) return existing;

  const pending = (async () => {
    const localBlob = media.blobId ? await getLocalMedia(media.blobId) : null;
    return localBlob ?? (media.driveFileId ? downloadDriveMedia(media.driveFileId) : null);
  })().finally(() => {
    inFlightMediaLoads.delete(cacheKey);
  });
  inFlightMediaLoads.set(cacheKey, pending);
  return pending;
}

export function getCachedTimelineMediaUrl(media?: TimelineMediaItem | null): string | null {
  if (!media) return null;
  const remoteUrl = media.url?.trim() || null;
  if (remoteUrl) return remoteUrl;
  const cacheKey = media.blobId || media.driveFileId;
  return cacheKey ? activeObjectUrls.get(cacheKey)?.url || null : null;
}

export function preloadTimelineMedia(media: TimelineMediaItem): Promise<string | null> {
  const cached = getCachedTimelineMediaUrl(media);
  if (cached) return Promise.resolve(cached);

  const cacheKey = media.blobId || media.driveFileId;
  if (!cacheKey) return Promise.resolve(null);

  return loadMediaBlob(media, cacheKey).then((blob) => {
    if (!blob) return null;
    const existing = activeObjectUrls.get(cacheKey);
    if (existing) return existing.url;
    const url = URL.createObjectURL(blob);
    activeObjectUrls.set(cacheKey, { url, refCount: 0 });
    return url;
  }).catch(() => null);
}

export function useTimelineMediaUrl(media: TimelineMediaItem): string | null {
  const remoteUrl = media.url?.trim() || null;
  const cacheKey = media.blobId || media.driveFileId;
  const initialUrl = remoteUrl || (cacheKey ? activeObjectUrls.get(cacheKey)?.url || null : null);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(initialUrl);

  useEffect(() => {
    if (remoteUrl) {
      setResolvedUrl(remoteUrl);
      return undefined;
    }
    if (!cacheKey) {
      setResolvedUrl(null);
      return undefined;
    }

    let active = true;
    let registeredKey: string | null = null;

    const existing = activeObjectUrls.get(cacheKey);
    if (existing) {
      existing.refCount += 1;
      registeredKey = cacheKey;
      setResolvedUrl(existing.url);
    } else {
      void loadMediaBlob(media, cacheKey).then((blob) => {
        if (!active) return;
        if (!blob) {
          setResolvedUrl(null);
          return;
        }
        const current = activeObjectUrls.get(cacheKey);
        if (current) {
          current.refCount += 1;
          registeredKey = cacheKey;
          setResolvedUrl(current.url);
        } else {
          const objectUrl = URL.createObjectURL(blob);
          activeObjectUrls.set(cacheKey, { url: objectUrl, refCount: 1 });
          registeredKey = cacheKey;
          setResolvedUrl(objectUrl);
        }
      }).catch(() => {
        if (active) setResolvedUrl(null);
      });
    }

    return () => {
      active = false;
      if (registeredKey) {
        const entry = activeObjectUrls.get(registeredKey);
        if (entry) {
          entry.refCount -= 1;
          if (entry.refCount <= 0) {
            activeObjectUrls.delete(registeredKey);
            URL.revokeObjectURL(entry.url);
          }
        }
      }
    };
  }, [cacheKey, media.blobId, media.driveFileId, remoteUrl]);

  return resolvedUrl;
}

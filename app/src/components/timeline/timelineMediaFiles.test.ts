import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readTimelineMediaFiles } from './timelineMediaFiles';

const localMedia = vi.hoisted(() => ({
  setLocalMedia: vi.fn(),
  removeLocalMedia: vi.fn(),
}));

vi.mock('@/services/localDb', () => localMedia);

describe('timelineMediaFiles', () => {
  beforeEach(() => {
    localMedia.setLocalMedia.mockResolvedValue(undefined);
    localMedia.removeLocalMedia.mockResolvedValue(undefined);
  });

  it('persists the original file as a blob and returns only its local id', async () => {
    const file = new File(['image-bytes'], 'baby.jpg', { type: 'image/jpeg' });
    const files = { 0: file, length: 1, item: () => file, [Symbol.iterator]: function* iterator() { yield file; } } as unknown as FileList;

    const [media] = await readTimelineMediaFiles(files);

    expect(localMedia.setLocalMedia).toHaveBeenCalledWith(media.blobId, file);
    expect(media).toMatchObject({ blobId: media.id, type: 'photo', name: 'baby.jpg', focalX: 50, focalY: 38 });
    expect(media.url).toBeUndefined();
  });

  it('rejects oversized media before writing it', async () => {
    const file = new File([new Uint8Array(6 * 1024 * 1024 + 1)], 'large.jpg', { type: 'image/jpeg' });
    const files = { 0: file, length: 1, item: () => file, [Symbol.iterator]: function* iterator() { yield file; } } as unknown as FileList;

    await expect(readTimelineMediaFiles(files)).rejects.toThrow('Ảnh tối đa 6 MB.');
    expect(localMedia.setLocalMedia).not.toHaveBeenCalled();
  });
});

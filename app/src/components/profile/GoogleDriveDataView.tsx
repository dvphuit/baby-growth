import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Cloud, Database, HardDrive, Image as ImageIcon, Images, RefreshCw, ShieldCheck, Trash2, Video,
} from 'lucide-react';
import { AppBar } from '@/components/common/AppBar';
import { HavenDialog } from '@/components/common/HavenDialog';
import {
  checkDriveBackup,
  deleteTimelineMediaFromDrive,
  downloadTimelineMediaFromDrive,
  getLastSyncedAt,
  isGoogleConnected,
  listTimelineMediaFromDrive,
  requestGoogleAccessToken,
  type DriveBackupSummary,
  type DriveTimelineMediaFile,
} from '@/services/googleDriveSync';
import { removeLocalMedia, waitForLocalRecordWrites } from '@/services/localDb';
import { useTimelineStore } from '@/store/useTimelineStore';
import type { TimelineMediaItem } from '@/types';

interface GoogleDriveDataViewProps {
  onOpenLightbox: (src: string, isVideo?: boolean) => void;
  onShowToast?: (message: string, icon?: string) => void;
}

function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return 'Không rõ dung lượng';
  const units = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const amount = value / 1024 ** unitIndex;
  return `${amount >= 10 || unitIndex === 0 ? amount.toFixed(0) : amount.toFixed(1)} ${units[unitIndex]}`;
}

function formatDate(value?: string): string {
  if (!value) return 'Chưa rõ thời gian';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Chưa rõ thời gian';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

function DriveMediaTile({
  file,
  linkedTitle,
  onOpen,
  onDelete,
  onError,
}: {
  file: DriveTimelineMediaFile;
  linkedTitle?: string;
  onOpen: (src: string, isVideo: boolean) => void;
  onDelete: () => void;
  onError: (message: string) => void;
}) {
  const isVideo = file.mimeType.startsWith('video/');
  const [opening, setOpening] = useState(false);
  const objectUrl = useRef<string | null>(null);

  useEffect(() => () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
  }, []);

  const openMedia = async () => {
    if (opening) return;
    setOpening(true);
    try {
      if (!objectUrl.current) {
        const blob = await downloadTimelineMediaFromDrive(file.id, { interactive: true });
        objectUrl.current = URL.createObjectURL(blob);
      }
      if (objectUrl.current) onOpen(objectUrl.current, isVideo);
    } catch (openError) {
      onError(openError instanceof Error ? openError.message : 'Không thể mở media từ Google Drive.');
    } finally {
      setOpening(false);
    }
  };

  return (
    <article className="drive-media-card">
      <button
        type="button"
        className="drive-media-preview"
        onClick={() => void openMedia()}
        aria-label={`Xem ${isVideo ? 'video' : 'ảnh'} ${file.name}`}
        disabled={opening}
      >
        <span className="drive-media-placeholder" aria-hidden="true">{isVideo ? <Video size={24} /> : <ImageIcon size={24} />}</span>
        {file.thumbnailLink && <img src={file.thumbnailLink} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true; }} />}
        <span className="drive-media-kind">{isVideo ? <><Video size={12} /> Video</> : <><ImageIcon size={12} /> Ảnh</>}</span>
      </button>
      <div className="drive-media-info">
        <strong title={file.name}>{file.name}</strong>
        <span>{formatBytes(file.size)} · {formatDate(file.modifiedTime || file.createdTime)}</span>
        <small>{linkedTitle ? `Đang dùng trong “${linkedTitle}”` : 'Không còn liên kết trên thiết bị này'}</small>
      </div>
      <button type="button" className="drive-media-delete" onClick={onDelete} aria-label={`Xóa ${file.name} khỏi Google Drive`}>
        <Trash2 size={16} />
      </button>
    </article>
  );
}

export function GoogleDriveDataView({ onOpenLightbox, onShowToast }: GoogleDriveDataViewProps) {
  const navigate = useNavigate();
  const timelineItems = useTimelineStore((state) => state.timelineItems);
  const [connected, setConnected] = useState(isGoogleConnected());
  const [files, setFiles] = useState<DriveTimelineMediaFile[]>([]);
  const [backup, setBackup] = useState<DriveBackupSummary | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DriveTimelineMediaFile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const linkedMedia = useMemo(() => {
    const result = new Map<string, { title: string; media: TimelineMediaItem[] }>();
    timelineItems.forEach((item) => {
      (item.mediaItems ?? []).forEach((media) => {
        if (!media.driveFileId) return;
        const current = result.get(media.driveFileId);
        result.set(media.driveFileId, {
          title: current?.title ?? item.title,
          media: [...(current?.media ?? []), media],
        });
      });
    });
    return result;
  }, [timelineItems]);

  const totalSize = useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files]);
  const videoCount = useMemo(() => files.filter((file) => file.mimeType.startsWith('video/')).length, [files]);

  const loadDriveData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextFiles, nextBackup, nextLastSyncedAt] = await Promise.all([
        listTimelineMediaFromDrive({ interactive: true }),
        checkDriveBackup(),
        getLastSyncedAt(),
      ]);
      setFiles(nextFiles);
      setBackup(nextBackup);
      setLastSyncedAt(nextLastSyncedAt);
      setConnected(true);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể đọc dữ liệu Google Drive.');
      setConnected(isGoogleConnected());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (connected) void loadDriveData();
  }, [connected, loadDriveData]);

  const connectGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await requestGoogleAccessToken();
      setConnected(true);
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : 'Không thể kết nối Google Drive.');
      setLoading(false);
    }
  };

  const deleteFile = async () => {
    const target = deleteTarget;
    if (!target) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteTimelineMediaFromDrive(target.id, { interactive: true });
      const linked = linkedMedia.get(target.id)?.media ?? [];
      await Promise.all(linked.flatMap((media) => media.blobId ? [removeLocalMedia(media.blobId)] : []));
      if (linked.length > 0) {
        useTimelineStore.setState((state) => ({
          timelineItems: state.timelineItems.map((item) => {
            const mediaItems = (item.mediaItems ?? []).filter((media) => media.driveFileId !== target.id);
            if (mediaItems.length === (item.mediaItems ?? []).length) return item;
            return {
              ...item,
              mediaItems,
              mediaUrl: mediaItems[0]?.url ?? null,
              mediaType: mediaItems[0]?.type ?? null,
            };
          }),
        }));
        await waitForLocalRecordWrites(['babygrowth_v2_timeline']);
      }
      setFiles((current) => current.filter((file) => file.id !== target.id));
      setDeleteTarget(null);
      onShowToast?.('Đã xóa media khỏi Google Drive.', '✓');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Không thể xóa media khỏi Google Drive.');
    } finally {
      setDeleting(false);
    }
  };

  return createPortal(
    <div className="baby-profile-view-container profile-page-overlay drive-data-page">
      <AppBar
        className="profile-app-bar"
        tone="baby"
        variant="page"
        ariaLabel="Quản lý dữ liệu Google Drive"
        start={<button type="button" className="profile-icon-btn" onClick={() => navigate('/profile')} aria-label="Về hồ sơ"><ArrowLeft size={20} /></button>}
        center={<div className="profile-top-heading"><span className="profile-top-eyebrow">DỮ LIỆU RIÊNG TƯ</span><h1>Google Drive</h1></div>}
        end={<button type="button" className="profile-icon-btn" onClick={() => { if (connected) void loadDriveData(); else void connectGoogle(); }} aria-label="Làm mới dữ liệu" disabled={loading}><RefreshCw size={18} className={loading ? 'spin' : ''} /></button>}
      />

      {!connected ? (
        <section className="drive-connect-card">
          <span className="drive-connect-icon"><Cloud size={30} /></span>
          <h2>Kết nối Google Drive</h2>
          <p>Media được lưu trong vùng riêng tư của ứng dụng. Hãy kết nối đúng tài khoản để xem và quản lý.</p>
          <button type="button" className="profile-action-btn primary" onClick={() => void connectGoogle()} disabled={loading}>
            <ShieldCheck size={17} /> {loading ? 'Đang kết nối...' : 'Kết nối Google'}
          </button>
        </section>
      ) : (
        <>
          <section className="drive-data-summary" aria-label="Tổng quan dữ liệu Drive">
            <article><span><Images size={17} /></span><small>Media</small><strong>{files.length}</strong></article>
            <article><span><Video size={17} /></span><small>Video</small><strong>{videoCount}</strong></article>
            <article><span><HardDrive size={17} /></span><small>Dung lượng</small><strong>{formatBytes(totalSize)}</strong></article>
          </section>

          <section className="drive-backup-card">
            <span className="drive-backup-icon"><Database size={19} /></span>
            <div>
              <strong>{backup?.found ? 'Bản sao lưu đang hoạt động' : 'Chưa tìm thấy bản sao lưu'}</strong>
              <span>{lastSyncedAt ? `Đồng bộ gần nhất ${formatDate(lastSyncedAt)}` : 'Chưa có thời gian đồng bộ'}</span>
            </div>
            <ShieldCheck size={18} />
          </section>

          <section className="profile-section-block" aria-labelledby="drive-media-title">
            <div className="profile-section-heading">
              <div><span className="profile-section-kicker">ẢNH VÀ VIDEO</span><h2 id="drive-media-title">Media trên Drive</h2></div>
              <span className="section-score-pill">Riêng tư</span>
            </div>

            {loading && files.length === 0 ? (
              <div className="drive-data-state" role="status"><RefreshCw size={20} className="spin" /><span>Đang đọc dữ liệu Drive...</span></div>
            ) : files.length === 0 ? (
              <div className="drive-data-state"><Cloud size={24} /><strong>Chưa có media trên Drive</strong><span>Ảnh và video sẽ xuất hiện sau lần đồng bộ tiếp theo.</span></div>
            ) : (
              <div className="drive-media-list">
                {files.map((file) => (
                  <DriveMediaTile
                    key={file.id}
                    file={file}
                    linkedTitle={linkedMedia.get(file.id)?.title}
                    onOpen={onOpenLightbox}
                    onDelete={() => setDeleteTarget(file)}
                    onError={setError}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {error && <p className="drive-data-error" role="alert">{error}</p>}

      <HavenDialog
        open={deleteTarget !== null}
        onClose={() => { if (!deleting) setDeleteTarget(null); }}
        title="Xóa media khỏi Drive?"
        description={deleteTarget?.name}
        footer={<><button type="button" className="haven-dialog-secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>Giữ lại</button><button type="button" className="haven-dialog-primary drive-delete-confirm" onClick={() => void deleteFile()} disabled={deleting}><Trash2 size={15} /> {deleting ? 'Đang xóa...' : 'Xóa media'}</button></>}
      >
        <p className="drive-delete-copy">Media sẽ bị xóa khỏi Google Drive và khỏi các khoảnh khắc đang liên kết trên thiết bị này. Thao tác này không thể hoàn tác.</p>
      </HavenDialog>
    </div>,
    document.body,
  );
}

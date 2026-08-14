import { useEffect, useState } from 'react';
import { Cloud, CloudDownload, CloudUpload, RefreshCw, ShieldCheck } from 'lucide-react';
import {
  getLastSyncedAt,
  isGoogleConfigured,
  isGoogleConnected,
  requestGoogleAccessToken,
  resolveSyncConflict,
  syncWithGoogleDrive,
  type SyncResult,
} from '@/services/googleDriveSync';

interface GoogleSyncCardProps {
  onShowToast?: (message: string, icon?: string) => void;
}

function formatSyncTime(value: string | null): string {
  if (!value) return 'Chưa đồng bộ';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export const GoogleSyncCard: React.FC<GoogleSyncCardProps> = ({ onShowToast }) => {
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState(isGoogleConnected());
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [conflict, setConflict] = useState<Extract<SyncResult, { status: 'conflict' }> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLastSyncedAt().then(setLastSyncedAt).catch(() => {});
  }, []);

  const showResult = (result: Exclude<SyncResult, { status: 'conflict' }>) => {
    setLastSyncedAt(new Date().toISOString());
    if (result.status === 'uploaded') onShowToast?.('Đã đẩy dữ liệu lên Google Drive.', '☁️');
    if (result.status === 'downloaded') onShowToast?.('Đã tải dữ liệu mới từ Google Drive. Ứng dụng sẽ tải lại.', '⬇️');
    if (result.status === 'unchanged') onShowToast?.('Dữ liệu trên thiết bị và Google Drive đã đồng nhất.', '✓');
  };

  const handleSync = async () => {
    setBusy(true);
    setError(null);
    try {
      if (!connected) {
        await requestGoogleAccessToken();
        setConnected(true);
      }
      const result = await syncWithGoogleDrive();
      if (result.status === 'conflict') {
        setConflict(result);
      } else {
        showResult(result);
        if (result.status === 'downloaded') window.location.reload();
      }
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : 'Không thể đồng bộ với Google Drive.');
    } finally {
      setBusy(false);
    }
  };

  const handleResolve = async (choice: 'local' | 'remote') => {
    if (!conflict) return;
    setBusy(true);
    setError(null);
    try {
      const result = await resolveSyncConflict(choice, conflict.remote);
      setConflict(null);
      setLastSyncedAt(new Date().toISOString());
      if (result === 'downloaded') {
        onShowToast?.('Đã chọn dữ liệu trên Drive. Ứng dụng sẽ tải lại.', '⬇️');
        window.location.reload();
      } else {
        onShowToast?.('Đã chọn dữ liệu trên thiết bị và ghi đè bản Drive.', '☁️');
      }
    } catch (resolveError) {
      setError(resolveError instanceof Error ? resolveError.message : 'Không thể xử lý xung đột.');
    } finally {
      setBusy(false);
    }
  };

  if (!isGoogleConfigured()) {
    return (
      <div className="profile-section-block">
        <div className="section-title-row">
          <span className="section-main-title"><Cloud size={16} /> Đồng bộ dữ liệu</span>
        </div>
        <div className="profile-medical-card">
          <div className="medical-info-row single">
            <div className="medical-info-item full">
              <div className="medical-item-icon"><ShieldCheck size={15} /></div>
              <div>
                <span className="medical-item-lbl">Google Drive chưa được cấu hình</span>
                <span className="medical-item-val">Thêm VITE_GOOGLE_CLIENT_ID vào file .env.local để bật đồng bộ.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-section-block">
      <div className="section-title-row">
        <span className="section-main-title"><Cloud size={16} /> Đồng bộ dữ liệu</span>
        <span className="section-score-pill">{connected ? 'Đã cấp quyền' : 'Chưa kết nối'}</span>
      </div>

      <div className="profile-medical-card">
        <div className="medical-info-row single">
          <div className="medical-info-item full">
            <div className="medical-item-icon"><ShieldCheck size={15} /></div>
            <div>
              <span className="medical-item-lbl">IndexedDB trên thiết bị + Google Drive</span>
              <span className="medical-item-val">Dữ liệu được lưu cục bộ trước; Drive chỉ giữ bản đồng bộ riêng cho ứng dụng.</span>
            </div>
          </div>
        </div>
        <div className="medical-divider"></div>
        <div className="medical-info-row single">
          <div className="medical-info-item full">
            <div className="medical-item-icon"><RefreshCw size={15} /></div>
            <div>
              <span className="medical-item-lbl">Trạng thái</span>
              <span className="medical-item-val">{formatSyncTime(lastSyncedAt)}</span>
            </div>
          </div>
        </div>

        {conflict && (
          <div className="medical-allergy-box" style={{ marginTop: 16 }}>
            <div className="allergy-header"><RefreshCw size={14} color="#E97332" /> Dữ liệu đã thay đổi ở cả hai nơi</div>
            <p className="summary-desc">Chọn một bản để tiếp tục. Bản còn lại sẽ bị thay thế trên hệ thống tương ứng.</p>
            <div className="profile-action-buttons-group" style={{ marginTop: 12 }}>
              <button className="profile-action-btn primary" onClick={() => handleResolve('local')} disabled={busy}>
                <CloudUpload size={16} /> Giữ dữ liệu trên thiết bị
              </button>
              <button className="profile-action-btn secondary" onClick={() => handleResolve('remote')} disabled={busy}>
                <CloudDownload size={16} /> Dùng dữ liệu trên Drive
              </button>
            </div>
          </div>
        )}

        {error && <p className="summary-desc" style={{ color: '#B45309', marginTop: 12 }}>{error}</p>}

        <button className="profile-action-btn secondary" style={{ marginTop: 16 }} onClick={handleSync} disabled={busy}>
          <RefreshCw size={16} className={busy ? 'spin' : ''} />
          <span>{busy ? 'Đang đồng bộ...' : connected ? 'Đồng bộ với Google Drive' : 'Kết nối Google & đồng bộ'}</span>
        </button>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomSheet } from '@/components/common/BottomSheet';
import { resetTrackingData } from '@/services/trackingDataReset';

interface ResetTrackingDataSectionProps {
  onShowToast?: (msg: string, icon?: string) => void;
}

export function ResetTrackingDataSection({ onShowToast }: ResetTrackingDataSectionProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeConfirmation = () => {
    if (isResetting) return;
    setIsOpen(false);
    setError(null);
  };

  const handleConfirm = async () => {
    if (isResetting) return;
    setIsResetting(true);
    setError(null);

    try {
      const result = await resetTrackingData();
      if (result.status === 'synced') {
        onShowToast?.('Đã đặt lại dữ liệu và đồng bộ Google Drive.', '✓');
      } else {
        onShowToast?.(`Đã đặt lại dữ liệu cục bộ. Cần đồng bộ lại Google Drive: ${result.error}`, '⚠️');
      }
      navigate('/');
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Không thể đặt lại dữ liệu.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <section className="profile-section-block profile-reset-section" aria-labelledby="profile-reset-title">
      <div className="section-title-row">
        <span className="section-main-title" id="profile-reset-title"><AlertTriangle size={16} /> Quản lý dữ liệu</span>
      </div>
      <div className="profile-reset-card">
        <div>
          <p className="profile-reset-heading">Đặt lại dữ liệu theo dõi</p>
          <p className="profile-reset-description">Xóa dữ liệu theo dõi của Bé và Mẹ nhưng vẫn giữ hồ sơ và thông tin lúc sinh.</p>
        </div>
        <button
          type="button"
          className="profile-reset-trigger"
          onClick={() => {
            setError(null);
            setIsOpen(true);
          }}
        >
          <RotateCcw size={16} />
          Đặt lại dữ liệu theo dõi
        </button>
      </div>

      <BottomSheet
        isOpen={isOpen}
        onClose={closeConfirmation}
        title="Xác nhận đặt lại dữ liệu"
        dismissible={!isResetting}
      >
        <div className="profile-reset-confirmation" aria-busy={isResetting}>
          <p className="profile-reset-confirmation-intro">Thao tác này không thể hoàn tác.</p>
          <p className="profile-reset-confirmation-copy">Dữ liệu theo dõi của Bé và Mẹ sẽ bị xóa, bao gồm cữ bú, giấc ngủ, tã, số đo, hoạt động, nhật ký, chi phí, nhắc nhở và trò chuyện với AI.</p>
          <p className="profile-reset-confirmation-copy">Hồ sơ của Bé và Mẹ cùng thông tin lúc sinh vẫn được giữ lại.</p>
          <p className="profile-reset-confirmation-copy">Sau khi đặt lại, bản sao lưu hiện có trên Google Drive sẽ được thay thế bằng dữ liệu mới.</p>
          {error && <p className="profile-reset-error" role="alert">{error}</p>}
          <div className="profile-reset-actions">
            <button type="button" className="profile-reset-cancel" onClick={closeConfirmation} disabled={isResetting}>Hủy</button>
            <button type="button" className="profile-reset-confirm" onClick={handleConfirm} disabled={isResetting}>
              {isResetting ? 'Đang đặt lại dữ liệu…' : 'Xác nhận đặt lại'}
            </button>
          </div>
        </div>
      </BottomSheet>
    </section>
  );
}

import { useUIStore } from '@/store/useUIStore';
import { BottomSheet } from '../common/BottomSheet';
import {
  Milk,
  Moon,
  HeartPulse,
  Baby,
  Ruler,
  Wallet,
  Camera,
  Layers,
} from 'lucide-react';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionType: string) => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const profileMode = useUIStore(s => s.profileMode);
  const isMom = profileMode === 'mom';

  const handleAction = (type: string) => {
    onClose();
    onSelectAction(type);
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Ghi Nhanh ${isMom ? '(Mẹ)' : '(Bé)'}`}
    >
      <div className="quick-log-actions-grid">
        {isMom ? (
          <>
            <div
              className="quick-action-item"
              onClick={() => handleAction('pumping')}
              style={{ cursor: 'pointer' }}
            >
              <div className="action-icon-circle">
                <Milk size={20} color="var(--color-mom-rose)" />
              </div>
              <span className="action-item-label">Hút sữa</span>
            </div>
            <div
              className="quick-action-item"
              onClick={() => handleAction('sleep')}
              style={{ cursor: 'pointer' }}
            >
              <div className="action-icon-circle">
                <Moon size={20} color="#9579EE" />
              </div>
              <span className="action-item-label">Giấc ngủ</span>
            </div>
            <div
              className="quick-action-item"
              onClick={() => handleAction('mood')}
              style={{ cursor: 'pointer' }}
            >
              <div className="action-icon-circle">
                <HeartPulse size={20} color="var(--color-sage-dark)" />
              </div>
              <span className="action-item-label">Tâm lý</span>
            </div>
          </>
        ) : (
          <>
            <div
              className="quick-action-item"
              onClick={() => handleAction('feeding')}
              style={{ cursor: 'pointer' }}
            >
              <div className="action-icon-circle">
                <Baby size={20} color="var(--color-sage-dark)" />
              </div>
              <span className="action-item-label">Cữ bú</span>
            </div>
            <div
              className="quick-action-item"
              onClick={() => handleAction('diaper')}
              style={{ cursor: 'pointer' }}
            >
              <div className="action-icon-circle">
                <Layers size={20} color="#F5B842" />
              </div>
              <span className="action-item-label">Thay tã</span>
            </div>
            <div
              className="quick-action-item"
              onClick={() => handleAction('sleep')}
              style={{ cursor: 'pointer' }}
            >
              <div className="action-icon-circle">
                <Moon size={20} color="#9579EE" />
              </div>
              <span className="action-item-label">Giấc ngủ</span>
            </div>
            <div
              className="quick-action-item"
              onClick={() => handleAction('growth')}
              style={{ cursor: 'pointer' }}
            >
              <div className="action-icon-circle">
                <Ruler size={20} color="var(--color-sage-dark)" />
              </div>
              <span className="action-item-label">Cân đo</span>
            </div>
            <div
              className="quick-action-item"
              onClick={() => handleAction('smart-expense')}
              style={{ cursor: 'pointer' }}
            >
              <div className="action-icon-circle">
                <Wallet size={20} color="#E87A90" />
              </div>
              <span className="action-item-label">Chi tiêu</span>
            </div>
            <div
              className="quick-action-item"
              onClick={() => handleAction('diary')}
              style={{ cursor: 'pointer' }}
            >
              <div className="action-icon-circle">
                <Camera size={20} color="var(--color-primary-dark)" />
              </div>
              <span className="action-item-label">Khoảnh khắc</span>
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: '12px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '11px' }}>
        Chạm một mục để ghi chép nhanh hoặc mở bảng chi tiết
      </div>
    </BottomSheet>
  );
};

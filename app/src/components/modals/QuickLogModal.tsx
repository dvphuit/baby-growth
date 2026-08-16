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
  Pill,
} from 'lucide-react';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionType: string) => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({ isOpen, onClose, onSelectAction }) => {
  const profileMode = useUIStore((state) => state.profileMode);
  const isMom = profileMode === 'mom';

  const handleAction = (type: string) => {
    onClose();
    onSelectAction(type);
  };

  const Action = ({ type, label, icon }: { type: string; label: string; icon: React.ReactNode }) => (
    <button type="button" className="quick-action-item" onClick={() => handleAction(type)} style={{ cursor: 'pointer', border: 0, background: 'transparent' }}>
      <div className="action-icon-circle">{icon}</div>
      <span className="action-item-label">{label}</span>
    </button>
  );

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`Ghi Nhanh ${isMom ? '(Mẹ)' : '(Bé)'}`}>
      <div className="quick-log-actions-grid">
        {isMom ? (
          <>
            <Action type="pumping" label="Hút sữa" icon={<Milk size={20} color="var(--color-mom-rose)" />} />
            <Action type="mom-sleep" label="Giấc ngủ" icon={<Moon size={20} color="#9579EE" />} />
            <Action type="mom-mood" label="Tâm lý" icon={<HeartPulse size={20} color="var(--color-sage-dark)" />} />
          </>
        ) : (
          <>
            <Action type="feeding" label="Cữ bú" icon={<Baby size={20} color="var(--color-sage-dark)" />} />
            <Action type="diaper" label="Thay tã" icon={<Layers size={20} color="#F5B842" />} />
            <Action type="baby-sleep" label="Giấc ngủ" icon={<Moon size={20} color="#9579EE" />} />
            <Action type="medicine" label="Thuốc / vitamin" icon={<Pill size={20} color="#5B8DEF" />} />
            <Action type="growth" label="Cân đo" icon={<Ruler size={20} color="var(--color-sage-dark)" />} />
            <Action type="smart-expense" label="Chi tiêu" icon={<Wallet size={20} color="#E87A90" />} />
            <Action type="diary" label="Khoảnh khắc" icon={<Camera size={20} color="var(--color-primary-dark)" />} />
          </>
        )}
      </div>

      <div style={{ marginTop: '12px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '11px' }}>
        Chạm một mục để ghi chép nhanh hoặc mở bảng chi tiết
      </div>
    </BottomSheet>
  );
};

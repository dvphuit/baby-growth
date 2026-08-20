import { Camera, HeartPulse } from 'lucide-react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import {
  HavenDiaperIcon,
  HavenFeedingIcon,
  HavenIconBadge,
  HavenMedicineIcon,
  HavenPumpingIcon,
  HavenScaleIcon,
  HavenSleepIcon,
  HavenTemperatureIcon,
  HavenWalletIcon,
} from '@/shared/ui/HavenIcons';
import { useUIStore } from '@/store/useUIStore';

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

  const Action = ({
    type,
    label,
    icon,
    tone = 'sage',
  }: {
    type: string;
    label: string;
    icon: React.ReactNode;
    tone?: 'sage' | 'rose' | 'amber' | 'lavender' | 'clay' | 'blue' | 'meadow';
  }) => (
    <button
      type="button"
      className="quick-action-item"
      onClick={() => handleAction(type)}
      style={{ cursor: 'pointer', border: 0, background: 'transparent' }}
    >
      <HavenIconBadge icon={icon} tone={tone} size="lg" />
      <span className="action-item-label" style={{ marginTop: 6 }}>{label}</span>
    </button>
  );

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`Ghi Nhanh ${isMom ? '(Mẹ)' : '(Bé)'}`}>
      <div className="quick-log-actions-grid">
        {isMom ? (
          <>
            <Action type="pumping" label="Hút sữa" icon={<HavenPumpingIcon size={24} />} tone="rose" />
            <Action type="mom-sleep" label="Giấc ngủ" icon={<HavenSleepIcon size={24} />} tone="lavender" />
            <Action
              type="mom-mood"
              label="Tâm lý"
              icon={<HeartPulse size={22} color="var(--color-sage-dark)" />}
              tone="sage"
            />
          </>
        ) : (
          <>
            <Action type="feeding" label="Cữ bú" icon={<HavenFeedingIcon size={24} />} tone="sage" />
            <Action type="diaper" label="Thay tã" icon={<HavenDiaperIcon size={24} />} tone="amber" />
            <Action type="baby-sleep" label="Giấc ngủ" icon={<HavenSleepIcon size={24} />} tone="lavender" />
            <Action type="temperature" label="Nhiệt độ" icon={<HavenTemperatureIcon size={24} />} tone="rose" />
            <Action type="medicine" label="Thuốc / vitamin" icon={<HavenMedicineIcon size={24} />} tone="blue" />
            <Action type="growth" label="Cân đo" icon={<HavenScaleIcon size={24} />} tone="meadow" />
            <Action type="smart-expense" label="Chi tiêu" icon={<HavenWalletIcon size={24} />} tone="clay" />
            <Action
              type="diary"
              label="Khoảnh khắc"
              icon={<Camera size={22} color="var(--color-primary-dark)" />}
              tone="sage"
            />
          </>
        )}
      </div>

      <div style={{ marginTop: '12px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '11px' }}>
        Chạm một mục để ghi chép nhanh hoặc mở bảng chi tiết
      </div>
    </BottomSheet>
  );
};

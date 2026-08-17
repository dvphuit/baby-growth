import { useBabyStore } from '@/store/useBabyStore';
import {
  HavenDiaperIcon,
  HavenFeedingIcon,
  HavenRulerIcon,
  HavenScaleIcon,
  HavenSleepIcon,
  HavenTemperatureIcon,
} from '../common/HavenIcons';

interface VitalsGridProps {
  onOpenAddMeasurement: () => void;
  onOpenQuickLog: () => void;
}

export const VitalsGrid: React.FC<VitalsGridProps> = ({
  onOpenAddMeasurement,
  onOpenQuickLog,
}) => {
  const currentStageData = useBabyStore((s) => s.currentStageData());
  const vitals = currentStageData.todayVitals;

  const items = [
    {
      label: 'Cân nặng',
      value: vitals.weight || '8.6 kg',
      sub: 'Chuẩn WHO P50',
      icon: <HavenScaleIcon size={20} />,
      colorBg: 'var(--color-sage-light)',
      action: onOpenAddMeasurement,
    },
    {
      label: 'Chiều cao',
      value: vitals.height || '71.5 cm',
      sub: '+2.5 cm tháng này',
      icon: <HavenRulerIcon size={20} />,
      colorBg: 'var(--color-overjoyed-bg)',
      action: onOpenAddMeasurement,
    },
    {
      label: 'Giấc ngủ hôm nay',
      value: vitals.sleepTotal || '13.5 giờ',
      sub: 'Đêm 10h • Ngày 3.5h',
      icon: <HavenSleepIcon size={20} />,
      colorBg: 'var(--color-depressed-bg)',
      action: onOpenQuickLog,
    },
    {
      label: 'Lượng sữa hôm nay',
      value: vitals.milkTotal || '780 ml',
      sub: '5 cữ bú mẹ',
      icon: <HavenFeedingIcon size={20} />,
      colorBg: 'var(--color-happy-bg)',
      action: onOpenQuickLog,
    },
    {
      label: 'Tã bỉm',
      value: `${vitals.diaperCount || 5} lần`,
      sub: 'Tiêu hóa tốt',
      icon: <HavenDiaperIcon size={20} />,
      colorBg: 'var(--color-neutral-bg)',
      action: onOpenQuickLog,
    },
    {
      label: 'Thân nhiệt',
      value: vitals.temperature || '36.8 °C',
      sub: 'Bình thường',
      icon: <HavenTemperatureIcon size={20} />,
      colorBg: 'var(--color-sad-bg)',
      action: onOpenQuickLog,
    },
  ];



  return (
    <div className="vitals-section">
      <div className="section-header-row">
        <h3 className="section-title">Chỉ số sinh hoạt hôm nay</h3>
        <button className="section-action-link" onClick={onOpenAddMeasurement}>
          + Cập nhật
        </button>
      </div>

      <div className="vitals-grid-cards">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="vital-card-item"
            onClick={item.action}
            style={{ cursor: 'pointer' }}
          >
            <div className="vital-card-icon-box" style={{ backgroundColor: item.colorBg }}>
              <span>{item.icon}</span>
            </div>
            <div className="vital-card-info">
              <span className="vital-card-label">{item.label}</span>
              <span className="vital-card-value">{item.value}</span>
              <span className="vital-card-sub">{item.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

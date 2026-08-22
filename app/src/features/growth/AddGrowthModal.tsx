import { useState, useId } from 'react';
import {
  ArrowRight,
  Baby,
  Calendar,
  FileText,
  Minus,
  Plus,
  Sparkles,
} from 'lucide-react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { HavenDatePicker } from '@/shared/ui/HavenDatePicker';
import { HavenDropdown } from '@/shared/ui/HavenDropdown';
import { HavenHeadCircIcon, HavenRulerIcon, HavenScaleIcon } from '@/shared/ui/HavenIcons';
import { useGrowthStore } from '@/features/growth/store/useGrowthStore';
import './growth.css';

interface AddGrowthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

export const AddGrowthModal: React.FC<AddGrowthModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const formId = useId();
  const currentStageData = useGrowthStore((state) => state.currentStageData());
  const addGrowthMeasurement = useGrowthStore((state) => state.addGrowthMeasurement);

  const vitals = currentStageData.todayVitals || {};
  const todayStr = new Date().toISOString().split('T')[0];
  const initialWeight = parseFloat(vitals.weight) || 8.6;
  const initialHeight = parseFloat(vitals.height) || 71.5;
  const initialHeadCirc = parseFloat(vitals.headCirc) || 44.2;

  const labels = currentStageData.growthChart?.labels || [
    '0m',
    '2m',
    '4m',
    '6m',
    '8m',
    '10m',
    '12m',
  ];
  const defaultLabelIdx = labels.length >= 5 ? 4 : labels.length - 1;

  const [date, setDate] = useState<string>(todayStr);
  const [milestoneIdx, setMilestoneIdx] = useState<number>(defaultLabelIdx);
  const [weight, setWeight] = useState<number>(initialWeight);
  const [height, setHeight] = useState<number>(initialHeight);
  const [headCirc, setHeadCirc] = useState<number>(initialHeadCirc);
  const [note, setNote] = useState<string>('');

  const whoChart = currentStageData.growthChart;
  const currentP50Weight = whoChart?.weight?.whoP50?.[milestoneIdx] ?? 8.6;
  const currentP50Height = whoChart?.height?.whoP50?.[milestoneIdx] ?? 70.6;
  const currentP50Head = whoChart?.headCirc?.whoP50?.[milestoneIdx] ?? 44.1;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (weight <= 0 && height <= 0) {
      window.alert('Vui lòng nhập ít nhất cân nặng hoặc chiều cao!');
      return;
    }

    addGrowthMeasurement({
      weight,
      height,
      headCirc,
      date,
      note: note.trim() || undefined,
    });

    onSuccessToast(`Đã lưu số đo: ${weight > 0 ? `${weight}kg` : ''} ${height > 0 ? `• ${height}cm` : ''} 📏`);
    onClose();
  };

  const metrics = [
    {
      key: 'weight',
      tone: 'weight',
      icon: <HavenScaleIcon size={22} color="currentColor" secondaryColor="var(--growth-metric-icon-soft)" />,
      label: 'Cân nặng',
      unit: 'kg',
      value: weight,
      benchmark: currentP50Weight,
      step: 0.1,
      min: 0.5,
      onChange: setWeight,
    },
    {
      key: 'height',
      tone: 'height',
      icon: <HavenRulerIcon size={22} color="currentColor" secondaryColor="var(--growth-metric-icon-soft)" />,
      label: 'Chiều cao',
      unit: 'cm',
      value: height,
      benchmark: currentP50Height,
      step: 0.5,
      min: 10,
      onChange: setHeight,
    },
    {
      key: 'head',
      tone: 'head',
      icon: <HavenHeadCircIcon size={22} color="currentColor" secondaryColor="var(--growth-metric-icon-soft)" />,
      label: 'Vòng đầu',
      unit: 'cm',
      value: headCirc,
      benchmark: currentP50Head,
      step: 0.2,
      min: 10,
      onChange: setHeadCirc,
    },
  ] as const;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Cân đo tăng trưởng"
      className="kinly-themed-sheet growth-bottom-sheet"
      footer={
        <button type="submit" form={formId} className="log-btn-primary sheet-primary-action">
          <span>Lưu số đo</span>
          <ArrowRight size={14} />
        </button>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="tracker-sheet-form growth-sheet-form">
        <div className="tracker-sheet-intro">
          <span className="tracker-sheet-intro-icon">
            <HavenScaleIcon size={22} color="currentColor" secondaryColor="rgba(255, 255, 255, 0.18)" />
          </span>
          <div className="tracker-sheet-intro-copy">
            <span className="tracker-sheet-kicker">CẬP NHẬT CHỈ SỐ</span>
            <p>Ghi số đo mới để theo dõi nhịp phát triển của bé theo thời gian.</p>
          </div>
        </div>

        <section className="tracker-sheet-section">
          <div className="tracker-sheet-section-header">
            <span>Thời điểm đo</span>
          </div>
          <div className="tracker-sheet-two-column">
            <div className="log-form-group">
              <label className="log-form-label icon-label"><Calendar size={13} /> Ngày đo</label>
              <HavenDatePicker label="Ngày đo" value={date} onChange={setDate} maxDate={todayStr} />
            </div>
            <div className="log-form-group">
              <label className="log-form-label icon-label"><Baby size={13} /> Cột mốc tháng</label>
              <HavenDropdown
                label="Cột mốc tháng"
                value={milestoneIdx}
                align="end"
                onChange={(value) => setMilestoneIdx(Number(value))}
                options={labels.map((label, index) => ({ value: index, label: `Mốc ${label}` }))}
              />
            </div>
          </div>
        </section>

        <section className="tracker-sheet-section">
          <div className="tracker-sheet-section-header">
            <span>Chỉ số cơ thể</span>
            <small>WHO P50 để tham chiếu</small>
          </div>
          <div className="growth-metric-stack">
            {metrics.map((metric) => (
              <div className={`growth-metric-card tone-${metric.tone}`} key={metric.key}>
                <div className="growth-metric-copy">
                  <span className="growth-metric-icon">{metric.icon}</span>
                  <div>
                    <strong>{metric.label}</strong>
                    <small>P50: {metric.benchmark} {metric.unit}</small>
                  </div>
                </div>
                <div className="growth-stepper-control">
                  <button
                    type="button"
                    className="stepper-btn"
                    aria-label={`Giảm ${metric.label.toLowerCase()}`}
                    onClick={() => metric.onChange((current) => Math.max(metric.min, parseFloat((current - metric.step).toFixed(1))))}
                  >
                    <Minus size={14} />
                  </button>
                  <label className="growth-metric-input-wrap">
                    <input
                      type="number"
                      step={metric.step}
                      className="log-input-control growth-metric-input"
                      value={metric.value}
                      onChange={(event) => metric.onChange(parseFloat(event.target.value) || 0)}
                      aria-label={`${metric.label} (${metric.unit})`}
                    />
                    <span>{metric.unit}</span>
                  </label>
                  <button
                    type="button"
                    className="stepper-btn"
                    aria-label={`Tăng ${metric.label.toLowerCase()}`}
                    onClick={() => metric.onChange((current) => parseFloat((current + metric.step).toFixed(1)))}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="growth-reference-box" id="growthWhoReference">
          <span className="growth-reference-icon"><Sparkles size={18} /></span>
          <div className="growth-reference-text">
            <strong>Mốc WHO {labels[milestoneIdx]}</strong>
            <span>{currentP50Weight} kg · {currentP50Height} cm · {currentP50Head} cm</span>
          </div>
        </div>

        <section className="tracker-sheet-section">
          <div className="log-form-group sheet-note-field">
            <label className="log-form-label icon-label"><FileText size={13} /> Ghi chú</label>
            <input
              type="text"
              className="log-input-control"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ví dụ: bé ăn tốt, bác sĩ dặn theo dõi cân nặng..."
            />
          </div>
        </section>
      </form>
    </BottomSheet>
  );
};

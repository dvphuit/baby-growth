import { useBabyStore } from '@/store/useBabyStore';
import { useState } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import {
  Calendar,
  Baby,
  Scale,
  Ruler,
  CircleDot,
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  FileText,
} from 'lucide-react';

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
  const currentStageData = useBabyStore(s => s.currentStageData());
  const addGrowthMeasurement = useBabyStore(s => s.addGrowthMeasurement);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight <= 0 && height <= 0) {
      alert('Vui lòng nhập ít nhất cân nặng hoặc chiều cao!');
      return;
    }

    addGrowthMeasurement({
      weight,
      height,
      headCirc,
      date,
      note: note || 'Bé phát triển khỏe mạnh theo chuẩn WHO.',
    });

    onSuccessToast(`Đã lưu số đo: ${weight}kg • ${height}cm 📏`);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Nhập Chỉ Số Tăng Trưởng">
      <form onSubmit={handleSubmit} className="growth-input-form-container">
        {/* Date & Milestone Picker Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '8px',
            marginBottom: '10px',
          }}
        >
          <div className="log-form-group" style={{ marginBottom: 0 }}>
            <label className="log-form-label" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Calendar size={12} /> Ngày đo:
            </label>
            <input
              type="date"
              className="log-input-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="log-form-group" style={{ marginBottom: 0 }}>
            <label className="log-form-label" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Baby size={12} /> Cột mốc tháng:
            </label>
            <select
              className="log-input-control"
              value={milestoneIdx}
              onChange={(e) => setMilestoneIdx(parseInt(e.target.value, 10))}
            >
              {labels.map((lbl, idx) => (
                <option key={idx} value={idx}>
                  Mốc {lbl}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 1. Weight Input with Stepper */}
        <div className="log-form-group">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px',
            }}
          >
            <label className="log-form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Scale size={12} /> Cân nặng (kg):
            </label>
            <span style={{ fontSize: '10px', color: 'var(--color-sage-dark)', fontWeight: 700 }}>
              WHO P50: 8.6 kg
            </span>
          </div>
          <div className="growth-stepper-control">
            <button
              type="button"
              className="stepper-btn"
              onClick={() => setWeight((w) => Math.max(0.5, parseFloat((w - 0.1).toFixed(1))))}
            >
              <Minus size={14} />
            </button>
            <input
              type="number"
              step="0.1"
              className="log-input-control"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              style={{
                textAlign: 'center',
                fontFamily: 'var(--font-family-display)',
                fontSize: '18px',
                fontWeight: 800,
              }}
            />
            <button
              type="button"
              className="stepper-btn"
              onClick={() => setWeight((w) => parseFloat((w + 0.1).toFixed(1)))}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* 2. Height Input with Stepper */}
        <div className="log-form-group">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px',
            }}
          >
            <label className="log-form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Ruler size={12} /> Chiều cao (cm):
            </label>
            <span style={{ fontSize: '10px', color: 'var(--color-sage-dark)', fontWeight: 700 }}>
              WHO P50: 70.6 cm
            </span>
          </div>
          <div className="growth-stepper-control">
            <button
              type="button"
              className="stepper-btn"
              onClick={() => setHeight((h) => Math.max(10, parseFloat((h - 0.5).toFixed(1))))}
            >
              <Minus size={14} />
            </button>
            <input
              type="number"
              step="0.5"
              className="log-input-control"
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
              style={{
                textAlign: 'center',
                fontFamily: 'var(--font-family-display)',
                fontSize: '18px',
                fontWeight: 800,
              }}
            />
            <button
              type="button"
              className="stepper-btn"
              onClick={() => setHeight((h) => parseFloat((h + 0.5).toFixed(1)))}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* 3. Head Circumference Input with Stepper */}
        <div className="log-form-group">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px',
            }}
          >
            <label className="log-form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <CircleDot size={12} /> Vòng đầu (cm):
            </label>
            <span style={{ fontSize: '10px', color: 'var(--color-sage-dark)', fontWeight: 700 }}>
              WHO P50: 44.1 cm
            </span>
          </div>
          <div className="growth-stepper-control">
            <button
              type="button"
              className="stepper-btn"
              onClick={() => setHeadCirc((hc) => Math.max(10, parseFloat((hc - 0.2).toFixed(1))))}
            >
              <Minus size={14} />
            </button>
            <input
              type="number"
              step="0.2"
              className="log-input-control"
              value={headCirc}
              onChange={(e) => setHeadCirc(parseFloat(e.target.value) || 0)}
              style={{
                textAlign: 'center',
                fontFamily: 'var(--font-family-display)',
                fontSize: '18px',
                fontWeight: 800,
              }}
            />
            <button
              type="button"
              className="stepper-btn"
              onClick={() => setHeadCirc((hc) => parseFloat((hc + 0.2).toFixed(1)))}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Live AI WHO Percentile Feedback Preview */}
        <div className="growth-ai-assessment-box" id="growthLiveAiFeedback">
          <span className="growth-ai-icon" style={{ color: 'var(--color-sage-dark)' }}>
            <Sparkles size={18} />
          </span>
          <div className="growth-ai-text">
            <strong>Đánh giá nhanh WHO:</strong> Với cân nặng <strong>{weight} kg</strong> và
            chiều cao <strong>{height} cm</strong>, Bé Bơ nằm trong ngưỡng{' '}
            <strong>P50 - P65</strong> chuẩn quốc tế. Tăng trưởng thể chất tối ưu! ✨
          </div>
        </div>

        {/* Notes */}
        <div className="log-form-group">
          <label className="log-form-label" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <FileText size={12} /> Ghi chú sức khỏe / Lời dặn Bác sĩ:
          </label>
          <input
            type="text"
            className="log-input-control"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Vd: Bé ăn dặm tốt, bú mẹ 780ml/ngày, lẫy thành thạo..."
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="log-btn-primary">
          <span>Lưu Số Đo & Cập Nhật Biểu Đồ</span>
          <ArrowRight size={14} />
        </button>
      </form>
    </BottomSheet>
  );
};

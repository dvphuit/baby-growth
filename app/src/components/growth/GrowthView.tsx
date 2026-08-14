import { useBabyStore } from '@/store/useBabyStore';
import { useState } from 'react';
import { useTimelineStore } from '@/store/useTimelineStore';
import { WHOChart } from './WHOChart';
import type { MotorMilestoneItem } from '../../types';
import { BottomSheet } from '../common/BottomSheet';
import {
  Sparkles,
  Ruler,
  Scale,
  CircleDot,
  TrendingUp,
  Plus,
  Check,
  ClipboardList,
  Calendar,
  MessageSquare,
  Hand,
  Footprints,
  Eye,
  MessageCircle,
  Trophy,
} from 'lucide-react';

interface GrowthViewProps {
  onOpenAddMeasurement: () => void;
}

export const GrowthView: React.FC<GrowthViewProps> = ({ onOpenAddMeasurement }) => {
  const currentStageData = useBabyStore(s => s.currentStageData());
  const addTimelineItem = useTimelineStore(s => s.addTimelineItem);
  const [growthMetric, setGrowthMetric] = useState<'weight' | 'height' | 'headCirc'>('weight');

  const [selectedMilestone, setSelectedMilestone] = useState<MotorMilestoneItem | null>(null);

  const motor = currentStageData.motorMilestones || {
    score: 94,
    scoreLabel: 'Vận động Đạt chuẩn WHO',
    doctorNote: 'Bé phát triển trương lực cơ tốt.',
    items: [],
  };

  const items = motor.items || [];
  const activeItem = items.find((it) => it.status === 'in-progress') || items[0] || {};
  const vitals = currentStageData.todayVitals || {
    weight: '8.6 kg',
    height: '71.5 cm',
    headCirc: '44.2 cm',
  };
  const historyList = currentStageData.growthHistory || [];

  const handleMilestoneComplete = (milestone: MotorMilestoneItem) => {
    addTimelineItem({
      type: 'milestone',
      title: `Cột mốc mới: ${milestone.name} 🎉`,
      content: `Bé Bơ đã xuất sắc hoàn thành cột mốc vận động: ${milestone.name}!`,
      tag: 'Cột mốc',
      tagType: 'milestone',
    });
    setSelectedMilestone(null);
  };

  return (
    <div className="growth-view-container">
      {/* 1. REDESIGNED VISUAL MOTOR ROADMAP HERO CARD */}
      <div className="milestones-journey-hero-card">
        <div className="journey-top-row">
          <span className="journey-stage-badge">
            <Sparkles size={11} /> VẬN ĐỘNG • {currentStageData.name.toUpperCase()}
          </span>
          <span className="journey-score-pill">{motor.score}% Chuẩn WHO</span>
        </div>

        <div className="journey-spotlight-title">
          Đang rèn luyện: {activeItem.name ? activeItem.name.split(' ')[0] : 'Bò'} 🐛
        </div>
        <div className="journey-spotlight-desc">{motor.doctorNote}</div>

        {/* Horizontal Connected Roadmap Trail (4 Stations) */}
        <div className="roadmap-trail-container">
          <div className="roadmap-trail-line">
            <div className="roadmap-trail-progress-fill" style={{ width: '70%' }}></div>
          </div>

          {items.map((step) => {
            const isDone = step.status === 'completed';
            const isActive = step.status === 'in-progress';

            return (
              <div
                key={step.id}
                className="roadmap-station-node"
                onClick={() => setSelectedMilestone(step)}
                style={{ cursor: 'pointer' }}
              >
                <div
                  className={`station-circle ${
                    isDone ? 'done' : isActive ? 'active-step' : 'locked'
                  }`}
                >
                  <span style={{ fontSize: '14px' }}>{step.icon}</span>
                  {isDone && (
                    <div className="station-check-badge">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <span className="station-name-lbl">{step.name.split(' ')[0]}</span>
                <span className="station-status-text">
                  {isDone ? 'Đã đạt' : isActive ? 'Đang tập' : 'Sắp tới'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Buttons in Hero Card */}
        <div className="journey-action-bar">
          <button
            className="journey-btn-secondary"
            id="btnHeroOpenGrowthInput"
            onClick={onOpenAddMeasurement}
          >
            <Ruler size={13} />
            <span>Nhập số đo</span>
          </button>
          <button
            className="journey-btn-primary"
            id="btnLogMilestoneGrowth"
            onClick={() => setSelectedMilestone(activeItem as MotorMilestoneItem)}
          >
            <Trophy size={13} />
            <span>Đạt mốc</span>
          </button>
        </div>
      </div>

      {/* 2. CURRENT GROWTH VITALS SUMMARY GRID */}
      <div className="section-title-row" style={{ marginTop: '4px', marginBottom: '8px' }}>
        <span className="section-main-title">Chỉ Số Thể Trạng Hiện Tại</span>
        <button
          className="calendar-add-entry-btn"
          id="btnQuickAddVitals"
          onClick={onOpenAddMeasurement}
        >
          <Plus size={11} strokeWidth={2.4} />
          <span>Ghi nhận mới</span>
        </button>
      </div>

      <div className="growth-vitals-grid">
        <div
          className="growth-vital-card"
          id="cardVitalWeight"
          title="Nhấn để cập nhật cân nặng"
          onClick={onOpenAddMeasurement}
          style={{ cursor: 'pointer' }}
        >
          <span className="vital-card-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Scale size={13} color="var(--color-sage-dark)" /> Cân nặng
          </span>
          <span className="vital-card-value">{vitals.weight || '8.6 kg'}</span>
          <span className="vital-card-badge">P50 Chuẩn WHO</span>
        </div>
        <div
          className="growth-vital-card"
          id="cardVitalHeight"
          title="Nhấn để cập nhật chiều cao"
          onClick={onOpenAddMeasurement}
          style={{ cursor: 'pointer' }}
        >
          <span className="vital-card-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Ruler size={13} color="var(--color-sage-dark)" /> Chiều cao
          </span>
          <span className="vital-card-value">{vitals.height || '71.5 cm'}</span>
          <span className="vital-card-badge">P65 Tối ưu</span>
        </div>
        <div
          className="growth-vital-card"
          id="cardVitalHead"
          title="Nhấn để cập nhật vòng đầu"
          onClick={onOpenAddMeasurement}
          style={{ cursor: 'pointer' }}
        >
          <span className="vital-card-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CircleDot size={13} color="var(--color-sage-dark)" /> Vòng đầu
          </span>
          <span className="vital-card-value">{vitals.headCirc || '44.2 cm'}</span>
          <span className="vital-card-badge">P50 Chuẩn</span>
        </div>
      </div>

      {/* 3. WHO GROWTH PERCENTILES CHARTS CARD */}
      <div className="chart-card-container">
        <div className="card-header-row">
          <div className="card-title">
            <TrendingUp size={15} color="var(--color-sage-dark)" />
            <span>Đồ thị WHO (0 - 18 Tuổi)</span>
          </div>
          <button
            className="btn-chart-add-measurement"
            id="btnOpenGrowthInputChart"
            onClick={onOpenAddMeasurement}
          >
            <Plus size={11} strokeWidth={2.4} />
            <span>Nhập số đo</span>
          </button>
        </div>

        <div className="chart-metric-selector-pills">
          <button
            className={`metric-pill-choice ${growthMetric === 'height' ? 'active' : ''}`}
            onClick={() => setGrowthMetric('height')}
          >
            Chiều cao
          </button>
          <button
            className={`metric-pill-choice ${growthMetric === 'weight' ? 'active' : ''}`}
            onClick={() => setGrowthMetric('weight')}
          >
            Cân nặng
          </button>
          <button
            className={`metric-pill-choice ${growthMetric === 'headCirc' ? 'active' : ''}`}
            onClick={() => setGrowthMetric('headCirc')}
          >
            Vòng đầu
          </button>
        </div>

        <WHOChart chartData={currentStageData.growthChart} metric={growthMetric} />

        <div className="custom-chart-legend">
          <div className="legend-item">
            <div className="legend-dot child"></div>
            <span>Bé Bơ</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot p50"></div>
            <span>P50 Chuẩn</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot p97"></div>
            <span>P97 Cao</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot p3"></div>
            <span>P3 Thấp</span>
          </div>
        </div>
      </div>

      {/* 4. MEASUREMENT HISTORY LOGS LIST */}
      <div className="growth-history-section">
        <div className="growth-history-header">
          <div className="growth-history-title">
            <ClipboardList size={15} color="var(--color-sage-dark)" />
            <span>Lịch Sử Cân Đo ({historyList.length} lần ghi)</span>
          </div>
          <button
            className="calendar-add-entry-btn"
            id="btnHistoryAddGrowth"
            onClick={onOpenAddMeasurement}
          >
            <Plus size={11} strokeWidth={2.4} />
            <span>Thêm lần đo</span>
          </button>
        </div>

        <div className="growth-history-list">
          {historyList.map((item) => (
            <div key={item.id} className="growth-history-card">
              <div className="growth-history-top">
                <span className="growth-history-age">
                  <Sparkles size={12} color="var(--color-sage-dark)" />
                  <span>{item.ageText}</span>
                </span>
                <span className="growth-history-date" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Calendar size={11} /> {item.date}
                </span>
              </div>
              <div className="growth-history-stats-row">
                <span className="growth-stat-chip-val">
                  <Scale size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {item.weight} kg
                </span>
                <span className="growth-stat-chip-val">
                  <Ruler size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {item.height} cm
                </span>
                {item.headCirc && (
                  <span className="growth-stat-chip-val">
                    <CircleDot size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {item.headCirc} cm
                  </span>
                )}
                <span className="vital-card-badge" style={{ margin: 0 }}>
                  {item.percentileLabel || 'Chuẩn WHO'}
                </span>
              </div>
              {item.note && (
                <div className="growth-history-note" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MessageSquare size={11} color="var(--color-text-muted)" />
                  <span>{item.note}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. 4-SKILL DEVELOPMENT MATRIX CARDS */}
      <div className="section-title-row" style={{ marginTop: '6px' }}>
        <span className="section-main-title">Kỹ Năng Vận Động</span>
        <span
          style={{
            fontSize: '10.5px',
            fontWeight: 700,
            color: 'var(--color-sage-dark)',
            cursor: 'pointer',
          }}
        >
          Đánh giá AI
        </span>
      </div>

      <div className="motor-skills-grid">
        <div className="skill-matrix-card">
          <div>
            <div className="skill-card-top">
              <div className="skill-icon-circle">
                <Hand size={15} />
              </div>
              <div className="skill-name-title">Cầm nắm</div>
            </div>
            <div className="skill-rating-stars">★★★★★</div>
          </div>
          <span className="skill-status-tag">Thành thạo</span>
        </div>

        <div className="skill-matrix-card">
          <div>
            <div className="skill-card-top">
              <div className="skill-icon-circle">
                <Footprints size={15} />
              </div>
              <div className="skill-name-title">Đứng vịn</div>
            </div>
            <div className="skill-rating-stars">★★★★☆</div>
          </div>
          <span className="skill-status-tag" style={{ background: '#FEF3E2', color: '#D96938' }}>
            Đang tập
          </span>
        </div>

        <div className="skill-matrix-card">
          <div>
            <div className="skill-card-top">
              <div className="skill-icon-circle">
                <Eye size={15} />
              </div>
              <div className="skill-name-title">Mắt - Tay</div>
            </div>
            <div className="skill-rating-stars">★★★★★</div>
          </div>
          <span className="skill-status-tag">Xuất sắc</span>
        </div>

        <div className="skill-matrix-card">
          <div>
            <div className="skill-card-top">
              <div className="skill-icon-circle">
                <MessageCircle size={15} />
              </div>
              <div className="skill-name-title">Giao tiếp</div>
            </div>
            <div className="skill-rating-stars">★★★★☆</div>
          </div>
          <span className="skill-status-tag">Tốt</span>
        </div>
      </div>

      {/* Milestone Modal */}
      {selectedMilestone && (
        <BottomSheet
          isOpen={Boolean(selectedMilestone)}
          onClose={() => setSelectedMilestone(null)}
          title={selectedMilestone.name}
        >
          <div
            style={{
              background: 'var(--color-canvas)',
              borderRadius: 'var(--radius-lg)',
              padding: '10px 12px',
              marginBottom: '12px',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginBottom: '1px' }}>
              Độ tuổi chuẩn:
            </div>
            <div
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--color-primary-dark)',
              }}
            >
              {selectedMilestone.ageWindow}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                marginTop: '4px',
                lineHeight: 1.4,
              }}
            >
              {selectedMilestone.note}
            </div>
          </div>

          <div
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              color: 'var(--color-primary-dark)',
              marginBottom: '4px',
            }}
          >
            💡 Gợi ý bài tập từ Bác sĩ:
          </div>
          <ul
            style={{
              fontSize: '10.5px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
              paddingLeft: '16px',
              marginBottom: '14px',
            }}
          >
            <li>Tập nằm sấp (Tummy time) 15-20 phút/ngày.</li>
            <li>Đặt đồ chơi cách tầm với 30-40cm để kích thích rướn người.</li>
            <li>Mát-xa nhẹ nhàng cơ đùi và sống lưng sau tắm ấm.</li>
          </ul>

          <button
            className="log-btn-primary"
            onClick={() => handleMilestoneComplete(selectedMilestone)}
          >
            <span>Ghi Nhận Đã Đạt Cột Mốc</span>
            <Check size={16} strokeWidth={2.4} />
          </button>
        </BottomSheet>
      )}
    </div>
  );
};

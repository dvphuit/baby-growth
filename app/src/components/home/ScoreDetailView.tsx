import { useBabyStore } from '@/store/useBabyStore';
import { ChevronLeft, BarChart3 } from 'lucide-react';

interface ScoreDetailViewProps {
  onBack: () => void;
}

export const ScoreDetailView: React.FC<ScoreDetailViewProps> = ({ onBack }) => {
  const currentStageData = useBabyStore(s => s.currentStageData());

  return (
    <div className="score-fullscreen-view">
      <div className="score-full-top-bar">
        <button
          id="btnBackFromScore"
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronLeft size={22} />
        </button>
        <span
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '14.5px',
            fontWeight: 700,
          }}
        >
          Growth Score
        </span>
        <span
          className="status-pill-badge"
          style={{ background: 'rgba(255,255,255,0.25)', color: '#FFFFFF' }}
        >
          Normal
        </span>
      </div>

      <div className="score-full-center-gauge">
        <div className="score-full-huge-number">{currentStageData.growthScore || 92}</div>
        <div className="score-full-status-label">
          {currentStageData.growthScoreLabel || 'Phát triển Tối ưu'}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <button
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--color-primary-dark)',
            color: '#FFFFFF',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          <BarChart3 size={18} />
        </button>
      </div>

      <div className="score-history-sheet">
        <div className="score-history-header">
          <span
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '13.5px',
              fontWeight: 700,
              color: 'var(--color-primary-dark)',
            }}
          >
            Lịch sử Điểm số
          </span>
          <span
            className="card-action-link"
            style={{
              fontSize: '10.5px',
              color: 'var(--color-sage-dark)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Tất cả
          </span>
        </div>

        <div className="score-history-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="score-date-badge">
              <div className="month">TH8</div>
              <div className="day">14</div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-primary-dark)',
                }}
              >
                Phát triển tối ưu
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                Cân nặng 8.6kg, Ăn dặm tốt
              </div>
            </div>
          </div>
          <div className="score-badge-circle-right high">92</div>
        </div>

        <div className="score-history-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="score-date-badge">
              <div className="month">TH8</div>
              <div className="day">11</div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-primary-dark)',
                }}
              >
                Rất khỏe mạnh
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                Ngủ đủ 13.5h, vận động lẫy
              </div>
            </div>
          </div>
          <div className="score-badge-circle-right high">95</div>
        </div>

        <div className="score-history-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="score-date-badge">
              <div className="month">TH8</div>
              <div className="day">08</div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-primary-dark)',
                }}
              >
                Sốt nhẹ sau tiêm 6in1
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                Nhiệt độ 37.8°C, đã hạ sốt
              </div>
            </div>
          </div>
          <div className="score-badge-circle-right">75</div>
        </div>
      </div>
    </div>
  );
};

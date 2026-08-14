import { useBabyStore } from '@/store/useBabyStore';

interface GrowthHistoryProps {
  onOpenAddMeasurement: () => void;
}

export const GrowthHistory: React.FC<GrowthHistoryProps> = ({ onOpenAddMeasurement }) => {
  const currentStageData = useBabyStore(s => s.currentStageData());
  const history = currentStageData.growthHistory || [];

  return (
    <div className="growth-history-section">
      <div className="section-header-row">
        <h3 className="section-title">Lịch sử các lần cân đo</h3>
        <button className="section-action-link" onClick={onOpenAddMeasurement}>
          + Thêm số đo
        </button>
      </div>

      {history.length === 0 ? (
        <div className="empty-history-box">
          <p>Chưa có dữ liệu đo lường. Hãy thêm lần cân đo đầu tiên!</p>
        </div>
      ) : (
        <div className="growth-history-cards-list">
          {history.map((rec) => (
            <div key={rec.id} className="history-record-card">
              <div className="history-card-top">
                <div>
                  <span className="history-age-text">{rec.ageText}</span>
                  <span className="history-date-text">({rec.date})</span>
                </div>
                <span className="history-status-badge optimal">{rec.percentileLabel}</span>
              </div>

              <div className="history-metrics-row">
                <div className="metric-badge-box">
                  <span className="metric-key">⚖️ Cân nặng:</span>
                  <span className="metric-val">{rec.weight} kg</span>
                </div>
                <div className="metric-badge-box">
                  <span className="metric-key">📏 Chiều cao:</span>
                  <span className="metric-val">{rec.height} cm</span>
                </div>
                <div className="metric-badge-box">
                  <span className="metric-key">🧠 Vòng đầu:</span>
                  <span className="metric-val">{rec.headCirc} cm</span>
                </div>
              </div>

              {rec.note && <p className="history-note-text">📝 {rec.note}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

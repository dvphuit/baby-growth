import { useMomStore } from '@/store/useMomStore';

interface MomViewProps {
  onOpenAddPumping: () => void;
  onOpenAiChat: () => void;
}

export const MomView: React.FC<MomViewProps> = ({ onOpenAddPumping, onOpenAiChat }) => {
  const momData = useMomStore(s => s.momData);
  const pumping = momData.pumping;
  const mental = momData.mentalHealth;
  const recovery = momData.recovery;

  return (
    <div className="mom-view-container">
      {/* Mom Wellness Hero Card */}
      <div className="mom-hero-card">
        <div className="mom-hero-top">
          <div>
            <span className="mom-tag-pill">🤱 Chăm sóc Mẹ Sau sinh</span>
            <h3 className="mom-hero-title">{momData.postpartumDay}</h3>
          </div>
          <div className="mom-score-badge">{momData.wellnessScore}% Khỏe mạnh</div>
        </div>
        <p className="mom-hero-desc">
          Tâm sinh lý phục hồi xuất sắc. Chúc mừng Mẹ Thảo đã vượt qua 3 tháng đầu đầy kiên cường!
        </p>
      </div>

      {/* Breast Milk Pumping Tracker Card */}
      <div className="mom-section-card">
        <div className="section-header-row">
          <h4 className="section-title">Theo dõi Vắt / Hút Sữa Mẹ</h4>
          <button className="primary-btn-pill small" onClick={onOpenAddPumping}>
            + Cữ hút sữa
          </button>
        </div>

        <div className="pumping-summary-grid">
          <div className="pumping-stat-box">
            <span className="pump-icon">🥛</span>
            <span className="pump-label">Tổng hôm nay</span>
            <span className="pump-val">{pumping.todayTotal}</span>
            <span className="pump-sub">{pumping.sessionsToday} cữ hút</span>
          </div>

          <div className="pumping-stat-box">
            <span className="pump-icon">⏱️</span>
            <span className="pump-label">Cữ gần nhất</span>
            <span className="pump-val">{pumping.lastSession}</span>
            <span className="pump-sub">{pumping.time}</span>
          </div>

          <div className="pumping-stat-box full-width">
            <span className="pump-icon">❄️</span>
            <span className="pump-label">Tồn kho trữ đông</span>
            <span className="pump-val">{pumping.freezerStock}</span>
            <span className="pump-sub">Đảm bảo nguồn sữa dồi dào khi đi làm lại</span>
          </div>
        </div>

        {/* Recent Pumping History */}
        {pumping.history && pumping.history.length > 0 && (
          <div className="pumping-history-list">
            <span className="pumping-history-title">Các cữ hút hôm nay:</span>
            {pumping.history.slice(0, 4).map((h, idx) => (
              <div key={idx} className="pumping-history-row">
                <span className="pump-hist-time">🕒 {h.time}</span>
                <span className="pump-hist-amount">{h.amount}</span>
                <span className="pump-hist-note">{h.note}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mental Health EPDS Card */}
      <div className="mom-section-card">
        <div className="section-header-row">
          <h4 className="section-title">Sức khỏe Tinh thần & Thang đo EPDS</h4>
          <span className="mental-score-pill">Điểm EPDS: {mental.epdsScore}</span>
        </div>

        <div className="mental-status-banner">
          <span className="mental-emoji">🌸</span>
          <div>
            <h5 className="mental-status-title">{mental.status}</h5>
            <p className="mental-status-desc">
              Thang đo Edinburgh (EPDS) &le; 9 điểm cho thấy tâm lý mẹ hoàn toàn tích cực, không có nguy cơ trầm cảm sau sinh.
            </p>
          </div>
        </div>

        <div className="sleep-debt-row">
          <span>🌙 Giấc ngủ: <strong>{mental.sleepDebt}</strong></span>
          <button className="link-action-btn" onClick={onOpenAiChat}>
            Hỏi mẹo ngủ ngon &rarr;
          </button>
        </div>
      </div>

      {/* Physical Recovery Checklist */}
      <div className="mom-section-card">
        <h4 className="section-title">Hồi phục Thể chất</h4>
        <div className="recovery-items-list">
          <div className="recovery-item-row">
            <span className="rec-check">✓</span>
            <div className="rec-info">
              <span className="rec-label">Co hồi tử cung:</span>
              <span className="rec-val">{recovery.uterusStatus}</span>
            </div>
          </div>
          <div className="recovery-item-row">
            <span className="rec-check">✓</span>
            <div className="rec-info">
              <span className="rec-label">Tình trạng sản dịch:</span>
              <span className="rec-val">{recovery.lochia}</span>
            </div>
          </div>
          <div className="recovery-item-row">
            <span className="rec-check">✓</span>
            <div className="rec-info">
              <span className="rec-label">Cân nặng sau sinh:</span>
              <span className="rec-val">{recovery.weightLoss}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

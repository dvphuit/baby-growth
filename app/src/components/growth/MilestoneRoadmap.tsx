import { useBabyStore } from '@/store/useBabyStore';

export const MilestoneRoadmap: React.FC = () => {
  const currentStageData = useBabyStore(s => s.currentStageData());
  const milestones = currentStageData.motorMilestones;

  if (!milestones || !milestones.items) return null;

  return (
    <div className="milestones-section-wrapper">
      <div className="section-header-row">
        <h3 className="section-title">Lộ trình cột mốc phát triển</h3>
        <span className="milestone-score-pill">{milestones.score}/100 Điểm</span>
      </div>

      <p className="milestone-doctor-note">
        <span>👨‍⚕️</span>
        <span>{milestones.doctorNote}</span>
      </p>

      <div className="milestone-cards-list">
        {milestones.items.map((m) => {
          const isCompleted = m.status === 'completed';
          const isInProgress = m.status === 'in-progress';

          return (
            <div key={m.id} className={`milestone-card-item ${m.status}`}>
              <div className="milestone-icon-circle">{m.icon}</div>
              <div className="milestone-info-box">
                <div className="milestone-row-top">
                  <h5 className="milestone-name">{m.name}</h5>
                  <span
                    className={`milestone-status-badge ${
                      isCompleted ? 'achieved' : isInProgress ? 'progress' : 'upcoming'
                    }`}
                  >
                    {m.statusLabel}
                  </span>
                </div>
                <div className="milestone-window-text">🕒 Mốc chuẩn: {m.ageWindow}</div>
                {m.dateAchieved && (
                  <div className="milestone-achieved-date">
                    ✨ Đạt ngày: <strong>{m.dateAchieved}</strong>
                  </div>
                )}
                <p className="milestone-note-desc">{m.note}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import { Activity, Check, Circle, Clock, Footprints, RotateCw, Sparkles, User } from 'lucide-react';
import { useBabyStore } from '@/store/useBabyStore';

function getMilestoneIcon(id: string) {
  switch (id) {
    case 'roll':
      return <RotateCw size={18} color="var(--color-sage-dark)" />;
    case 'sit':
      return <User size={18} color="var(--color-sage-dark)" />;
    case 'crawl':
    case 'stand_walk':
    case 'run':
      return <Footprints size={18} color="var(--color-sage-dark)" />;
    default:
      return <Activity size={18} color="var(--color-sage-dark)" />;
  }
}

export const MilestoneRoadmap: React.FC = () => {
  const currentStageData = useBabyStore((s) => s.currentStageData());
  const toggleMilestone = useBabyStore((s) => s.toggleMilestone);
  const milestones = currentStageData.motorMilestones;

  if (!milestones || !milestones.items || milestones.items.length === 0) return null;

  const completedCount = milestones.items.filter((item) => item.status === 'completed').length;
  const totalCount = milestones.items.length;

  return (
    <section className="haven-milestones-sheet" aria-labelledby="milestones-heading">
      <div className="haven-sheet-heading">
        <div>
          <span className="haven-eyebrow">CỘT MỐC VẬN ĐỘNG</span>
          <h3 id="milestones-heading">Phát triển thể chất</h3>
        </div>
        <span className="haven-sheet-date">
          Đạt {completedCount}/{totalCount} mốc
        </span>
      </div>

      <div className="haven-milestones-list">
        {milestones.items.map((m) => {
          const isCompleted = m.status === 'completed';
          const isInProgress = m.status === 'in-progress';

          return (
            <article key={m.id} className={`haven-milestone-card ${m.status}`}>
              <div className="haven-milestone-icon-wrap" aria-hidden="true">
                {getMilestoneIcon(m.id)}
              </div>
              <div className="haven-milestone-content">
                <div className="haven-milestone-header">
                  <h4 className="haven-milestone-title">{m.name}</h4>
                  <button
                    type="button"
                    className={`haven-milestone-toggle-btn ${
                      isCompleted ? 'achieved' : isInProgress ? 'progress' : 'upcoming'
                    }`}
                    onClick={() => toggleMilestone(m.id)}
                    aria-label={`Trạng thái: ${m.statusLabel}. Nhấn để thay đổi`}
                  >
                    {isCompleted ? (
                      <>
                        <Check size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                        <span>Đã đạt</span>
                      </>
                    ) : isInProgress ? (
                      <>
                        <Clock size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                        <span>Đang tập</span>
                      </>
                    ) : (
                      <>
                        <Circle size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                        <span>Sắp tới</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="haven-milestone-window">
                  <Clock size={10} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                  <span>Khung tuổi: {m.ageWindow}</span>
                </div>
                {m.dateAchieved && (
                  <span className="haven-milestone-achieved-badge">
                    <Sparkles size={10} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                    <span>Đã đạt ngày {m.dateAchieved}</span>
                  </span>
                )}
                {m.note && <p className="haven-milestone-desc">{m.note}</p>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};



import { useBabyStore } from '@/store/useBabyStore';
import confetti from 'canvas-confetti';

export const DailyHabits: React.FC = () => {
  const dailyHabits = useBabyStore(s => s.dailyHabits);
  const toggleHabit = useBabyStore(s => s.toggleHabit);

  const completedCount = dailyHabits.filter((h) => h.completed).length;
  const totalCount = dailyHabits.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    toggleHabit(id);
    if (!currentlyCompleted && completedCount + 1 === totalCount) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#8DA06F', '#7EAF50', '#F5B842', '#33251F'],
        });
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="habits-section">
      <div className="section-header-row">
        <div className="section-title-with-badge">
          <h3 className="section-title">Lịch trình & Thói quen hôm nay</h3>
          <span className="habit-count-badge">
            {completedCount}/{totalCount}
          </span>
        </div>
        <span className="habit-percent-text">{progressPercent}% Hoàn thành</span>
      </div>

      <div className="habit-progress-bar-container">
        <div
          className="habit-progress-bar-fill"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="habits-list-cards">
        {dailyHabits.map((habit) => (
          <div
            key={habit.id}
            className={`habit-card-item ${habit.completed ? 'completed' : ''}`}
            onClick={() => handleToggle(habit.id, habit.completed)}
          >
            <div className="habit-checkbox-circle">
              {habit.completed ? <span>✓</span> : null}
            </div>
            <div className="habit-icon-span">{habit.icon}</div>
            <div className="habit-content-box">
              <p className="habit-title-text">{habit.title}</p>
              <div className="habit-meta-row">
                <span className="habit-time-text">🕒 {habit.time}</span>
                <span className="habit-tag-pill">{habit.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import { useBabyStore } from '@/store/useBabyStore';
import confetti from 'canvas-confetti';

export const DailyHabits: React.FC = () => {
  const dailyHabits = useBabyStore(s => s.dailyHabits);
  const toggleHabit = useBabyStore(s => s.toggleHabit);

  const completedCount = dailyHabits.filter((habit) => habit.completed).length;
  const totalCount = dailyHabits.length;
  const progressPercent = totalCount > 0
    ? Math.round((completedCount / totalCount) * 100)
    : 0;

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    toggleHabit(id);
    if (!currentlyCompleted && totalCount > 0 && completedCount + 1 === totalCount) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#8DA06F', '#7EAF50', '#F5B842', '#33251F'],
        });
      } catch {
        // Ignore optional celebration failures in environments without canvas support.
      }
    }
  };

  return (
    <section className="habits-section" aria-labelledby="daily-habits-title">
      <div className="section-header-row">
        <div className="section-title-with-badge">
          <h3 id="daily-habits-title" className="section-title">Lịch trình & Thói quen hôm nay</h3>
          <span className="habit-count-badge" aria-label={`${completedCount} trên ${totalCount} việc đã hoàn thành`}>
            {completedCount}/{totalCount}
          </span>
        </div>
        <span className="habit-percent-text" aria-live="polite">
          {totalCount > 0 ? `${progressPercent}% Hoàn thành` : 'Chưa có việc'}
        </span>
      </div>

      <div
        className="habit-progress-bar-container"
        role="progressbar"
        aria-label="Tiến độ thói quen hôm nay"
        aria-valuemin={0}
        aria-valuemax={totalCount || 1}
        aria-valuenow={completedCount}
      >
        <div className="habit-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {totalCount === 0 ? (
        <div className="habits-empty-state" role="status">
          <span className="habits-empty-state-title">Chưa có thói quen hôm nay</span>
          <span className="habits-empty-state-copy">Bạn có thể thêm ghi chép để bắt đầu theo dõi ngày hôm nay.</span>
        </div>
      ) : (
        <div className="habits-list-cards">
          {dailyHabits.map((habit) => (
            <button
              key={habit.id}
              type="button"
              className={`habit-card-item ${habit.completed ? 'completed' : ''}`}
              aria-pressed={habit.completed}
              onClick={() => handleToggle(habit.id, habit.completed)}
            >
              <span className="habit-checkbox-circle" aria-hidden="true">
                {habit.completed ? <span>✓</span> : null}
              </span>
              <span className="habit-icon-span" aria-hidden="true">{habit.icon}</span>
              <span className="habit-content-box">
                <span className="habit-title-text">{habit.title}</span>
                <span className="habit-meta-row">
                  <span className="habit-time-text">🕒 {habit.time}</span>
                  <span className="habit-tag-pill">{habit.category}</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

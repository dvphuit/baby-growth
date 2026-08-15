export interface BabyTodaySummaryProps {
  currentAgeText: string;
  completedHabitsCount: number;
  totalHabitsCount: number;
  todayInsight: string;
  growthScore?: number | null;
  onOpenQuickLog: () => void;
}

export const BabyTodaySummary: React.FC<BabyTodaySummaryProps> = ({ currentAgeText, completedHabitsCount, totalHabitsCount, todayInsight, growthScore, onOpenQuickLog }) => (
  <>
    <div className="section-title-row"><span className="section-main-title">Tóm tắt hôm nay</span><span className="today-progress-badge">{completedHabitsCount}/{totalHabitsCount || 0} việc</span></div>
    <div className="today-summary-card">
      <div className="today-summary-copy">
        <span className="today-summary-eyebrow">Dành cho {currentAgeText}</span>
        <strong>{todayInsight}</strong>
        <span className="today-summary-meta">{growthScore != null ? `Điểm tăng trưởng ${growthScore}/100` : 'Chưa có điểm tăng trưởng'}</span>
      </div>
      <button type="button" className="today-summary-action" onClick={onOpenQuickLog}>+ Ghi chép</button>
    </div>
  </>
);

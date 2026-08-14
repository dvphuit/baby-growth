
interface QuickActionsProps {
  onSelectAction: (actionType: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onSelectAction }) => {
  const actions = [
    { type: 'feeding', icon: '🥑', label: 'Ăn dặm' },
    { type: 'growth', icon: '📏', label: 'Cân đo' },
    { type: 'vaccine', icon: '💉', label: 'Tiêm chủng' },
    { type: 'sleep', icon: '🌙', label: 'Giấc ngủ' },
    { type: 'pumping', icon: '🥛', label: 'Hút sữa' },
  ];

  return (
    <div className="quick-actions-section">
      <div className="section-header-row">
        <h3 className="section-title">Ghi chép nhanh</h3>
      </div>
      <div className="quick-actions-scroll-list">
        {actions.map((act) => (
          <button
            key={act.type}
            className="quick-action-pill-btn"
            onClick={() => onSelectAction(act.type)}
          >
            <span className="quick-action-icon">{act.icon}</span>
            <span className="quick-action-text">{act.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

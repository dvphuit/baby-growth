import { NavLink } from 'react-router-dom';
import { Home, CalendarHeart, TrendingUp, Wallet, Plus } from 'lucide-react';

interface BottomNavProps {
  onOpenQuickLog: () => void;
}

const navItems = [
  { to: '/', label: 'Trang chủ', Icon: Home, id: 'navTabHome' },
  { to: '/timeline', label: 'Nhật ký', Icon: CalendarHeart, id: 'navTabTimeline' },
] as const;

const navItemsRight = [
  { to: '/growth', label: 'Tăng trưởng', Icon: TrendingUp, id: 'navTabGrowth' },
  { to: '/expenses', label: 'Chi tiêu', Icon: Wallet, id: 'navTabExpenses' },
] as const;

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenQuickLog }) => {
  return (
    <nav className="bottom-nav-container">
      {navItems.map(({ to, label, Icon, id }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `nav-tab-item ${isActive ? 'active' : ''}`}
          id={id}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          {({ isActive }) => (
            <>
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              <span className="nav-tab-label">{label}</span>
            </>
          )}
        </NavLink>
      ))}

      {/* Center Floating Action Button (FAB) */}
      <div className="fab-center-wrapper">
        <button
          className="fab-center-btn"
          id="fabCenterBtn"
          title="Ghi chép nhanh"
          onClick={onOpenQuickLog}
        >
          <Plus size={24} strokeWidth={2.6} />
        </button>
      </div>

      {navItemsRight.map(({ to, label, Icon, id }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `nav-tab-item ${isActive ? 'active' : ''}`}
          id={id}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          {({ isActive }) => (
            <>
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              <span className="nav-tab-label">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

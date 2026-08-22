import { memo, type SyntheticEvent } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CalendarHeart, TrendingUp, Wallet, Plus } from 'lucide-react';

interface BottomNavProps {
  onOpenQuickLog: () => void;
  onRouteIntent?: (pathname: string) => void;
}

const navItems = [
  { to: '/', label: 'Trang chủ', Icon: Home, id: 'navTabHome', theme: 'home' },
  { to: '/timeline', label: 'Nhật ký', Icon: CalendarHeart, id: 'navTabTimeline', theme: 'timeline' },
] as const;

const navItemsRight = [
  { to: '/growth', label: 'Tăng trưởng', Icon: TrendingUp, id: 'navTabGrowth', theme: 'growth' },
  { to: '/expenses', label: 'Chi tiêu', Icon: Wallet, id: 'navTabExpenses', theme: 'expenses' },
] as const;

const NavContent = ({ label, Icon, isActive }: { label: string; Icon: typeof Home; isActive: boolean }) => (
  <>
    <span className="nav-tab-active-pill" aria-hidden="true" />
    <span className="nav-tab-icon-motion">
      <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
    </span>
    <span className="nav-tab-label">{label}</span>
  </>
);

export const BottomNav = memo(function BottomNav({ onOpenQuickLog, onRouteIntent }: BottomNavProps) {
  const handleRouteIntent = (event: SyntheticEvent<HTMLAnchorElement>) => {
    const pathname = event.currentTarget.dataset.route;
    if (pathname) onRouteIntent?.(pathname);
  };

  return (
    <nav className="bottom-nav-container">
      {navItems.map(({ to, label, Icon, id, theme }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          viewTransition
          className={({ isActive }) => `nav-tab-item nav-tab-item-${theme} ${isActive ? 'active' : ''}`}
          id={id}
          data-route={to}
          onPointerDown={handleRouteIntent}
          onPointerEnter={handleRouteIntent}
          onFocus={handleRouteIntent}
        >
          {({ isActive }) => <NavContent label={label} Icon={Icon} isActive={isActive} />}
        </NavLink>
      ))}

      <div className="fab-center-wrapper">
        <button
          type="button"
          className="fab-center-btn"
          id="fabCenterBtn"
          title="Ghi chép nhanh"
          aria-label="Ghi chép nhanh"
          onClick={onOpenQuickLog}
        >
          <Plus size={24} strokeWidth={2.6} />
        </button>
      </div>

      {navItemsRight.map(({ to, label, Icon, id, theme }) => (
        <NavLink
          key={to}
          to={to}
          viewTransition
          className={({ isActive }) => `nav-tab-item nav-tab-item-${theme} ${isActive ? 'active' : ''}`}
          id={id}
          data-route={to}
          onPointerDown={handleRouteIntent}
          onPointerEnter={handleRouteIntent}
          onFocus={handleRouteIntent}
        >
          {({ isActive }) => <NavContent label={label} Icon={Icon} isActive={isActive} />}
        </NavLink>
      ))}
    </nav>
  );
});

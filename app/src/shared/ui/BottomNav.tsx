import { NavLink } from 'react-router-dom';
import { Home, CalendarHeart, TrendingUp, Wallet, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { havenPressStrong, havenSnappySpring } from '@/shared/motion/motionPresets';

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

const NavContent = ({ label, Icon, isActive }: { label: string; Icon: typeof Home; isActive: boolean }) => (
  <>
    {isActive && (
      <motion.span
        layoutId="bottom-nav-active-pill"
        className="nav-tab-active-pill"
        transition={havenSnappySpring}
      />
    )}
    <motion.span
      className="nav-tab-icon-motion"
      animate={{ y: isActive ? -2 : 0, scale: isActive ? 1.06 : 1 }}
      transition={havenSnappySpring}
    >
      <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
    </motion.span>
    <motion.span
      className="nav-tab-label"
      animate={{ opacity: isActive ? 1 : 0.72 }}
      transition={{ duration: 0.16 }}
    >
      {label}
    </motion.span>
  </>
);

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
        >
          {({ isActive }) => <NavContent label={label} Icon={Icon} isActive={isActive} />}
        </NavLink>
      ))}

      <div className="fab-center-wrapper">
        <motion.button
          className="fab-center-btn"
          id="fabCenterBtn"
          title="Ghi chép nhanh"
          onClick={onOpenQuickLog}
          whileHover={{ y: -2, scale: 1.05, rotate: 6 }}
          whileTap={havenPressStrong}
          transition={havenSnappySpring}
        >
          <Plus size={24} strokeWidth={2.6} />
        </motion.button>
      </div>

      {navItemsRight.map(({ to, label, Icon, id }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `nav-tab-item ${isActive ? 'active' : ''}`}
          id={id}
        >
          {({ isActive }) => <NavContent label={label} Icon={Icon} isActive={isActive} />}
        </NavLink>
      ))}
    </nav>
  );
};

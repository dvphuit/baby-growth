import { useNavigate } from 'react-router-dom';
/** Haven mobile chrome: compact espresso context bar with matched browser and PWA status color. */
import { useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useMomStore } from '@/store/useMomStore';
import { useFamily } from '@/hooks/useFamily';
import { formatVietnameseDate } from '@/utils/date';
import { Baby, Bell, Calendar, ChevronRight, Heart } from 'lucide-react';

interface HeaderProps {
  onOpenNotifications: () => void;
}

function formatAge(birthDate: string): string {
  const birth = new Date(birthDate);
  if (!Number.isFinite(birth.getTime())) return '';
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) return '';
  if (months < 24) return `${months} tháng`;
  const years = Math.floor(months / 12);
  const restMonths = months % 12;
  return restMonths ? `${years} tuổi ${restMonths} tháng` : `${years} tuổi`;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications }) => {
  const navigate = useNavigate();
  const { profileMode, setProfileMode } = useUIStore();
  const { momData } = useMomStore();
  const family = useFamily();
  const isMom = profileMode === 'mom';
  const name = isMom ? momData.name : family.childName;
  const avatar = isMom ? family.momAvatar : family.childAvatar;
  const todayFormatted = formatVietnameseDate(new Date());
  const ageText = !isMom ? formatAge(family.birthDate) : '';

  useEffect(() => {
    const themeColor = document.querySelector('meta[name="theme-color"]');
    themeColor?.setAttribute('content', '#39261D');
    return () => themeColor?.setAttribute('content', '#FBF7F2');
  }, []);

  return (
    <header className="app-header" id="mainHeader">
      <div className="header-date-row">
        <span className="header-date-text">
          <Calendar size={13} strokeWidth={2.2} />
          <span>{todayFormatted}</span>
        </span>
        <button
          type="button"
          className="header-notification-btn"
          id="btnNotification"
          title="Thông báo"
          aria-label="Mở thông báo"
          onClick={onOpenNotifications}
        >
          <Bell size={15} strokeWidth={2.2} />
        </button>
      </div>

      <div className="header-profile-row">
        <button
          type="button"
          className="header-profile-main"
          onClick={() => navigate('/profile')}
          title="Xem hồ sơ"
          id="btnHeaderProfile"
          style={{ cursor: 'pointer', border: 0, background: 'transparent', textAlign: 'left' }}
        >
          <div className="header-avatar-circle">
            <img className="header-avatar-img" src={avatar} alt={name} />
          </div>
          <div className="header-profile-meta">
            <div className="header-welcome-title">
              <span>{name}</span>
              <ChevronRight size={13} color="var(--color-text-muted)" />
            </div>
            {!isMom && ageText && (
              <div style={{ marginTop: 3, fontSize: 12, color: 'var(--color-text-muted)' }}>{ageText}</div>
            )}
          </div>
        </button>

        <div className="dual-mode-toggle" aria-label="Chọn hồ sơ theo dõi">
          <button className={`dual-mode-btn ${!isMom ? 'active' : ''}`} id="btnModeBaby" onClick={() => setProfileMode('baby')}>
            <Baby size={13} strokeWidth={2.2} /> Bé
          </button>
          <button className={`dual-mode-btn ${isMom ? 'active' : ''}`} id="btnModeMom" onClick={() => setProfileMode('mom')}>
            <Heart size={12} strokeWidth={2.2} /> Mẹ
          </button>
        </div>
      </div>
    </header>
  );
};

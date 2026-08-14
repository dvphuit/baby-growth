import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/store/useUIStore';
import { useBabyStore } from '@/store/useBabyStore';
import { useMomStore } from '@/store/useMomStore';
import { useFamily } from '@/hooks/useFamily';
import { formatVietnameseDate } from '@/utils/date';
import type { StageKey } from '@/types';
import {
  Calendar,
  Stethoscope,
  Bell,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Smile,
  Baby,
  Heart,
  ChevronRight,
} from 'lucide-react';

interface HeaderProps {
  onOpenAiChat: () => void;
  onOpenNotifications: () => void;
}

const STAGES_LIST: { key: StageKey; name: string; age: string }[] = [
  { key: 'stage_0_1', name: 'Sơ sinh', age: '0 - 12m' },
  { key: 'stage_1_5', name: 'Mầm non', age: '1 - 5y' },
  { key: 'stage_6_12', name: 'Tiểu học', age: '6 - 12y' },
  { key: 'stage_13_18', name: 'Dậy thì', age: '13 - 18y' },
];

export const Header: React.FC<HeaderProps> = ({ onOpenAiChat, onOpenNotifications }) => {
  const navigate = useNavigate();
  const { profileMode, setProfileMode, searchQuery, setSearchQuery } = useUIStore();
  const { currentStage, setStage } = useBabyStore();
  const currentStageData = useBabyStore((s) => s.currentStageData());
  const { momData } = useMomStore();
  const family = useFamily();

  const isMom = profileMode === 'mom';
  const name = isMom ? momData.name : family.childName;
  const avatar = isMom ? family.momAvatar : family.childAvatar;
  const scoreVal = isMom ? momData.wellnessScore : (currentStageData.growthScore || 92);
  const todayFormatted = formatVietnameseDate(new Date());

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className="app-header" id="mainHeader">
      {/* Top Date, Live AI Doctor & Notification Row */}
      <div className="header-date-row">
        <span className="header-date-text">
          <Calendar size={13} strokeWidth={2.2} />
          <span>{todayFormatted}</span>
        </span>
        <div className="header-right-actions">
          <button
            className="header-ai-pill-btn"
            id="btnHeaderAiChat"
            title="Hỏi Bác sĩ AI"
            onClick={onOpenAiChat}
          >
            <Stethoscope size={13} strokeWidth={2.2} />
            <span>Bác sĩ AI</span>
            <span className="ai-live-dot"></span>
          </button>
          <div
            className="header-notification-btn"
            id="btnNotification"
            title="Thông báo"
            onClick={onOpenNotifications}
          >
            <Bell size={14} strokeWidth={2.2} />
          </div>
        </div>
      </div>

      {/* User Profile Row */}
      <div className="header-profile-row">
        <div
          className="header-profile-main"
          onClick={handleProfileClick}
          style={{ cursor: 'pointer' }}
          title="Xem hồ sơ chi tiết của bé"
          id="btnHeaderProfile"
        >
          <div className="header-avatar-circle">
            <img className="header-avatar-img" src={avatar} alt={name} />
          </div>
          <div className="header-profile-meta">
            <div className="header-welcome-title">
              <span>Hi, {name}!</span>
              <Sparkles size={12} color="var(--color-sage-dark)" />
              <ChevronRight size={13} color="var(--color-text-muted)" style={{ marginLeft: '1px' }} />
            </div>
            <div className="header-status-pills">
              <span className="status-pill-badge pro">
                <Star size={10} fill="currentColor" /> Pro
              </span>
              <span className="status-pill-badge score">{scoreVal}%</span>
              <span className="status-pill-badge mood">
                <Smile size={11} strokeWidth={2.2} /> Vui vẻ
              </span>
            </div>
          </div>
        </div>

        {/* Dual Mode Pill Toggle */}
        <div className="dual-mode-toggle">
          <button
            className={`dual-mode-btn ${!isMom ? 'active' : ''}`}
            id="btnModeBaby"
            onClick={() => setProfileMode('baby')}
          >
            <Baby size={13} strokeWidth={2.2} /> Bé
          </button>
          <button
            className={`dual-mode-btn ${isMom ? 'active' : ''}`}
            id="btnModeMom"
            onClick={() => setProfileMode('mom')}
          >
            <Heart size={12} strokeWidth={2.2} /> Mẹ
          </button>
        </div>
      </div>

      {/* Pill Search Bar */}
      <div className="header-search-bar">
        <Search size={14} color="var(--color-text-muted)" strokeWidth={2.2} />
        <input
          type="text"
          className="search-input-field"
          placeholder="Tìm cữ bú, chỉ số, lời khuyên..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="search-filter-icon" id="btnSearchFilter" title="Bộ lọc">
          <SlidersHorizontal size={13} strokeWidth={2.2} />
        </span>
      </div>

      {/* Age Simulator (4 Phases) - When in Baby Mode */}
      {!isMom && (
        <div className="age-simulator-wrapper">
          <div className="age-simulator-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={11} color="var(--color-sage-dark)" /> Giả lập độ tuổi (0 - 18 tuổi):
            </span>
            <span style={{ fontSize: '8.5px', color: 'var(--color-sage-dark)', fontWeight: 700 }}>
              Đổi mốc
            </span>
          </div>
          <div className="age-stages-pills">
            {STAGES_LIST.map((stage) => (
              <div
                key={stage.key}
                className={`stage-pill ${currentStage === stage.key ? 'active' : ''}`}
                onClick={() => setStage(stage.key)}
                style={{ cursor: 'pointer' }}
              >
                <span className="stage-name">{stage.name}</span>
                <span className="stage-age">{stage.age}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

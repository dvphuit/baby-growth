import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useBabyStore } from '@/store/useBabyStore';
import { useMomStore } from '@/store/useMomStore';
import { useFamily } from '@/hooks/useFamily';
import { BottomSheet } from './BottomSheet';
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
  const [isStagePickerOpen, setIsStagePickerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { momData } = useMomStore();
  const family = useFamily();

  const isMom = profileMode === 'mom';
  const name = isMom ? momData.name : family.childName;
  const avatar = isMom ? family.momAvatar : family.childAvatar;
  const scoreVal = isMom ? momData.wellnessScore : (currentStageData.growthScore || 92);
  const todayFormatted = formatVietnameseDate(new Date());
  const currentStageMeta = STAGES_LIST.find((stage) => stage.key === currentStage);

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
            title="Mở trợ lý AI"
            onClick={onOpenAiChat}
          >
            <Stethoscope size={13} strokeWidth={2.2} />
            <span>Trợ lý AI</span>
            <span className="ai-live-dot"></span>
          </button>
          <button
            type="button"
            className="header-notification-btn"
            id="btnNotification"
            title="Thông báo"
            aria-label="Mở thông báo"
            onClick={onOpenNotifications}
          >
            <Bell size={14} strokeWidth={2.2} />
          </button>
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

      {/* Compact Search */}
      {isSearchOpen || searchQuery ? (
        <div className="header-search-bar">
          <Search size={14} color="var(--color-text-muted)" strokeWidth={2.2} />
          <input
            autoFocus={isSearchOpen}
            type="text"
            className="search-input-field"
            placeholder="Tìm cữ bú, chỉ số, lời khuyên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="button"
            className="search-filter-icon"
            id="btnSearchFilter"
            title="Đóng tìm kiếm"
            aria-label="Đóng tìm kiếm"
            onClick={() => {
              setSearchQuery('');
              setIsSearchOpen(false);
            }}
          >
            <SlidersHorizontal size={13} strokeWidth={2.2} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="header-search-trigger"
          aria-label="Mở tìm kiếm"
          onClick={() => setIsSearchOpen(true)}
        >
          <Search size={14} color="var(--color-text-muted)" strokeWidth={2.2} />
          <span>Tìm trong nhật ký và lời khuyên</span>
        </button>
      )}

      {/* Compact Age Stage Picker - When in Baby Mode */}
      {!isMom && (
        <>
          <button
            type="button"
            className="header-stage-compact"
            aria-expanded={isStagePickerOpen}
            aria-controls="age-stage-picker"
            onClick={() => setIsStagePickerOpen(true)}
          >
            <span className="header-stage-compact-main">
              <Sparkles size={11} color="var(--color-sage-dark)" />
              <span>{currentStageMeta?.name || 'Chọn giai đoạn'}</span>
            </span>
            <span className="header-stage-compact-age">
              {currentStageData.currentAgeText || currentStageMeta?.age || 'Đổi mốc'}
              <ChevronRight size={12} />
            </span>
          </button>

          <BottomSheet
            isOpen={isStagePickerOpen}
            onClose={() => setIsStagePickerOpen(false)}
            title="Chọn giai đoạn phát triển"
          >
            <p className="stage-picker-description">
              Chọn mốc phù hợp để xem các chỉ số và gợi ý theo độ tuổi của bé.
            </p>
            <div id="age-stage-picker" className="age-stages-pills stage-picker-grid">
              {STAGES_LIST.map((stage) => (
                <button
                  type="button"
                  key={stage.key}
                  className={`stage-pill ${currentStage === stage.key ? 'active' : ''}`}
                  onClick={() => {
                    setStage(stage.key);
                    setIsStagePickerOpen(false);
                  }}
                >
                  <span className="stage-name">{stage.name}</span>
                  <span className="stage-age">{stage.age}</span>
                </button>
              ))}
            </div>
          </BottomSheet>
        </>
      )}
    </header>
  );
};

import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  ChevronRight,
  Droplet,
  Edit3,
  HeartPulse,
  MapPin,
  Ruler,
  Scale,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useBabyStore } from '@/store/useBabyStore';
import { useFamily } from '@/hooks/useFamily';
import { GoogleSyncCard } from './GoogleSyncCard';
import { ResetTrackingDataSection } from './ResetTrackingDataSection';
import { formatDateDisplay } from '@/utils/date';
import { getZodiacSign } from '@/utils/zodiac';
import { getRealGrowthHistory } from '@/domain/growthSelectors';
import { AppBar } from '@/components/common/AppBar';

interface ProfileViewProps {
  onOpenEditProfile: () => void;
  onOpenNotifications: () => void;
  onShowToast?: (msg: string, icon?: string) => void;
}

function parseLocalDate(dateStr: string): Date | null {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isFinite(date.getTime()) ? date : null;
}

function getAgeCopy(dateStr: string): { primary: string; secondary: string } | null {
  const birth = parseLocalDate(dateStr);
  if (!birth) return null;

  const today = new Date();
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (birth > current) return { primary: 'Sắp chào đời', secondary: 'Cả nhà đang chờ con' };

  let months = (current.getFullYear() - birth.getFullYear()) * 12 + current.getMonth() - birth.getMonth();
  let anchor = new Date(birth.getFullYear(), birth.getMonth() + months, birth.getDate());
  if (anchor > current) {
    months -= 1;
    anchor = new Date(birth.getFullYear(), birth.getMonth() + months, birth.getDate());
  }

  const days = Math.max(0, Math.floor((current.getTime() - anchor.getTime()) / 86_400_000));
  const totalDays = Math.max(0, Math.floor((current.getTime() - birth.getTime()) / 86_400_000));
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  let primary = `${totalDays} ngày tuổi`;
  if (years > 0) primary = `${years} tuổi${remainingMonths ? ` ${remainingMonths} tháng` : ''}`;
  else if (months > 0) primary = `${months} tháng${days ? ` ${days} ngày` : ''}`;

  return { primary, secondary: `${totalDays} ngày bên gia đình` };
}

function displayValue(value?: string, fallback = 'Chưa cập nhật'): string {
  return value?.trim() || fallback;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenEditProfile, onOpenNotifications, onShowToast }) => {
  const navigate = useNavigate();
  const family = useFamily();
  const currentStageData = useBabyStore((state) => state.currentStageData());
  const latestGrowth = useMemo(
    () => getRealGrowthHistory(currentStageData.growthHistory)[0] ?? null,
    [currentStageData.growthHistory],
  );
  const age = getAgeCopy(family.birthDate);
  const zodiac = getZodiacSign(family.birthDate);
  const birthVitals = [family.birthWeight, family.birthHeight, family.headCircAtBirth].filter(Boolean).join(' · ');

  const growthMetrics = [
    { key: 'weight', label: 'Cân nặng', value: latestGrowth?.weight, unit: 'kg', Icon: Scale },
    { key: 'height', label: 'Chiều cao', value: latestGrowth?.height, unit: 'cm', Icon: Ruler },
    { key: 'head', label: 'Vòng đầu', value: latestGrowth?.headCirc, unit: 'cm', Icon: HeartPulse },
  ] as const;

  return createPortal(
    <div className="baby-profile-view-container profile-page-overlay">
      <AppBar
        className="profile-app-bar"
        tone="baby"
        variant="page"
        ariaLabel="Điều hướng hồ sơ"
        start={<button type="button" className="profile-icon-btn" onClick={() => navigate('/')} aria-label="Về trang chủ" id="btnBackFromProfile">
          <ArrowLeft size={20} />
        </button>}
        center={<div className="profile-top-heading">
          <span className="profile-top-eyebrow">HỒ SƠ CỦA BÉ</span>
          <h1>Thông tin của {family.childName || 'Bé'}</h1>
        </div>}
        end={<button type="button" className="profile-edit-btn" onClick={onOpenEditProfile} id="btnEditProfileTop">
          <Edit3 size={15} />
          <span>Sửa</span>
        </button>}
      />

      <section className="profile-hero-card" aria-labelledby="profile-child-name">
        <div className="profile-hero-decoration profile-hero-decoration-one" />
        <div className="profile-hero-decoration profile-hero-decoration-two" />
        <div className="profile-avatar-frame">
          <img src={family.childAvatar} alt={`Ảnh của ${family.childName || 'bé'}`} className="profile-avatar-img" />
          <span className="profile-avatar-sparkle" aria-hidden="true"><Sparkles size={14} /></span>
        </div>
        <div className="profile-hero-copy">
          <p className="profile-hero-kicker">BÉ YÊU CỦA CẢ NHÀ</p>
          <h2 id="profile-child-name">{family.childName || 'Bé'}</h2>
          {family.childFullName && <p className="profile-hero-fullname">{family.childFullName}</p>}
          <div className="profile-hero-badges">
            <span>{family.gender === 'boy' ? 'Bé trai' : 'Bé gái'}</span>
            <span>{zodiac}</span>
          </div>
        </div>
        {age && (
          <div className="profile-age-panel">
            <span className="profile-age-label">Tuổi hiện tại</span>
            <strong>{age.primary}</strong>
            <span>{age.secondary}</span>
          </div>
        )}
      </section>

      <section className="profile-section-block" aria-labelledby="profile-growth-title">
        <div className="profile-section-heading">
          <div>
            <span className="profile-section-kicker">CẬP NHẬT GẦN NHẤT</span>
            <h2 id="profile-growth-title">Chỉ số tăng trưởng</h2>
          </div>
          <button type="button" className="profile-text-action" onClick={() => navigate('/growth')}>
            Xem chi tiết <ChevronRight size={15} />
          </button>
        </div>

        <div className={`profile-growth-card ${latestGrowth ? '' : 'is-empty'}`}>
          <div className="profile-growth-grid">
            {growthMetrics.map(({ key, label, value, unit, Icon }) => (
              <div className={`profile-growth-metric ${key}`} key={key}>
                <span className="profile-growth-icon"><Icon size={17} /></span>
                <span className="profile-growth-label">{label}</span>
                <strong>{value ? `${value}` : '—'} <small>{value ? unit : ''}</small></strong>
              </div>
            ))}
          </div>
          <div className="profile-growth-footer">
            <span>{latestGrowth ? `Đo ngày ${formatDateDisplay(latestGrowth.date)}` : 'Chưa có số đo nào được ghi nhận'}</span>
            {!latestGrowth && (
              <button type="button" onClick={() => navigate('/growth')}>Thêm số đo đầu tiên</button>
            )}
          </div>
        </div>
      </section>

      <section className="profile-section-block" aria-labelledby="profile-info-title">
        <div className="profile-section-heading">
          <div>
            <span className="profile-section-kicker">THÔNG TIN CỦA CON</span>
            <h2 id="profile-info-title">Hồ sơ cơ bản</h2>
          </div>
        </div>

        <div className="profile-info-card">
          <div className="profile-info-row">
            <span className="profile-info-icon sage"><CalendarDays size={17} /></span>
            <div><span>Ngày sinh</span><strong>{displayValue(formatDateDisplay(family.birthDate))}{family.birthTime ? ` · ${family.birthTime}` : ''}</strong></div>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-icon clay"><MapPin size={17} /></span>
            <div><span>Nơi sinh</span><strong>{displayValue(family.hospital)}</strong></div>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-icon honey"><Scale size={17} /></span>
            <div><span>Chỉ số lúc chào đời</span><strong>{displayValue(birthVitals)}</strong></div>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-icon rose"><Droplet size={17} /></span>
            <div><span>Nhóm máu</span><strong>{displayValue(family.bloodType)}</strong></div>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-icon sage"><ShieldCheck size={17} /></span>
            <div><span>Dị ứng</span><strong>{family.allergies?.length ? family.allergies.join(', ') : 'Chưa ghi nhận dị ứng'}</strong></div>
          </div>
          {family.notes && (
            <div className="profile-note-box">
              <span>Ghi chú của gia đình</span>
              <p>{family.notes}</p>
            </div>
          )}
        </div>
      </section>

      <section className="profile-section-block" aria-labelledby="profile-care-title">
        <div className="profile-section-heading">
          <div>
            <span className="profile-section-kicker">CHĂM SÓC HẰNG NGÀY</span>
            <h2 id="profile-care-title">Nhắc nhở cho gia đình</h2>
          </div>
        </div>
        <button type="button" className="profile-reminder-card" onClick={onOpenNotifications}>
          <span className="profile-reminder-icon"><Bell size={20} /></span>
          <span className="profile-reminder-copy">
            <strong>Lịch nhắc chăm sóc bé</strong>
            <span>Cữ bú, giấc ngủ, thay tã và lịch hẹn</span>
          </span>
          <ChevronRight size={18} />
        </button>
      </section>

      <GoogleSyncCard onShowToast={onShowToast} />
      <ResetTrackingDataSection onShowToast={onShowToast} />

      <p className="profile-zodiac-note">Cung hoàng đạo chỉ mang tính giải trí, không dùng để đánh giá sức khỏe hoặc đưa ra nhắc nhở chăm sóc.</p>
    </div>,
    document.body,
  );
};

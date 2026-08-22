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
import { useGrowthStore } from '@/features/growth/store/useGrowthStore';
import { useFamily } from '@/features/profile/hooks/useFamily';
import { GoogleSyncCard } from './GoogleSyncCard';
import { ResetTrackingDataSection } from './ResetTrackingDataSection';
import { formatDateDisplay } from '@/utils/date';
import { getZodiacSign } from '@/utils/zodiac';
import { getRealGrowthHistory } from '@/features/growth/domain/growthSelectors';
import { AppBar } from '@/shared/ui/AppBar';
import './ProfileView.css';

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
  const currentStageData = useGrowthStore((state) => state.currentStageData());
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
    <div className="baby-profile-view-container profile-page-overlay baby-profile-v2">
      <AppBar
        className="profile-app-bar baby-profile-v2-appbar"
        tone="baby"
        variant="page"
        ariaLabel="Điều hướng hồ sơ"
        start={(
          <button type="button" className="profile-icon-btn" onClick={() => navigate('/')} aria-label="Về trang chủ" id="btnBackFromProfile">
            <ArrowLeft size={20} />
          </button>
        )}
        center={(
          <div className="profile-top-heading">
            <span className="profile-top-eyebrow">HỒ SƠ CỦA BÉ</span>
            <h1>Thông tin của {family.childName || 'Bé'}</h1>
          </div>
        )}
        end={(
          <button type="button" className="profile-edit-btn" onClick={onOpenEditProfile} id="btnEditProfileTop">
            <Edit3 size={15} />
            <span>Sửa</span>
          </button>
        )}
      />

      <main className="baby-profile-v2-main">
        <section className="baby-profile-v2-identity" aria-labelledby="profile-child-name">
          <div className="baby-profile-v2-avatar-wrap">
            <img src={family.childAvatar} alt={`Ảnh của ${family.childName || 'bé'}`} className="baby-profile-v2-avatar" />
            <span className="baby-profile-v2-sparkle" aria-hidden="true"><Sparkles size={13} /></span>
          </div>

          <div className="baby-profile-v2-identity-copy">
            <div className="baby-profile-v2-name-row">
              <div>
                <span className="baby-profile-v2-overline">Bé yêu của gia đình</span>
                <h2 id="profile-child-name">{family.childName || 'Bé'}</h2>
              </div>
              <button type="button" className="baby-profile-v2-mini-edit" onClick={onOpenEditProfile} aria-label="Chỉnh sửa hồ sơ bé">
                <Edit3 size={15} />
              </button>
            </div>
            {family.childFullName && <p className="baby-profile-v2-fullname">{family.childFullName}</p>}
            <div className="baby-profile-v2-tags">
              <span>{family.gender === 'boy' ? 'Bé trai' : 'Bé gái'}</span>
              <span>{zodiac}</span>
            </div>
          </div>

          {age && (
            <div className="baby-profile-v2-age">
              <span>Tuổi hiện tại</span>
              <strong>{age.primary}</strong>
              <small>{age.secondary}</small>
            </div>
          )}
        </section>

        <section className="baby-profile-v2-section" aria-labelledby="profile-growth-title">
          <div className="baby-profile-v2-section-heading">
            <div>
              <span>Cập nhật gần nhất</span>
              <h2 id="profile-growth-title">Tăng trưởng</h2>
            </div>
            <button type="button" onClick={() => navigate('/growth')}>
              Xem chi tiết <ChevronRight size={16} />
            </button>
          </div>

          <button type="button" className="baby-profile-v2-growth-card" onClick={() => navigate('/growth')} aria-label="Xem chi tiết tăng trưởng">
            <div className="baby-profile-v2-growth-grid">
              {growthMetrics.map(({ key, label, value, unit, Icon }) => (
                <div className={`baby-profile-v2-growth-metric ${key}`} key={key}>
                  <span className="baby-profile-v2-growth-icon"><Icon size={17} /></span>
                  <span>{label}</span>
                  <strong>{value ? `${value}` : '—'} <small>{value ? unit : ''}</small></strong>
                </div>
              ))}
            </div>
            <div className="baby-profile-v2-growth-foot">
              <span>{latestGrowth ? `Đo ngày ${formatDateDisplay(latestGrowth.date)}` : 'Chưa có số đo nào được ghi nhận'}</span>
              <ChevronRight size={17} />
            </div>
          </button>
        </section>

        <section className="baby-profile-v2-section" aria-labelledby="profile-info-title">
          <div className="baby-profile-v2-section-heading">
            <div>
              <span>Thông tin của con</span>
              <h2 id="profile-info-title">Hồ sơ cơ bản</h2>
            </div>
          </div>

          <div className="baby-profile-v2-info-card">
            <article>
              <span className="baby-profile-v2-info-icon sage"><CalendarDays size={18} /></span>
              <div><span>Ngày sinh</span><strong>{displayValue(formatDateDisplay(family.birthDate))}{family.birthTime ? ` · ${family.birthTime}` : ''}</strong></div>
            </article>
            <article>
              <span className="baby-profile-v2-info-icon clay"><MapPin size={18} /></span>
              <div><span>Nơi sinh</span><strong>{displayValue(family.hospital)}</strong></div>
            </article>
            <article>
              <span className="baby-profile-v2-info-icon honey"><Scale size={18} /></span>
              <div><span>Lúc chào đời</span><strong>{displayValue(birthVitals)}</strong></div>
            </article>
            <article>
              <span className="baby-profile-v2-info-icon rose"><Droplet size={18} /></span>
              <div><span>Nhóm máu</span><strong>{displayValue(family.bloodType)}</strong></div>
            </article>
            <article className="baby-profile-v2-info-wide">
              <span className="baby-profile-v2-info-icon sage"><ShieldCheck size={18} /></span>
              <div><span>Dị ứng</span><strong>{family.allergies?.length ? family.allergies.join(', ') : 'Chưa ghi nhận dị ứng'}</strong></div>
            </article>
          </div>

          {family.notes && (
            <div className="baby-profile-v2-note">
              <span>Ghi chú của gia đình</span>
              <p>{family.notes}</p>
            </div>
          )}
        </section>

        <section className="baby-profile-v2-section" aria-labelledby="profile-care-title">
          <div className="baby-profile-v2-section-heading">
            <div>
              <span>Chăm sóc hằng ngày</span>
              <h2 id="profile-care-title">Tiện ích cho gia đình</h2>
            </div>
          </div>

          <div className="baby-profile-v2-actions">
            <button type="button" onClick={onOpenNotifications}>
              <span className="baby-profile-v2-action-icon"><Bell size={20} /></span>
              <span>
                <strong>Lịch nhắc chăm sóc bé</strong>
                <small>Cữ bú, giấc ngủ, thay tã và lịch hẹn</small>
              </span>
              <ChevronRight size={18} />
            </button>
            <button type="button" onClick={() => navigate('/growth')}>
              <span className="baby-profile-v2-action-icon growth"><HeartPulse size={20} /></span>
              <span>
                <strong>Theo dõi tăng trưởng</strong>
                <small>Xem biểu đồ và thêm số đo mới</small>
              </span>
              <ChevronRight size={18} />
            </button>
          </div>
        </section>

        <div className="baby-profile-v2-system-separator">
          <span>Dữ liệu & thiết bị</span>
        </div>

        <GoogleSyncCard onShowToast={onShowToast} />
        <ResetTrackingDataSection onShowToast={onShowToast} />

        <p className="profile-zodiac-note">Cung hoàng đạo chỉ mang tính giải trí, không dùng để đánh giá sức khỏe hoặc đưa ra nhắc nhở chăm sóc.</p>
      </main>
    </div>,
    document.body,
  );
};

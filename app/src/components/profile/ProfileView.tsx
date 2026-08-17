import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Calendar, Droplet, Edit3, Ruler, Scale } from 'lucide-react';
import { useBabyStore } from '@/store/useBabyStore';
import { useFamily } from '@/hooks/useFamily';
import { GoogleSyncCard } from './GoogleSyncCard';
import { ResetTrackingDataSection } from './ResetTrackingDataSection';
import { formatDateDisplay } from '@/utils/date';
import { getZodiacSign } from '@/utils/zodiac';
import { getRealGrowthHistory } from '@/domain/growthSelectors';

interface ProfileViewProps {
  onOpenEditProfile: () => void;
  onOpenNotifications: () => void;
  onShowToast?: (msg: string, icon?: string) => void;
}

function daysSince(dateStr: string): number | null {
  const birth = new Date(dateStr);
  if (!Number.isFinite(birth.getTime())) return null;
  const today = new Date();
  return Math.max(0, Math.floor((today.getTime() - birth.getTime()) / 86_400_000));
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenEditProfile, onOpenNotifications, onShowToast }) => {
  const navigate = useNavigate();
  const family = useFamily();
  const currentStageData = useBabyStore((state) => state.currentStageData());
  const latestGrowth = useMemo(() => getRealGrowthHistory(currentStageData.growthHistory)[0] ?? null, [currentStageData.growthHistory]);
  const ageDays = daysSince(family.birthDate);
  const zodiac = getZodiacSign(family.birthDate);

  return (
    <div className="baby-profile-view-container">
      <div className="profile-top-bar">
        <button className="profile-back-btn" onClick={() => navigate('/')} id="btnBackFromProfile"><ArrowLeft size={18} /><span>Trang chủ</span></button>
        <span className="profile-top-title">Hồ sơ của Bé</span>
        <button className="profile-edit-btn" onClick={onOpenEditProfile} id="btnEditProfileTop"><Edit3 size={15} /><span>Sửa</span></button>
      </div>

      <section className="profile-hero-card">
        <div className="profile-hero-content">
          <div className="profile-avatar-wrapper"><img src={family.childAvatar} alt={family.childName} className="profile-avatar-img" /></div>
          <div className="profile-hero-meta">
            <h2 className="profile-hero-nickname">{family.childName}</h2>
            <p className="profile-hero-fullname">{family.childFullName}</p>
            {ageDays !== null && <div className="profile-days-badge"><span>{ageDays} ngày tuổi</span></div>}
          </div>
        </div>
        <div className="profile-identity-badges-grid">
          <div className="profile-badge-pill"><span>{family.gender === 'boy' ? 'Bé trai' : 'Bé gái'}</span></div>
          <div className="profile-badge-pill"><Droplet size={13} /><span>Nhóm máu {family.bloodType || 'chưa cập nhật'}</span></div>
          <div className="profile-badge-pill"><span>{zodiac}</span></div>
        </div>

      </section>

      <section className="profile-section-block">
        <div className="section-title-row"><span className="section-main-title">Thông tin cơ bản</span></div>
        <div className="profile-medical-card">
          <div className="medical-info-row">
            <div className="medical-info-item"><Calendar size={15} /><div><span className="medical-item-lbl">Ngày sinh</span><span className="medical-item-val">{formatDateDisplay(family.birthDate)}{family.birthTime ? ` · ${family.birthTime}` : ''}</span></div></div>
            {family.hospital && <div className="medical-info-item"><div><span className="medical-item-lbl">Nơi sinh</span><span className="medical-item-val">{family.hospital}</span></div></div>}
          </div>
          {(family.birthWeight || family.birthHeight || family.headCircAtBirth) && (
            <div className="medical-info-row" style={{ marginTop: 12 }}>
              {family.birthWeight && <div className="medical-info-item"><Scale size={15} /><div><span className="medical-item-lbl">Cân nặng lúc sinh</span><span className="medical-item-val">{family.birthWeight}</span></div></div>}
              {family.birthHeight && <div className="medical-info-item"><Ruler size={15} /><div><span className="medical-item-lbl">Chiều cao lúc sinh</span><span className="medical-item-val">{family.birthHeight}</span></div></div>}
            </div>
          )}
          {family.allergies && family.allergies.length > 0 && <div style={{ marginTop: 12 }}><span className="medical-item-lbl">Dị ứng đã ghi nhận</span><div className="medical-item-val">{family.allergies.join(', ')}</div></div>}
        </div>
      </section>

      <section className="profile-section-block">
        <div className="section-title-row"><span className="section-main-title">Số đo gần nhất</span></div>
        {latestGrowth ? (
          <div className="profile-vitals-capsule-grid">
            <div className="profile-vital-capsule-card weight"><Scale size={16} /><div><span className="vital-capsule-label">Cân nặng</span><span className="vital-capsule-value">{latestGrowth.weight} kg</span></div></div>
            <div className="profile-vital-capsule-card height"><Ruler size={16} /><div><span className="vital-capsule-label">Chiều cao</span><span className="vital-capsule-value">{latestGrowth.height} cm</span></div></div>
            <div className="profile-vital-capsule-card head"><div><span className="vital-capsule-label">Vòng đầu</span><span className="vital-capsule-value">{latestGrowth.headCirc} cm</span></div></div>
          </div>
        ) : <div className="empty-state"><p>Chưa có số đo được ghi nhận.</p></div>}
      </section>

      <section className="profile-section-block">
        <div className="section-title-row"><span className="section-main-title">Nhắc nhở</span></div>
        <button type="button" className="log-btn-primary" onClick={onOpenNotifications}><Bell size={15} /> Cài đặt notification & reminder</button>
      </section>

      <GoogleSyncCard />
      <ResetTrackingDataSection onShowToast={onShowToast} />
      <p style={{ padding: '0 4px 20px', fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>Cung hoàng đạo chỉ là thông tin hồ sơ mang tính giải trí và không được dùng cho đánh giá sức khỏe hay nhắc chăm sóc.</p>
    </div>
  );
};

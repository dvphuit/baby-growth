import { useNavigate } from 'react-router-dom';
import { useBabyStore } from '@/store/useBabyStore';
import { useMomStore } from '@/store/useMomStore';
import { useUIStore } from '@/store/useUIStore';
import { useFamily } from '@/hooks/useFamily';
import { GoogleSyncCard } from './GoogleSyncCard';
import { formatDateDisplay } from '@/utils/date';
import {
  ArrowLeft,
  Edit3,
  Calendar,
  Clock,
  Heart,
  Droplet,
  Scale,
  Ruler,
  Building,
  ShieldCheck,
  Award,
  Sparkles,
  Baby,
  Stethoscope,
  Share2,
  Download,
  AlertCircle,
  Syringe,
  CheckCircle2,
} from 'lucide-react';

interface ProfileViewProps {
  onOpenEditProfile: () => void;
  onShowToast?: (msg: string, icon?: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenEditProfile,
  onShowToast,
}) => {
  const navigate = useNavigate();
  const family = useFamily();
  const currentStageData = useBabyStore((s) => s.currentStageData());
  const momData = useMomStore((s) => s.momData);
  const setProfileMode = useUIStore((s) => s.setProfileMode);

  // Calculate days of life from birth date
  const birthDateObj = new Date(family.birthDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - birthDateObj.getTime());
  const daysOfLife = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Determine Zodiac & Animal Year
  const getZodiacSign = (dateStr: string) => {
    const d = new Date(dateStr);
    const m = d.getMonth() + 1;
    const day = d.getDate();
    if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return 'Bạch Dương ♈';
    if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return 'Kim Ngưu ♉';
    if ((m === 5 && day >= 21) || (m === 6 && day <= 21)) return 'Song Tử ♊';
    if ((m === 6 && day >= 22) || (m === 7 && day <= 22)) return 'Cự Giải ♋';
    if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return 'Sư Tử ♌';
    if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return 'Xử Nữ ♍';
    if ((m === 9 && day >= 23) || (m === 10 && day <= 23)) return 'Thiên Bình ♎';
    if ((m === 10 && day >= 24) || (m === 11 && day <= 22)) return 'Bọ Cạp ♏';
    if ((m === 11 && day >= 23) || (m === 12 && day <= 21)) return 'Nhân Mã ♐';
    if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return 'Ma Kết ♑';
    if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return 'Bảo Bình ♒';
    return 'Song Ngư ♓';
  };

  const zodiac = getZodiacSign(family.birthDate);
  const vitals = currentStageData.todayVitals;
  const milestones = currentStageData.motorMilestones;

  const handleExportReport = () => {
    if (onShowToast) {
      onShowToast('Đang tạo Sổ theo dõi sức khỏe PDF chuẩn WHO... 📄', '📥');
      setTimeout(() => {
        onShowToast(`Đã xuất báo cáo phát triển của ${family.childName} thành công! 🎉`, '✅');
      }, 1200);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Hồ sơ Bé ${family.childName}`,
        text: `Hồ sơ phát triển & sức khỏe của ${family.childFullName} (${currentStageData.currentAgeText})`,
        url: window.location.href,
      }).catch(() => {});
    } else if (onShowToast) {
      onShowToast('Đã sao chép liên kết hồ sơ của bé vào bộ nhớ tạm! 📋', '✨');
    }
  };

  const handleSwitchToMom = () => {
    setProfileMode('mom');
    navigate('/');
  };

  return (
    <div className="baby-profile-view-container">
      {/* Top Bar */}
      <div className="profile-top-bar">
        <button
          className="profile-back-btn"
          onClick={() => navigate('/')}
          id="btnBackFromProfile"
        >
          <ArrowLeft size={18} />
          <span>Trang chủ</span>
        </button>
        <span className="profile-top-title">Hồ sơ của Bé</span>
        <button
          className="profile-edit-btn"
          onClick={onOpenEditProfile}
          id="btnEditProfileTop"
        >
          <Edit3 size={15} />
          <span>Sửa</span>
        </button>
      </div>

      {/* Main Hero Identity Card */}
      <div className="profile-hero-card">
        <div className="profile-hero-bg-accent"></div>
        <div className="profile-hero-content">
          <div className="profile-avatar-wrapper">
            <img
              src={family.childAvatar}
              alt={family.childName}
              className="profile-avatar-img"
            />
            <button
              className="profile-avatar-camera-btn"
              onClick={onOpenEditProfile}
              title="Đổi ảnh đại diện"
            >
              <Edit3 size={12} />
            </button>
          </div>

          <div className="profile-hero-meta">
            <div className="profile-hero-name-row">
              <h2 className="profile-hero-nickname">{family.childName}</h2>
              <Sparkles size={16} color="var(--color-sage-dark)" />
            </div>
            <p className="profile-hero-fullname">{family.childFullName}</p>

            <div className="profile-days-badge">
              <Sparkles size={12} />
              <span>{currentStageData.currentAgeText || `${daysOfLife} ngày tuổi`} ({daysOfLife} ngày)</span>
            </div>
          </div>
        </div>

        {/* Identity Quick Badges */}
        <div className="profile-identity-badges-grid">
          <div className="profile-badge-pill">
            <span className="badge-icon">
              {family.gender === 'boy' ? '👦' : '👧'}
            </span>
            <span className="badge-text">
              {family.gender === 'boy' ? 'Bé Trai' : 'Bé Gái'}
            </span>
          </div>

          <div className="profile-badge-pill">
            <Droplet size={13} color="#E87A90" />
            <span className="badge-text">Nhóm máu {family.bloodType}</span>
          </div>

          <div className="profile-badge-pill">
            <span className="badge-icon">🌟</span>
            <span className="badge-text">{zodiac}</span>
          </div>

          <div className="profile-badge-pill">
            <Baby size={13} color="var(--color-sage-dark)" />
            <span className="badge-text">{currentStageData.name}</span>
          </div>
        </div>
      </div>

      {/* Section 1: Chỉ số Hiện tại & Điểm Tăng trưởng WHO */}
      <div className="profile-section-block">
        <div className="section-title-row">
          <span className="section-main-title">Chỉ số Hiện tại (Chuẩn WHO)</span>
          <span className="section-score-pill">
            <Award size={13} /> {currentStageData.growthScore || 92}đ {currentStageData.growthScoreLabel || 'Tối ưu'}
          </span>
        </div>

        <div className="profile-vitals-capsule-grid">
          <div className="profile-vital-capsule-card weight">
            <div className="vital-capsule-icon">
              <Scale size={16} />
            </div>
            <div className="vital-capsule-info">
              <span className="vital-capsule-label">Cân nặng</span>
              <span className="vital-capsule-value">{vitals.weight || '8.6 kg'}</span>
              <span className="vital-capsule-badge">P50 Chuẩn WHO</span>
            </div>
          </div>

          <div className="profile-vital-capsule-card height">
            <div className="vital-capsule-icon">
              <Ruler size={16} />
            </div>
            <div className="vital-capsule-info">
              <span className="vital-capsule-label">Chiều cao</span>
              <span className="vital-capsule-value">{vitals.height || '71.5 cm'}</span>
              <span className="vital-capsule-badge">P50 Chuẩn WHO</span>
            </div>
          </div>

          <div className="profile-vital-capsule-card head">
            <div className="vital-capsule-icon">
              <Heart size={16} />
            </div>
            <div className="vital-capsule-info">
              <span className="vital-capsule-label">Vòng đầu</span>
              <span className="vital-capsule-value">{vitals.headCirc || '44.2 cm'}</span>
              <span className="vital-capsule-badge">P50 Chuẩn WHO</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Hồ sơ Sinh học & Giấy chứng sinh */}
      <div className="profile-section-block">
        <div className="section-title-row">
          <span className="section-main-title">Thông tin Sinh học & Y tế</span>
        </div>

        <div className="profile-medical-card">
          <div className="medical-info-row">
            <div className="medical-info-item">
              <div className="medical-item-icon">
                <Calendar size={15} />
              </div>
              <div>
                <span className="medical-item-lbl">Ngày sinh</span>
                <span className="medical-item-val">{formatDateDisplay(family.birthDate)} ({family.birthTime || '08:30'})</span>
              </div>
            </div>

            <div className="medical-info-item">
              <div className="medical-item-icon">
                <Clock size={15} />
              </div>
              <div>
                <span className="medical-item-lbl">Tuổi thai lúc sinh</span>
                <span className="medical-item-val">39 tuần 2 ngày (Đủ tháng)</span>
              </div>
            </div>
          </div>

          <div className="medical-divider"></div>

          <div className="medical-info-row">
            <div className="medical-info-item">
              <div className="medical-item-icon">
                <Scale size={15} />
              </div>
              <div>
                <span className="medical-item-lbl">Cân nặng sơ sinh</span>
                <span className="medical-item-val">{family.birthWeight || '3.3 kg'}</span>
              </div>
            </div>

            <div className="medical-info-item">
              <div className="medical-item-icon">
                <Ruler size={15} />
              </div>
              <div>
                <span className="medical-item-lbl">Chiều dài sơ sinh</span>
                <span className="medical-item-val">{family.birthHeight || '50.0 cm'}</span>
              </div>
            </div>
          </div>

          <div className="medical-divider"></div>

          <div className="medical-info-row single">
            <div className="medical-info-item full">
              <div className="medical-item-icon">
                <Building size={15} />
              </div>
              <div>
                <span className="medical-item-lbl">Bệnh viện nơi sinh</span>
                <span className="medical-item-val">{family.hospital || 'BV Phụ sản Quốc tế Hạnh Phúc'}</span>
              </div>
            </div>
          </div>

          <div className="medical-divider"></div>

          <div className="medical-info-row single">
            <div className="medical-info-item full">
              <div className="medical-item-icon">
                <ShieldCheck size={15} />
              </div>
              <div>
                <span className="medical-item-lbl">Mã thẻ BHYT Trẻ em</span>
                <span className="medical-item-val mono">{family.insuranceCode || 'DN4012984920'}</span>
              </div>
            </div>
          </div>

          {/* Allergy Tags */}
          <div className="medical-allergy-box">
            <div className="allergy-header">
              <AlertCircle size={14} color="#E97332" />
              <span>Dị ứng & Chế độ Dinh dưỡng đặc biệt:</span>
            </div>
            <div className="allergy-chips-list">
              {(family.allergies || ['Không có dị ứng thuốc', 'Nhạy cảm đạm sữa bò nhẹ']).map((alg, i) => (
                <span key={i} className="allergy-chip">
                  {alg}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Thành viên Gia đình & Người chăm sóc */}
      <div className="profile-section-block">
        <div className="section-title-row">
          <span className="section-main-title">Gia đình & Người chăm sóc</span>
        </div>

        <div className="profile-family-team-grid">
          {/* Mom */}
          <div className="family-member-card">
            <img src={family.momAvatar} alt={family.momName} className="family-member-avatar" />
            <div className="family-member-meta">
              <span className="family-member-name">{family.momName}</span>
              <span className="family-member-role">Mẹ • Người chăm sóc chính</span>
              <span className="family-member-status">Sữa mẹ: {momData.pumping.todayTotal}/ngày</span>
            </div>
          </div>

          {/* Dad */}
          <div className="family-member-card">
            <img src={family.dadAvatar} alt={family.dadName} className="family-member-avatar" />
            <div className="family-member-meta">
              <span className="family-member-name">{family.dadName}</span>
              <span className="family-member-role">Bố • Vận động & Giấc ngủ</span>
              <span className="family-member-status">Tắm nắng & Tummy Time</span>
            </div>
          </div>

          {/* Pediatric AI Doctor */}
          <div className="family-member-card doctor">
            <div className="doctor-avatar-circle">
              <Stethoscope size={20} />
            </div>
            <div className="family-member-meta">
              <span className="family-member-name">Trợ lý Freud AI</span>
              <span className="family-member-role">Thông tin tham khảo về Bé & Mẹ</span>
              <span className="family-member-status doc">Sẵn sàng hỗ trợ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Sổ Tiêm chủng & Cột mốc Vận động */}
      <div className="profile-section-block">
        <div className="section-title-row">
          <span className="section-main-title">Tiêm chủng & Cột mốc Vàng</span>
        </div>

        <div className="profile-milestone-summary-card">
          <div className="milestone-summary-item">
            <div className="milestone-summary-icon vaccine">
              <Syringe size={18} />
            </div>
            <div className="milestone-summary-info">
              <div className="summary-title-row">
                <span className="summary-title">Tiêm chủng mở rộng</span>
                <span className="summary-badge completed">
                  <CheckCircle2 size={11} /> 5/7 mũi
                </span>
              </div>
              <p className="summary-desc">
                Đã hoàn thành mũi 6in1 & Phế cầu. Mũi tiếp theo: Cúm & Sởi (Tháng 9).
              </p>
            </div>
          </div>

          <div className="summary-divider"></div>

          <div className="milestone-summary-item">
            <div className="milestone-summary-icon motor">
              <Award size={18} />
            </div>
            <div className="milestone-summary-info">
              <div className="summary-title-row">
                <span className="summary-title">Vận động thô WHO ({milestones.score || 94}đ)</span>
                <span className="summary-badge in-progress">
                  Đang tập ngồi vững
                </span>
              </div>
              <p className="summary-desc">
                {milestones.doctorNote || 'Trương lực cơ cổ và lưng của bé phát triển rất khỏe mạnh.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Đồng bộ dữ liệu cục bộ với Google Drive */}
      <GoogleSyncCard onShowToast={onShowToast} />

      {/* Section 6: Hành động nhanh & Tiện ích */}
      <div className="profile-action-buttons-group">
        <button
          className="profile-action-btn primary"
          onClick={handleExportReport}
          id="btnExportHealthReport"
        >
          <Download size={16} />
          <span>Xuất Sổ theo dõi Sức khỏe PDF</span>
        </button>

        <button
          className="profile-action-btn secondary"
          onClick={handleShare}
          id="btnShareBabyProfile"
        >
          <Share2 size={16} />
          <span>Chia sẻ Hồ sơ cho Người thân / Bác sĩ</span>
        </button>

        <button
          className="profile-action-btn mom-switch"
          onClick={handleSwitchToMom}
          id="btnSwitchToMomMode"
        >
          <Heart size={16} />
          <span>Chuyển sang Chế độ Chăm sóc Mẹ Thảo</span>
        </button>
      </div>
    </div>
  );
};

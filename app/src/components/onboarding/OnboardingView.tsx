import { useState } from 'react';
import { Calendar, Check, Droplet, Heart, Sparkles, User } from 'lucide-react';
import { useBabyStore } from '@/store/useBabyStore';
import { useMomStore } from '@/store/useMomStore';
import {
  HavenFeedingIcon,
  HavenHeadCircIcon,
  HavenRulerIcon,
  HavenScaleIcon,
} from '../common/HavenIcons';

interface OnboardingViewProps {
  onComplete?: () => void;
}

const PRESET_BABY_AVATARS = [
  { label: 'Bé Yêu', url: '/assets/avatars/baby_avatar.jpg' },
];

const PRESET_MOM_AVATARS = [
  { label: 'Mẹ Hiền', url: '/assets/avatars/mom_avatar.jpg' },
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const initializeChildProfile = useBabyStore((s) => s.initializeChildProfile);
  const updateMomData = useMomStore((s) => s.updateMomData);

  const [childName, setChildName] = useState('');
  const [childFullName, setChildFullName] = useState('');
  const [birthDate, setBirthDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [birthTime, setBirthTime] = useState('08:30');
  const [gender, setGender] = useState<'boy' | 'girl'>('boy');
  const [bloodType, setBloodType] = useState('O+');
  const childAvatar = PRESET_BABY_AVATARS[0].url;

  // Birth vitals
  const [birthWeight, setBirthWeight] = useState('3.3');
  const [birthHeight, setBirthHeight] = useState('50.0');
  const [headCircAtBirth, setHeadCircAtBirth] = useState('34.5');
  const [hospital, setHospital] = useState('');

  // Mom info
  const [momName, setMomName] = useState('Mẹ');
  const momAvatar = PRESET_MOM_AVATARS[0].url;

  const [error, setError] = useState<string | null>(null);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim()) {
      setError('Vui lòng nhập tên gọi ở nhà của Bé.');
      return;
    }
    if (!birthDate) {
      setError('Vui lòng chọn ngày sinh của Bé.');
      return;
    }

    const w = parseFloat(birthWeight) || 0;
    const h = parseFloat(birthHeight) || 0;
    const hc = parseFloat(headCircAtBirth) || 0;

    initializeChildProfile(
      {
        childName: childName.trim(),
        childFullName: childFullName.trim(),
        birthDate,
        birthTime,
        gender,
        bloodType,
        childAvatar,
        momName: momName.trim() || 'Mẹ',
        momAvatar,
        birthWeight: w > 0 ? `${w} kg` : undefined,
        birthHeight: h > 0 ? `${h} cm` : undefined,
        headCircAtBirth: hc > 0 ? `${hc} cm` : undefined,
        hospital: hospital.trim() || undefined,
        isInitialized: true,
      },
      { weight: w, height: h, headCirc: hc },
    );

    if (momName.trim()) {
      updateMomData({ name: momName.trim() });
    }

    onComplete?.();
  };

  return (
    <div className="haven-onboarding-container" id="onboardingScreen">
      <div className="haven-onboarding-card">
        {/* Header Banner */}
        <header className="haven-onboarding-header">
          <div className="haven-onboarding-icon-wrap">
            <HavenFeedingIcon size={34} />
          </div>
          <span className="haven-eyebrow">CHÀO MỪNG ĐẾN VỚI HAVEN</span>
          <h2>Bắt đầu hành trình<br />lớn khôn cùng Bé.</h2>
          <p>
            Tạo hồ sơ đầu tiên để bắt đầu theo dõi thể chất theo chuẩn WHO và nhịp sinh hoạt nhẹ nhàng mỗi ngày.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="haven-onboarding-form">
          {/* 1. Baby Info Section */}
          <fieldset className="haven-onboarding-section">
            <legend className="haven-section-legend">
              <User size={15} />
              <span>1. Thông tin Bé yêu</span>
            </legend>

            <div className="haven-field-group">
              <label htmlFor="inputChildName" className="haven-label">
                Tên gọi ở nhà của Bé <strong className="required-star">*</strong>
              </label>
              <input
                id="inputChildName"
                type="text"
                className="haven-input"
                placeholder="Ví dụ: Bé Bơ, Miu, Sữa..."
                value={childName}
                onChange={(e) => {
                  setChildName(e.target.value);
                  if (error) setError(null);
                }}
                required
              />
            </div>

            <div className="haven-field-group">
              <label htmlFor="inputChildFullName" className="haven-label">
                Họ và tên đầy đủ (không bắt buộc)
              </label>
              <input
                id="inputChildFullName"
                type="text"
                className="haven-input"
                placeholder="Ví dụ: Nguyễn Minh Khang"
                value={childFullName}
                onChange={(e) => setChildFullName(e.target.value)}
              />
            </div>

            <div className="haven-field-row">
              <div className="haven-field-group">
                <label htmlFor="inputBirthDate" className="haven-label">
                  Ngày sinh <strong className="required-star">*</strong>
                </label>
                <div className="haven-input-icon-box">
                  <Calendar size={15} />
                  <input
                    id="inputBirthDate"
                    type="date"
                    className="haven-input"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="haven-field-group">
                <label htmlFor="inputBirthTime" className="haven-label">
                  Giờ sinh
                </label>
                <input
                  id="inputBirthTime"
                  type="time"
                  className="haven-input"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                />
              </div>
            </div>

            <div className="haven-field-row">
              <div className="haven-field-group">
                <span className="haven-label">Giới tính</span>
                <div className="haven-gender-toggle" role="radiogroup" aria-label="Chọn giới tính">
                  <button
                    type="button"
                    className={`haven-gender-btn ${gender === 'boy' ? 'active' : ''}`}
                    onClick={() => setGender('boy')}
                  >
                    👦 Bé trai
                  </button>
                  <button
                    type="button"
                    className={`haven-gender-btn ${gender === 'girl' ? 'active' : ''}`}
                    onClick={() => setGender('girl')}
                  >
                    👧 Bé gái
                  </button>
                </div>
              </div>

              <div className="haven-field-group">
                <label htmlFor="selectBloodType" className="haven-label">
                  <Droplet size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Nhóm máu
                </label>
                <select
                  id="selectBloodType"
                  className="haven-input haven-select"
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                >
                  <option value="O+">O+</option>
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="AB+">AB+</option>
                  <option value="O-">O-</option>
                  <option value="Chưa rõ">Chưa rõ</option>
                </select>
              </div>
            </div>

            <div className="haven-field-group">
              <span className="haven-label">Ảnh đại diện của Bé</span>
              <div className="haven-avatar-picker-row">
                <img src={childAvatar} alt="Avatar Bé" className="haven-avatar-preview-img" />
                <div className="haven-avatar-note">
                  <strong>Avatar minh họa Haven</strong>
                  <span>Phong cách vẽ vector ấm áp, mộc mạc</span>
                </div>
              </div>
            </div>
          </fieldset>

          {/* 2. Birth Vitals Section */}
          <fieldset className="haven-onboarding-section">
            <legend className="haven-section-legend">
              <Sparkles size={15} />
              <span>2. Chỉ số khi chào đời (Tùy chọn)</span>
            </legend>

            <div className="haven-field-row three-cols">
              <div className="haven-field-group">
                <label htmlFor="inputBirthWeight" className="haven-label">
                  <HavenScaleIcon size={13} style={{ display: 'inline', marginRight: 4 }} />
                  Cân nặng (kg)
                </label>
                <input
                  id="inputBirthWeight"
                  type="number"
                  step="0.01"
                  min="0"
                  className="haven-input"
                  placeholder="Ví dụ: 3.3"
                  value={birthWeight}
                  onChange={(e) => setBirthWeight(e.target.value)}
                />
              </div>

              <div className="haven-field-group">
                <label htmlFor="inputBirthHeight" className="haven-label">
                  <HavenRulerIcon size={13} style={{ display: 'inline', marginRight: 4 }} />
                  Chiều cao (cm)
                </label>
                <input
                  id="inputBirthHeight"
                  type="number"
                  step="0.1"
                  min="0"
                  className="haven-input"
                  placeholder="Ví dụ: 50.0"
                  value={birthHeight}
                  onChange={(e) => setBirthHeight(e.target.value)}
                />
              </div>

              <div className="haven-field-group">
                <label htmlFor="inputHeadCirc" className="haven-label">
                  <HavenHeadCircIcon size={13} style={{ display: 'inline', marginRight: 4 }} />
                  Vòng đầu (cm)
                </label>
                <input
                  id="inputHeadCirc"
                  type="number"
                  step="0.1"
                  min="0"
                  className="haven-input"
                  placeholder="Ví dụ: 34.5"
                  value={headCircAtBirth}
                  onChange={(e) => setHeadCircAtBirth(e.target.value)}
                />
              </div>
            </div>

            <div className="haven-field-group">
              <label htmlFor="inputHospital" className="haven-label">
                Nơi sinh / Bệnh viện
              </label>
              <input
                id="inputHospital"
                type="text"
                className="haven-input"
                placeholder="Ví dụ: BV Phụ sản Quốc tế..."
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
              />
            </div>
          </fieldset>

          {/* 3. Mother Info Section */}
          <fieldset className="haven-onboarding-section">
            <legend className="haven-section-legend">
              <Heart size={15} />
              <span>3. Thông tin Mẹ</span>
            </legend>

            <div className="haven-field-group">
              <label htmlFor="inputMomName" className="haven-label">
                Tên của Mẹ
              </label>
              <input
                id="inputMomName"
                type="text"
                className="haven-input"
                placeholder="Ví dụ: Mẹ Thảo, Mẹ Lan..."
                value={momName}
                onChange={(e) => setMomName(e.target.value)}
              />
            </div>

            <div className="haven-avatar-picker-row">
              <img src={momAvatar} alt="Avatar Mẹ" className="haven-avatar-preview-img" />
              <div className="haven-avatar-note">
                <strong>Hồ sơ Mẹ</strong>
                <span>Theo dõi nhịp hút sữa, giấc ngủ và phục hồi sau sinh</span>
              </div>
            </div>
          </fieldset>

          {error && (
            <div className="haven-form-error" role="alert">
              <span>⚠️ {error}</span>
            </div>
          )}

          <button type="submit" id="btnCompleteOnboarding" className="haven-onboarding-submit-btn">
            <Check size={18} />
            <span>Bắt đầu hành trình cùng Bé</span>
          </button>
        </form>
      </div>
    </div>
  );
};

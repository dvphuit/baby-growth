import { useEffect, useId, useState } from 'react';
import {
  Building,
  Calendar,
  Camera,
  Check,
  Clock,
  Droplet,
  Heart,
  Ruler,
  Save,
  Scale,
  ShieldAlert,
  User,
} from 'lucide-react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { HavenDatePicker } from '@/shared/ui/HavenDatePicker';
import { HavenDropdown } from '@/shared/ui/HavenDropdown';
import { useFamily } from '@/features/profile/hooks/useFamily';
import { useBabyStore } from '@/store/useBabyStore';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string, icon?: string) => void;
}

const PRESET_AVATARS = [
  { label: 'Bé Bơ', url: '/assets/avatars/baby_avatar.jpg' },
  { label: 'Mẹ Thảo', url: '/assets/avatars/mom_avatar.jpg' },
  { label: 'Bố Tuấn', url: '/assets/avatars/dad_avatar.jpg' },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const family = useFamily();
  const updateFamilyData = useBabyStore((state) => state.updateFamilyData);

  const [childName, setChildName] = useState(family.childName);
  const [childFullName, setChildFullName] = useState(family.childFullName);
  const [birthDate, setBirthDate] = useState(family.birthDate);
  const [birthTime, setBirthTime] = useState(family.birthTime || '08:30');
  const [gender, setGender] = useState<'boy' | 'girl'>(family.gender);
  const [bloodType, setBloodType] = useState(family.bloodType);
  const [childAvatar, setChildAvatar] = useState(family.childAvatar);
  const [birthWeight, setBirthWeight] = useState(family.birthWeight || '3.3 kg');
  const [birthHeight, setBirthHeight] = useState(family.birthHeight || '50.0 cm');
  const [hospital, setHospital] = useState(family.hospital || 'BV Phụ sản Quốc tế Hạnh Phúc');
  const [insuranceCode, setInsuranceCode] = useState(family.insuranceCode || 'DN4012984920');
  const [notes, setNotes] = useState(family.notes || '');
  const formId = useId();

  useEffect(() => {
    if (!isOpen) return;
    setChildName(family.childName);
    setChildFullName(family.childFullName);
    setBirthDate(family.birthDate);
    setBirthTime(family.birthTime || '08:30');
    setGender(family.gender);
    setBloodType(family.bloodType);
    setChildAvatar(family.childAvatar);
    setBirthWeight(family.birthWeight || '3.3 kg');
    setBirthHeight(family.birthHeight || '50.0 cm');
    setHospital(family.hospital || 'BV Phụ sản Quốc tế Hạnh Phúc');
    setInsuranceCode(family.insuranceCode || 'DN4012984920');
    setNotes(family.notes || '');
  }, [isOpen, family]);

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    updateFamilyData({
      childName: childName.trim() || family.childName || 'Bé',
      childFullName: childFullName.trim(),
      birthDate,
      birthTime,
      gender,
      bloodType,
      childAvatar,
      birthWeight,
      birthHeight,
      hospital,
      insuranceCode,
      notes,
    });

    onClose();
    onSuccessToast?.(`Đã cập nhật thông tin cho ${childName || 'Bé'} thành công!`);
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Chỉnh sửa Hồ sơ Bé"
      footer={
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', width: '100%' }}>
          <button
            type="button"
            className="btn-secondary-pill"
            onClick={onClose}
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-border-subtle)',
              background: 'var(--color-card-warm)',
              fontFamily: 'var(--font-family-display)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Hủy
          </button>
          <button
            type="submit"
            form={formId}
            className="log-btn-primary"
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Save size={15} />
            <span>Lưu Hồ Sơ Bé</span>
          </button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="log-form-group">
          <label className="log-form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Camera size={13} color="var(--color-sage-dark)" /> Ảnh đại diện của bé
          </label>
          <div className="avatar-preview-picker-row">
            <div className="avatar-big-preview">
              <img src={childAvatar} alt={childName} />
            </div>
            <div className="avatar-preset-list">
              {PRESET_AVATARS.map((avatar) => (
                <button
                  key={avatar.url}
                  type="button"
                  className={`avatar-preset-thumb-btn ${childAvatar === avatar.url ? 'selected' : ''}`}
                  onClick={() => setChildAvatar(avatar.url)}
                  title={avatar.label}
                >
                  <img src={avatar.url} alt={avatar.label} />
                  {childAvatar === avatar.url && (
                    <span className="avatar-check-badge">
                      <Check size={10} color="#FFFFFF" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="log-form-group">
            <label className="log-form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <User size={13} color="var(--color-sage-dark)" /> Tên gọi ở nhà *
            </label>
            <input
              type="text"
              className="log-input-control"
              required
              value={childName}
              onChange={(event) => setChildName(event.target.value)}
              placeholder="VD: Bé Bơ, Coca..."
            />
          </div>
          <div className="log-form-group">
            <label className="log-form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <User size={13} color="var(--color-sage-dark)" /> Họ tên khai sinh *
            </label>
            <input
              type="text"
              className="log-input-control"
              required
              value={childFullName}
              onChange={(event) => setChildFullName(event.target.value)}
              placeholder="VD: Nguyễn Minh Khang..."
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="log-form-group">
            <label className="log-form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Heart size={13} color="var(--color-mom-rose)" /> Giới tính
            </label>
            <div className="gender-selector-pills">
              <button
                type="button"
                className={`gender-pill-btn ${gender === 'boy' ? 'active boy' : ''}`}
                onClick={() => setGender('boy')}
              >
                👦 Bé Trai
              </button>
              <button
                type="button"
                className={`gender-pill-btn ${gender === 'girl' ? 'active girl' : ''}`}
                onClick={() => setGender('girl')}
              >
                👧 Bé Gái
              </button>
            </div>
          </div>
          <div className="log-form-group">
            <label className="log-form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Droplet size={13} color="#E87A90" /> Nhóm máu
            </label>
            <HavenDropdown
              label="Nhóm máu"
              value={bloodType}
              onChange={setBloodType}
              options={[
                { value: 'O+', label: 'O+ (Phổ biến)' },
                { value: 'A+', label: 'A+' },
                { value: 'B+', label: 'B+' },
                { value: 'AB+', label: 'AB+' },
                { value: 'O-', label: 'O- (Hiếm)' },
                { value: 'A-', label: 'A-' },
                { value: 'B-', label: 'B-' },
                { value: 'AB-', label: 'AB-' },
                { value: 'Chưa xác định', label: 'Chưa xác định' },
              ]}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="log-form-group">
            <label className="log-form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={13} color="var(--color-sage-dark)" /> Ngày sinh *
            </label>
            <HavenDatePicker
              label="Ngày sinh"
              value={birthDate}
              onChange={setBirthDate}
              maxDate={new Date().toISOString().slice(0, 10)}
            />
          </div>
          <div className="log-form-group">
            <label className="log-form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={13} color="var(--color-sage-dark)" /> Giờ sinh
            </label>
            <input
              type="time"
              className="log-input-control"
              value={birthTime}
              onChange={(event) => setBirthTime(event.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="log-form-group">
            <label className="log-form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Scale size={13} color="#E97332" /> Cân nặng lúc sinh
            </label>
            <input
              type="text"
              className="log-input-control"
              value={birthWeight}
              onChange={(event) => setBirthWeight(event.target.value)}
              placeholder="VD: 3.3 kg"
            />
          </div>
          <div className="log-form-group">
            <label className="log-form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Ruler size={13} color="var(--color-sage-dark)" /> Chiều dài lúc sinh
            </label>
            <input
              type="text"
              className="log-input-control"
              value={birthHeight}
              onChange={(event) => setBirthHeight(event.target.value)}
              placeholder="VD: 50.0 cm"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="log-form-group">
            <label className="log-form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Building size={13} color="var(--color-sage-dark)" /> Bệnh viện nơi sinh
            </label>
            <input
              type="text"
              className="log-input-control"
              value={hospital}
              onChange={(event) => setHospital(event.target.value)}
              placeholder="VD: BV Phụ sản..."
            />
          </div>
          <div className="log-form-group">
            <label className="log-form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ShieldAlert size={13} color="var(--color-sage-dark)" /> Mã số thẻ BHYT
            </label>
            <input
              type="text"
              className="log-input-control"
              value={insuranceCode}
              onChange={(event) => setInsuranceCode(event.target.value)}
              placeholder="VD: DN4012984920..."
            />
          </div>
        </div>

        <div className="log-form-group">
          <label className="log-form-label">Ghi chú & Đặc điểm riêng của bé</label>
          <textarea
            className="log-input-control"
            style={{ height: '60px', padding: '8px 10px', resize: 'none' }}
            rows={2}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="VD: Bé sinh đủ tháng, thích nghe nhạc êm dịu..."
          />
        </div>
      </form>
    </BottomSheet>
  );
};

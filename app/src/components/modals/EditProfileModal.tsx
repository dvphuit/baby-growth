import { useState, useEffect } from 'react';
import { useBabyStore } from '@/store/useBabyStore';
import { useFamily } from '@/hooks/useFamily';
import { BottomSheet } from '../common/BottomSheet';
import {
  Camera,
  User,
  Calendar,
  Clock,
  Heart,
  Droplet,
  Scale,
  Ruler,
  Building,
  ShieldAlert,
  Save,
  Check,
} from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string, icon?: string) => void;
}

const PRESET_AVATARS = [
  {
    label: 'Bé Bơ',
    url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Bé Gấu',
    url: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Bé Miu',
    url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Bé Thỏ',
    url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=200&auto=format&fit=crop&q=80',
  },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const family = useFamily();
  const updateFamilyData = useBabyStore((s) => s.updateFamilyData);

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

  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen, family]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateFamilyData({
      childName: childName.trim() || 'Bé Bơ',
      childFullName: childFullName.trim() || 'Nguyễn Minh Khang',
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
    if (onSuccessToast) {
      onSuccessToast(`Đã cập nhật thông tin cho ${childName || 'Bé'} thành công! ✨`, '👶');
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Chỉnh sửa Hồ sơ Bé">
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Avatar Selector */}
        <div className="log-form-group">
          <label className="log-form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Camera size={13} color="var(--color-sage-dark)" /> Ảnh đại diện của bé
          </label>
          <div className="avatar-preview-picker-row">
            <div className="avatar-big-preview">
              <img src={childAvatar} alt={childName} />
            </div>
            <div className="avatar-preset-list">
              {PRESET_AVATARS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`avatar-preset-thumb-btn ${childAvatar === av.url ? 'selected' : ''}`}
                  onClick={() => setChildAvatar(av.url)}
                  title={av.label}
                >
                  <img src={av.url} alt={av.label} />
                  {childAvatar === av.url && (
                    <span className="avatar-check-badge">
                      <Check size={10} color="#FFFFFF" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Nickname & Full Name */}
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
              onChange={(e) => setChildName(e.target.value)}
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
              onChange={(e) => setChildFullName(e.target.value)}
              placeholder="VD: Nguyễn Minh Khang..."
            />
          </div>
        </div>

        {/* Gender & Blood Type */}
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
            <select
              className="log-input-control"
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="O+">O+ (Phổ biến)</option>
              <option value="A+">A+</option>
              <option value="B+">B+</option>
              <option value="AB+">AB+</option>
              <option value="O-">O- (Hiếm)</option>
              <option value="A-">A-</option>
              <option value="B-">B-</option>
              <option value="AB-">AB-</option>
              <option value="Chưa xác định">Chưa xác định</option>
            </select>
          </div>
        </div>

        {/* Birth Date & Birth Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="log-form-group">
            <label className="log-form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={13} color="var(--color-sage-dark)" /> Ngày sinh *
            </label>
            <input
              type="date"
              className="log-input-control"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
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
              onChange={(e) => setBirthTime(e.target.value)}
            />
          </div>
        </div>

        {/* Birth Weight & Length */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="log-form-group">
            <label className="log-form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Scale size={13} color="#E97332" /> Cân nặng lúc sinh
            </label>
            <input
              type="text"
              className="log-input-control"
              value={birthWeight}
              onChange={(e) => setBirthWeight(e.target.value)}
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
              onChange={(e) => setBirthHeight(e.target.value)}
              placeholder="VD: 50.0 cm"
            />
          </div>
        </div>

        {/* Hospital & Insurance Code */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="log-form-group">
            <label className="log-form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Building size={13} color="var(--color-sage-dark)" /> Bệnh viện nơi sinh
            </label>
            <input
              type="text"
              className="log-input-control"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
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
              onChange={(e) => setInsuranceCode(e.target.value)}
              placeholder="VD: DN4012984920..."
            />
          </div>
        </div>

        {/* Notes */}
        <div className="log-form-group">
          <label className="log-form-label">Ghi chú & Đặc điểm riêng của bé</label>
          <textarea
            className="log-input-control"
            style={{ height: '60px', padding: '8px 10px', resize: 'none' }}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="VD: Bé sinh đủ tháng, thích nghe nhạc êm dịu..."
          ></textarea>
        </div>

        {/* Submit & Cancel Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginTop: '6px' }}>
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
      </form>
    </BottomSheet>
  );
};

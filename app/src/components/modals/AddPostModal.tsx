import { useState } from 'react';
import { useTimelineStore } from '@/store/useTimelineStore';
import { BottomSheet } from '../common/BottomSheet';
import { Image, Tag, X, ArrowRight } from 'lucide-react';

type PostTagType = 'milestone' | 'feeding' | 'mom' | 'health' | 'general';

interface AddPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
  presetTagType?: PostTagType;
}

export const AddPostModal: React.FC<AddPostModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
  presetTagType,
}) => {
  const addTimelineItem = useTimelineStore(s => s.addTimelineItem);

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [tag, setTag] = useState<string>(presetTagType === 'feeding' ? 'Ăn dặm' : 'Cột mốc vàng');
  const [tagType, setTagType] = useState<PostTagType>(presetTagType || 'milestone');
  const [mediaUrl, setMediaUrl] = useState<string>('');

  const samplePhotos = [
    { label: 'Bé cười', url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&auto=format&fit=crop&q=80' },
    { label: 'Ăn dặm', url: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=600&auto=format&fit=crop&q=80' },
    { label: 'Tập bò', url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop&q=80' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề nhật ký!');
      return;
    }

    addTimelineItem({
      title,
      content,
      tag,
      tagType,
      mediaUrl: mediaUrl || null,
      mediaType: mediaUrl ? 'photo' : null,
      stats: [tag, 'Ghi nhận hôm nay'],
    });

    onSuccessToast(`Đã thêm nhật ký mới: "${title}" ✨`);
    setTitle('');
    setContent('');
    setMediaUrl('');
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Viết Nhật Ký & Khoảnh Khắc">
      <form onSubmit={handleSubmit}>
        <div className="log-form-group">
          <label className="log-form-label">Tiêu đề khoảnh khắc</label>
          <input
            type="text"
            required
            className="log-input-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Bé tự xúc thìa ăn hết bát cháo..."
          />
        </div>

        <div className="log-form-group">
          <label className="log-form-label">Nội dung chi tiết</label>
          <textarea
            className="log-input-control"
            style={{ height: 'auto', minHeight: '64px', padding: '8px 10px', lineHeight: 1.4 }}
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Kể lại cảm xúc, cử chỉ đáng yêu hoặc mốc mới của con..."
          ></textarea>
        </div>

        <div className="log-form-group">
          <label className="log-form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Tag size={12} /> Chủ đề phân loại
          </label>
          <div className="chart-metric-selector-pills" style={{ marginBottom: 0 }}>
            {[
              { label: 'Cột mốc vàng', type: 'milestone' as const },
              { label: 'Ăn dặm', type: 'feeding' as const },
              { label: 'Sức khỏe', type: 'health' as const },
              { label: 'Sữa mẹ', type: 'mom' as const },
            ].map((t) => (
              <button
                type="button"
                key={t.type}
                className={`metric-pill-choice ${tagType === t.type ? 'active' : ''}`}
                onClick={() => {
                  setTagType(t.type);
                  setTag(t.label);
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="log-form-group">
          <label className="log-form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Image size={12} /> Đính kèm hình ảnh (Chọn mẫu nhanh)
          </label>
          <div className="photo-preview-choices" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
            {samplePhotos.map((p, idx) => (
              <button
                type="button"
                key={idx}
                className={`photo-thumb-btn ${mediaUrl === p.url ? 'selected' : ''}`}
                onClick={() => setMediaUrl(p.url)}
                style={{
                  border: mediaUrl === p.url ? '2px solid var(--color-sage-dark)' : '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  padding: '2px',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <img src={p.url} alt={p.label} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--color-primary-dark)' }}>{p.label}</span>
              </button>
            ))}
            {mediaUrl && (
              <button
                type="button"
                onClick={() => setMediaUrl('')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '10px',
                  color: '#D96938',
                  padding: '4px 8px',
                  background: 'var(--color-canvas)',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--color-border-subtle)',
                  cursor: 'pointer',
                }}
              >
                <X size={11} />
                <span>Bỏ ảnh</span>
              </button>
            )}
          </div>
        </div>

        <button type="submit" className="log-btn-primary">
          <span>Đăng Nhật Ký</span>
          <ArrowRight size={14} />
        </button>
      </form>
    </BottomSheet>
  );
};

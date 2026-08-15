import { BookOpen, Eye, Heart, Moon, Syringe } from 'lucide-react';

export interface BabyCareResourcesProps {
  onShowToast?: (message: string, icon?: string) => void;
}

export const BabyCareResources: React.FC<BabyCareResourcesProps> = ({ onShowToast }) => (
  <>
    <div className="section-title-row">
      <span className="section-main-title">Cẩm nang Chăm sóc</span>
      <button
        type="button"
        className="card-action-link"
        onClick={() => onShowToast?.('Cẩm nang chi tiết đang được hoàn thiện.')}
      >
        Xem tất cả
      </button>
    </div>

    <div className="resources-horizontal-list">
      <button
        type="button"
        className="resource-item-card"
        onClick={() => onShowToast?.('Bài viết này sẽ mở trong phiên bản tiếp theo.')}
      >
        <div className="resource-item-thumb"><BookOpen size={20} color="var(--color-sage-dark)" /></div>
        <span className="resource-tag-pill">Ăn dặm BLW</span>
        <div className="resource-item-title">Thực đơn ăn dặm giàu sắt từ 8 tháng?</div>
        <div className="resource-item-stats">
          <span><Eye size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> 5.2k</span>
          <span><Heart size={11} fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }} /> 987</span>
        </div>
      </button>

      <button
        type="button"
        className="resource-item-card"
        onClick={() => onShowToast?.('Bài viết này sẽ mở trong phiên bản tiếp theo.')}
      >
        <div className="resource-item-thumb"><Moon size={20} color="#9579EE" /></div>
        <span className="resource-tag-pill">Giấc ngủ</span>
        <div className="resource-item-title">Rèn bé tự ngủ xuyên đêm không quấy?</div>
        <div className="resource-item-stats">
          <span><Eye size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> 8.4k</span>
          <span><Heart size={11} fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }} /> 1.4k</span>
        </div>
      </button>

      <button
        type="button"
        className="resource-item-card"
        onClick={() => onShowToast?.('Bài viết này sẽ mở trong phiên bản tiếp theo.')}
      >
        <div className="resource-item-thumb"><Syringe size={20} color="#E87A90" /></div>
        <span className="resource-tag-pill">Tiêm chủng</span>
        <div className="resource-item-title">Lịch tiêm phòng quan trọng năm đầu đời</div>
        <div className="resource-item-stats">
          <span><Eye size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> 6.1k</span>
          <span><Heart size={11} fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }} /> 890</span>
        </div>
      </button>
    </div>
  </>
);

import { FileText, Trash2 } from 'lucide-react';
import { useBabyStore } from '@/store/useBabyStore';
import { getRealGrowthHistory } from '@/domain/growthSelectors';
import { HavenHeadCircIcon, HavenRulerIcon, HavenScaleIcon } from '@/components/common/HavenIcons';

interface GrowthHistoryProps {
  onOpenAddMeasurement: () => void;
}

export const GrowthHistory: React.FC<GrowthHistoryProps> = ({ onOpenAddMeasurement }) => {
  const currentStageData = useBabyStore((state) => state.currentStageData());
  const deleteGrowthMeasurement = useBabyStore((state) => state.deleteGrowthMeasurement);
  const history = getRealGrowthHistory(currentStageData.growthHistory);

  const handleDelete = (id: string, date: string) => {
    if (window.confirm(`Xóa bản ghi cân đo ngày ${date}?`)) {
      deleteGrowthMeasurement(id);
    }
  };

  return (
    <section className="haven-growth-history-sheet" aria-labelledby="growth-history-title">
      <div className="haven-sheet-heading">
        <div>
          <span className="haven-eyebrow">NHẬT KÝ ĐO LƯỜNG</span>
          <h3 id="growth-history-title">Lịch sử cân đo</h3>
        </div>
        <button type="button" className="haven-text-action" onClick={onOpenAddMeasurement}>
          + Thêm số đo
        </button>
      </div>

      {history.length === 0 ? (
        <div className="haven-empty-state">
          <span>
            <HavenRulerIcon size={22} />
          </span>
          <strong>Chưa có dữ liệu đo lường</strong>
          <p>Ghi nhận lần cân đo đầu tiên để theo dõi biểu đồ và đường cong tăng trưởng của Bé.</p>
          <button type="button" className="haven-empty-action" onClick={onOpenAddMeasurement}>
            Ghi lần cân đo đầu tiên
          </button>
        </div>
      ) : (
        <div className="haven-growth-history-list">
          {history.map((record) => (
            <article key={record.id} className="haven-growth-history-row">
              <div className="haven-growth-history-top">
                <span className="haven-growth-history-age">
                  {record.ageText || 'Mốc đo'}
                </span>
                <div className="haven-growth-history-date-box">
                  <span className="haven-growth-history-date">{record.date}</span>
                  <button
                    type="button"
                    className="haven-growth-delete-btn"
                    aria-label={`Xóa số đo ngày ${record.date}`}
                    onClick={() => handleDelete(record.id, record.date)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="haven-growth-history-chips">
                {record.weight > 0 && (
                  <span className="haven-growth-chip">
                    <span className="haven-growth-chip-label">
                      <HavenScaleIcon size={12} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />
                      Cân nặng:
                    </span>
                    <strong>{record.weight} kg</strong>
                  </span>
                )}
                {record.height > 0 && (
                  <span className="haven-growth-chip">
                    <span className="haven-growth-chip-label">
                      <HavenRulerIcon size={12} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />
                      Chiều cao:
                    </span>
                    <strong>{record.height} cm</strong>
                  </span>
                )}
                {record.headCirc > 0 && (
                  <span className="haven-growth-chip">
                    <span className="haven-growth-chip-label">
                      <HavenHeadCircIcon size={12} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />
                      Vòng đầu:
                    </span>
                    <strong>{record.headCirc} cm</strong>
                  </span>
                )}
              </div>

              {record.note && (
                <p className="haven-growth-history-note">
                  <FileText size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4, color: 'var(--color-sage-dark)' }} />
                  <span>{record.note}</span>
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

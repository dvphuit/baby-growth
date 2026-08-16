import { useMemo, useState } from 'react';
import { CircleDot, Plus, Ruler, Scale, TrendingUp } from 'lucide-react';
import { useBabyStore } from '@/store/useBabyStore';
import { buildRealGrowthChart, getRealGrowthHistory } from '@/domain/growthSelectors';
import { WHOChart } from './WHOChart';
import { GrowthHistory } from './GrowthHistory';
import type { GrowthMetric } from '@/types';

interface GrowthViewProps {
  onOpenAddMeasurement: () => void;
}

export const GrowthView: React.FC<GrowthViewProps> = ({ onOpenAddMeasurement }) => {
  const currentStage = useBabyStore((state) => state.currentStage);
  const currentStageData = useBabyStore((state) => state.currentStageData());
  const [growthMetric, setGrowthMetric] = useState<GrowthMetric>('weight');
  const realHistory = useMemo(() => getRealGrowthHistory(currentStageData.growthHistory), [currentStageData.growthHistory]);
  const latest = realHistory[0] ?? null;
  const realChart = useMemo(
    () => buildRealGrowthChart(currentStage, currentStageData.growthChart, currentStageData.growthHistory),
    [currentStage, currentStageData.growthChart, currentStageData.growthHistory],
  );

  return (
    <div className="growth-view-container">
      <section className="app-card">
        <div className="section-header-row">
          <div>
            <div className="section-eyebrow">TĂNG TRƯỞNG</div>
            <h2 className="section-title">Số đo của Bé</h2>
          </div>
          <button type="button" className="btn-primary-small" onClick={onOpenAddMeasurement}><Plus size={14} /> Thêm số đo</button>
        </div>

        {latest ? (
          <div className="growth-vitals-grid" style={{ marginTop: 14 }}>
            <div className="growth-vital-card"><span className="vital-card-label"><Scale size={13} /> Cân nặng</span><span className="vital-card-value">{latest.weight} kg</span></div>
            <div className="growth-vital-card"><span className="vital-card-label"><Ruler size={13} /> Chiều cao</span><span className="vital-card-value">{latest.height} cm</span></div>
            <div className="growth-vital-card"><span className="vital-card-label"><CircleDot size={13} /> Vòng đầu</span><span className="vital-card-value">{latest.headCirc} cm</span></div>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '24px 4px' }}><p>Chưa có số đo được ghi nhận.</p><button type="button" className="log-btn-primary" onClick={onOpenAddMeasurement}>+ Ghi lần cân đo đầu tiên</button></div>
        )}
      </section>

      <section className="chart-card-container" style={{ marginTop: 12 }}>
        <div className="card-header-row"><div className="card-title"><TrendingUp size={15} /><span>Biểu đồ tăng trưởng</span></div></div>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '6px 0 12px' }}>Đường tham chiếu WHO được hiển thị để đối chiếu; ứng dụng không tự kết luận tình trạng sức khỏe.</p>
        <div className="chart-metric-selector-pills">
          <button type="button" className={`metric-pill-choice ${growthMetric === 'weight' ? 'active' : ''}`} onClick={() => setGrowthMetric('weight')}>Cân nặng</button>
          <button type="button" className={`metric-pill-choice ${growthMetric === 'height' ? 'active' : ''}`} onClick={() => setGrowthMetric('height')}>Chiều cao</button>
          <button type="button" className={`metric-pill-choice ${growthMetric === 'headCirc' ? 'active' : ''}`} onClick={() => setGrowthMetric('headCirc')}>Vòng đầu</button>
        </div>
        <WHOChart chartData={realChart} metric={growthMetric} />
      </section>

      <GrowthHistory onOpenAddMeasurement={onOpenAddMeasurement} />
    </div>
  );
};

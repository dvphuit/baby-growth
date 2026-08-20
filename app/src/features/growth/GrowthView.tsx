import { useMemo, useState } from 'react';
import { Info, Plus } from 'lucide-react';
import { useBabyStore } from '@/store/useBabyStore';
import { buildRealGrowthChart, getRealGrowthHistory } from '@/domain/growthSelectors';
import { HavenHeadCircIcon, HavenRulerIcon, HavenScaleIcon } from '@/components/common/HavenIcons';
import type { GrowthMetric } from '@/types';
import { WHOChart } from './WHOChart';
import { MilestoneRoadmap } from './MilestoneRoadmap';
import { GrowthHistory } from './GrowthHistory';

interface GrowthViewProps {
  onOpenAddMeasurement: () => void;
}

function formatDelta(current: number, prev: number, unit: string): string | null {
  if (!current || !prev) return null;
  const diff = parseFloat((current - prev).toFixed(1));
  if (diff > 0) return `+${diff} ${unit}`;
  if (diff < 0) return `${diff} ${unit}`;
  return `0 ${unit}`;
}

export const GrowthView: React.FC<GrowthViewProps> = ({ onOpenAddMeasurement }) => {
  const currentStage = useBabyStore((state) => state.currentStage);
  const currentStageData = useBabyStore((state) => state.currentStageData());
  const familyData = useBabyStore((state) => state.familyData);
  const [growthMetric, setGrowthMetric] = useState<GrowthMetric>('weight');

  const realHistory = useMemo(
    () => getRealGrowthHistory(currentStageData.growthHistory),
    [currentStageData.growthHistory],
  );
  const latest = realHistory[0] ?? null;
  const previous = realHistory[1] ?? null;

  const realChart = useMemo(
    () => buildRealGrowthChart(currentStage, currentStageData.growthChart, currentStageData.growthHistory),
    [currentStage, currentStageData.growthChart, currentStageData.growthHistory],
  );

  const weightDelta = latest && previous ? formatDelta(latest.weight, previous.weight, 'kg') : null;
  const heightDelta = latest && previous ? formatDelta(latest.height, previous.height, 'cm') : null;
  const headDelta = latest && previous ? formatDelta(latest.headCirc, previous.headCirc, 'cm') : null;

  const whoChart = currentStageData.growthChart;
  const refIndex = latest?.labelIndex ?? Math.max(0, (whoChart?.labels?.length ?? 1) - 3);
  const whoRefWeight = whoChart?.weight?.whoP50?.[refIndex] ?? 8.6;
  const whoRefHeight = whoChart?.height?.whoP50?.[refIndex] ?? 70.6;
  const whoRefHead = whoChart?.headCirc?.whoP50?.[refIndex] ?? 44.1;

  const heroOrbitValue = latest?.weight ? `${latest.weight} kg` : 'Sẵn sàng';
  const heroOrbitLabel = latest?.weight ? 'Cân nặng gần nhất' : 'Theo dõi thể chất';
  const childName = familyData.childName || 'Bé';
  const ageDescription = currentStageData.currentAgeText
    ? `${childName} · ${currentStageData.currentAgeText}`
    : 'Theo dõi thể chất định kỳ theo chuẩn WHO';

  return (
    <div className="haven-growth">
      <section className="haven-growth-hero" aria-labelledby="growth-hero-title">
        <div className="haven-growth-hero-copy">
          <span className="haven-eyebrow">NHỊP TĂNG TRƯỞNG</span>
          <h2 id="growth-hero-title">
            Hành trình<br />lớn khôn của Bé.
          </h2>
          <p>{ageDescription}</p>
        </div>

        <div className="haven-growth-orbit" aria-label={`Cân nặng gần nhất: ${heroOrbitValue}`}>
          <strong>{heroOrbitValue}</strong>
          <span>{heroOrbitLabel}</span>
        </div>

        <button
          type="button"
          id="btnQuickAddGrowthMeasurement"
          className="haven-growth-add"
          aria-label="+ Thêm số đo"
          onClick={onOpenAddMeasurement}
        >
          <Plus size={15} />
          <span>Thêm số đo</span>
        </button>
      </section>

      <section className="haven-growth-vitals-sheet" aria-labelledby="growth-vitals-title">
        <div className="haven-sheet-heading">
          <div>
            <span className="haven-eyebrow">CHỈ SỐ THỂ CHẤT</span>
            <h3 id="growth-vitals-title">Số đo gần nhất</h3>
          </div>
          <span className="haven-sheet-date">
            {latest ? (latest.date ? `Ngày ${latest.date}` : 'Gần nhất') : 'Chưa có số đo'}
          </span>
        </div>

        {latest ? (
          <div className="haven-growth-vitals-grid">
            <article className="haven-vital-card weight-card">
              <div className="haven-vital-top">
                <span className="haven-vital-icon">
                  <HavenScaleIcon size={16} />
                </span>
                {weightDelta && <span className="haven-vital-delta-badge">{weightDelta}</span>}
              </div>
              <span className="haven-vital-label">Cân nặng</span>
              <strong className="haven-vital-value">{latest.weight} kg</strong>
              <span className="haven-vital-ref">WHO P50: {whoRefWeight} kg</span>
            </article>

            <article className="haven-vital-card height-card">
              <div className="haven-vital-top">
                <span className="haven-vital-icon">
                  <HavenRulerIcon size={16} />
                </span>
                {heightDelta && <span className="haven-vital-delta-badge">{heightDelta}</span>}
              </div>
              <span className="haven-vital-label">Chiều cao</span>
              <strong className="haven-vital-value">{latest.height} cm</strong>
              <span className="haven-vital-ref">WHO P50: {whoRefHeight} cm</span>
            </article>

            <article className="haven-vital-card head-card">
              <div className="haven-vital-top">
                <span className="haven-vital-icon">
                  <HavenHeadCircIcon size={16} />
                </span>
                {headDelta && <span className="haven-vital-delta-badge">{headDelta}</span>}
              </div>
              <span className="haven-vital-label">Vòng đầu</span>
              <strong className="haven-vital-value">{latest.headCirc} cm</strong>
              <span className="haven-vital-ref">WHO P50: {whoRefHead} cm</span>
            </article>
          </div>
        ) : (
          <div className="haven-empty-state">
            <span>
              <HavenScaleIcon size={22} />
            </span>
            <strong>Chưa có số đo được ghi nhận</strong>
            <p>Hãy ghi nhận lần cân đo đầu tiên để bắt đầu theo dõi nhịp tăng trưởng thể chất của Bé.</p>
            <button type="button" className="haven-empty-action" onClick={onOpenAddMeasurement}>
              Ghi lần cân đo đầu tiên
            </button>
          </div>
        )}
      </section>

      <section className="haven-growth-chart-sheet" aria-labelledby="growth-chart-title">
        <div className="haven-sheet-heading">
          <div>
            <span className="haven-eyebrow">ĐỐI CHIẾU CHUẨN QUỐC TẾ</span>
            <h3 id="growth-chart-title">Biểu đồ tăng trưởng</h3>
          </div>
        </div>

        <div className="haven-chart-metric-pills">
          <button
            type="button"
            className={`haven-metric-pill-btn ${growthMetric === 'weight' ? 'active' : ''}`}
            onClick={() => setGrowthMetric('weight')}
          >
            <HavenScaleIcon size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />
            <span>Cân nặng</span>
          </button>
          <button
            type="button"
            className={`haven-metric-pill-btn ${growthMetric === 'height' ? 'active' : ''}`}
            onClick={() => setGrowthMetric('height')}
          >
            <HavenRulerIcon size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />
            <span>Chiều cao</span>
          </button>
          <button
            type="button"
            className={`haven-metric-pill-btn ${growthMetric === 'headCirc' ? 'active' : ''}`}
            onClick={() => setGrowthMetric('headCirc')}
          >
            <HavenHeadCircIcon size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />
            <span>Vòng đầu</span>
          </button>
        </div>

        <WHOChart chartData={realChart} metric={growthMetric} />

        <div className="haven-chart-info-note">
          <Info size={15} className="haven-chart-info-icon" />
          <span>
            Đường tham chiếu chuẩn của Tổ chức Y tế Thế giới (WHO). Bé phát triển ổn định theo đường cong tự nhiên là chỉ dấu sức khỏe tốt.
          </span>
        </div>
      </section>

      <MilestoneRoadmap />
      <GrowthHistory onOpenAddMeasurement={onOpenAddMeasurement} />
    </div>
  );
};

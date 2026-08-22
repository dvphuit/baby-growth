import { useMemo, useState } from 'react';
import { Info, Plus } from 'lucide-react';
import { useGrowthStore } from '@/features/growth/store/useGrowthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { buildRealGrowthChart, getRealGrowthHistory } from '@/features/growth/domain/growthSelectors';
import { HavenHeadCircIcon, HavenRulerIcon, HavenScaleIcon } from '@/shared/ui/HavenIcons';
import type { GrowthMetric } from '@/features/growth/domain/types';
import { WHOChart } from './WHOChart';
import { GrowthHistory } from './GrowthHistory';

interface GrowthViewProps {
  onOpenAddMeasurement: () => void;
  onSuccessToast?: (message: string) => void;
}

function formatDelta(current: number, prev: number, unit: string): string | null {
  if (!current || !prev) return null;
  const diff = parseFloat((current - prev).toFixed(1));
  if (diff > 0) return `+${diff} ${unit}`;
  if (diff < 0) return `${diff} ${unit}`;
  return `0 ${unit}`;
}

export const GrowthView: React.FC<GrowthViewProps> = ({
  onOpenAddMeasurement,
  onSuccessToast,
}) => {
  const currentStage = useGrowthStore((state) => state.currentStage);
  const currentStageData = useGrowthStore((state) => state.currentStageData());
  const familyData = useProfileStore((state) => state.familyData);
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

  const childName = familyData.childName || 'Bé';
  const ageDescription = currentStageData.currentAgeText
    ? `${childName} · ${currentStageData.currentAgeText}`
    : 'Theo dõi thể chất định kỳ theo chuẩn WHO';
  const latestDateLabel = latest?.date ? `Ngày ${latest.date}` : 'Chưa có số đo';
  const vitalCards = latest ? [
    {
      key: 'weight',
      className: 'weight-card',
      icon: <HavenScaleIcon size={20} color="currentColor" secondaryColor="var(--growth-vital-icon-soft)" />,
      label: 'Cân nặng',
      value: `${latest.weight} kg`,
      delta: weightDelta,
      reference: `WHO P50: ${whoRefWeight} kg`,
    },
    {
      key: 'height',
      className: 'height-card',
      icon: <HavenRulerIcon size={20} color="currentColor" secondaryColor="var(--growth-vital-icon-soft)" />,
      label: 'Chiều cao',
      value: `${latest.height} cm`,
      delta: heightDelta,
      reference: `WHO P50: ${whoRefHeight} cm`,
    },
    {
      key: 'head',
      className: 'head-card',
      icon: <HavenHeadCircIcon size={20} color="currentColor" secondaryColor="var(--growth-vital-icon-soft)" />,
      label: 'Vòng đầu',
      value: `${latest.headCirc} cm`,
      delta: headDelta,
      reference: `WHO P50: ${whoRefHead} cm`,
    },
  ] : [];

  return (
    <div className="haven-growth">
      <section className="haven-growth-summary-card" aria-labelledby="growth-hero-title">
        <div className="haven-growth-ambient" aria-hidden="true" />
        <img
          className="haven-growth-card-decor"
          src="/assets/decor/growth-measure.svg"
          alt=""
          width={320}
          height={320}
          loading="lazy"
          decoding="async"
          aria-hidden="true"
        />
        <div className="haven-growth-summary-header">
          <div className="haven-growth-hero-copy">
            <span className="haven-growth-eyebrow">NHỊP TĂNG TRƯỞNG</span>
            <h2 id="growth-hero-title">Hành trình lớn khôn của {childName}.</h2>
            <p>{ageDescription}</p>
          </div>

          <button
            type="button"
            id="btnQuickAddGrowthMeasurement"
            className="haven-growth-add-btn"
            aria-label="+ Thêm số đo"
            onClick={onOpenAddMeasurement}
          >
            <span><Plus size={22} strokeWidth={2.8} /></span>
          </button>
        </div>

        {latest ? (
          <>
            <div className="haven-growth-vitals-grid" aria-label="Số đo gần nhất">
              {vitalCards.map((vital) => (
                <article className={`haven-vital-card ${vital.className}`} key={vital.key}>
                  <div className="haven-vital-top">
                    <span className="haven-vital-icon">{vital.icon}</span>
                    {vital.delta && <span className="haven-vital-delta-badge">{vital.delta}</span>}
                  </div>
                  <span className="haven-vital-label">{vital.label}</span>
                  <strong className="haven-vital-value">{vital.value}</strong>
                  <span className="haven-vital-ref">{vital.reference}</span>
                </article>
              ))}
            </div>

            <div className="haven-growth-summary-strip">
              <span><Info size={13} /> Lần đo gần nhất</span>
              <strong>{latestDateLabel}</strong>
            </div>
          </>
        ) : (
          <div className="haven-growth-summary-empty">
            <span className="haven-growth-summary-empty-icon">
              <HavenScaleIcon size={24} color="currentColor" secondaryColor="rgba(255, 255, 255, 0.16)" />
            </span>
            <div>
              <strong>Chưa có số đo được ghi nhận</strong>
              <p>Ghi lần cân đo đầu tiên để bắt đầu theo dõi đường cong phát triển của Bé.</p>
            </div>
            <button type="button" onClick={onOpenAddMeasurement}>Ghi số đo đầu tiên</button>
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
            aria-pressed={growthMetric === 'weight'}
            className={`haven-metric-pill-btn metric-weight ${growthMetric === 'weight' ? 'active' : ''}`}
            onClick={() => setGrowthMetric('weight')}
          >
            <HavenScaleIcon
              size={14}
              color="currentColor"
              secondaryColor="var(--metric-icon-soft)"
              style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }}
            />
            <span>Cân nặng</span>
          </button>
          <button
            type="button"
            aria-pressed={growthMetric === 'height'}
            className={`haven-metric-pill-btn metric-height ${growthMetric === 'height' ? 'active' : ''}`}
            onClick={() => setGrowthMetric('height')}
          >
            <HavenRulerIcon
              size={14}
              color="currentColor"
              secondaryColor="var(--metric-icon-soft)"
              style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }}
            />
            <span>Chiều cao</span>
          </button>
          <button
            type="button"
            aria-pressed={growthMetric === 'headCirc'}
            className={`haven-metric-pill-btn metric-head ${growthMetric === 'headCirc' ? 'active' : ''}`}
            onClick={() => setGrowthMetric('headCirc')}
          >
            <HavenHeadCircIcon
              size={14}
              color="currentColor"
              secondaryColor="var(--metric-icon-soft)"
              style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }}
            />
            <span>Vòng đầu</span>
          </button>
        </div>

        <WHOChart chartData={realChart} metric={growthMetric} />

        <div className="haven-chart-info-note">
          <Info size={15} className="haven-chart-info-icon" />
          <span>
            Đường tham chiếu của Tổ chức Y tế Thế giới (WHO). Hãy theo dõi xu hướng qua nhiều lần đo thay vì kết luận từ một điểm riêng lẻ.
          </span>
        </div>
      </section>

      <GrowthHistory
        onOpenAddMeasurement={onOpenAddMeasurement}
        onSuccessToast={onSuccessToast}
      />
    </div>
  );
};

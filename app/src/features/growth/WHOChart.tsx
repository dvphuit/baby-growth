import { useEffect, useRef } from 'react';
import { Chart, registerables, type ChartDataset } from 'chart.js';
import type { GrowthChartData, GrowthMetric } from '@/features/growth/domain/types';

Chart.register(...registerables);

interface WHOChartProps {
  chartData: GrowthChartData;
  metric: GrowthMetric;
}

type LineDataset = ChartDataset<'line', (number | null)[]>;

export const WHOChart: React.FC<WHOChartProps> = ({ chartData, metric }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart<'line', (number | null)[], string> | null>(null);
  const unitRef = useRef('cm');

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new Chart<'line', (number | null)[], string>(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [],
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(51, 37, 31, 0.94)',
            padding: 10,
            cornerRadius: 12,
            titleFont: { family: "'Outfit', -apple-system, sans-serif", size: 12, weight: 'bold' },
            bodyFont: { family: "'Plus Jakarta Sans', -apple-system, sans-serif", size: 11 },
            callbacks: {
              label: (context) => {
                if (context.raw === null || context.raw === undefined) return '';
                return ` ${context.dataset.label}: ${context.raw} ${unitRef.current}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: "'Plus Jakarta Sans', -apple-system, sans-serif", size: 10, weight: 'bold' },
              color: '#82776E',
            },
          },
          y: {
            grid: { color: '#ECE6DD' },
            ticks: {
              font: { family: "'Plus Jakarta Sans', -apple-system, sans-serif", size: 10, weight: 'bold' },
              color: '#82776E',
              callback: (value) => `${value} ${unitRef.current}`,
            },
          },
        },
      },
    });

    chartInstanceRef.current = chart;
    return () => {
      chart.destroy();
      if (chartInstanceRef.current === chart) chartInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart) return;

    let datasetObj = chartData.height;
    let unit = 'cm';
    let metricLabel = 'Số đo của Bé';

    if (metric === 'weight') {
      datasetObj = chartData.weight;
      unit = 'kg';
      metricLabel = 'Cân nặng của Bé';
    } else if (metric === 'headCirc') {
      datasetObj = chartData.headCirc;
      metricLabel = 'Vòng đầu của Bé';
    }

    unitRef.current = unit;
    const datasets: LineDataset[] = [
      {
        label: metricLabel,
        data: [...(datasetObj?.child ?? [])],
        borderColor: '#33251F',
        backgroundColor: 'rgba(51, 37, 31, 0.12)',
        borderWidth: 3.5,
        pointBackgroundColor: '#33251F',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2.5,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: false,
        tension: 0.35,
        order: 1,
        spanGaps: true,
      },
      {
        label: 'WHO Chuẩn (P50)',
        data: [...(datasetObj?.whoP50 ?? [])],
        borderColor: '#748756',
        borderDash: [5, 4],
        borderWidth: 2.2,
        pointRadius: 0,
        fill: false,
        tension: 0.35,
        order: 2,
      },
      {
        label: 'WHO Ngưỡng trên (P97)',
        data: [...(datasetObj?.whoP97 ?? [])],
        borderColor: 'rgba(141, 160, 111, 0.45)',
        borderWidth: 1.2,
        pointRadius: 0,
        fill: '+1',
        backgroundColor: 'rgba(141, 160, 111, 0.14)',
        tension: 0.35,
        order: 3,
      },
      {
        label: 'WHO Ngưỡng dưới (P3)',
        data: [...(datasetObj?.whoP3 ?? [])],
        borderColor: 'rgba(141, 160, 111, 0.45)',
        borderWidth: 1.2,
        pointRadius: 0,
        fill: false,
        tension: 0.35,
        order: 4,
      },
    ];

    chart.data.labels = [...(chartData.labels ?? [])];
    chart.data.datasets = datasets;
    chart.update('none');
  }, [chartData, metric]);

  return (
    <div>
      <div className="haven-chart-canvas-box">
        <canvas ref={canvasRef} />
      </div>

      <div className="haven-chart-legend">
        <div className="haven-legend-item">
          <span className="haven-legend-indicator child" />
          <span>Số đo của Bé</span>
        </div>
        <div className="haven-legend-item">
          <span className="haven-legend-indicator p50" />
          <span>WHO Chuẩn (P50)</span>
        </div>
        <div className="haven-legend-item">
          <span className="haven-legend-indicator band" />
          <span>Vùng an toàn (P3 - P97)</span>
        </div>
      </div>
    </div>
  );
};

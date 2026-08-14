import { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import type { GrowthChartData, GrowthMetric } from '../../types';

Chart.register(...registerables);

interface WHOChartProps {
  chartData: GrowthChartData;
  metric: GrowthMetric;
}

export const WHOChart: React.FC<WHOChartProps> = ({ chartData, metric }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !chartData) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let datasetObj = chartData.height;
    let unit = 'cm';
    let metricLabel = 'Chiều cao của bé';

    if (metric === 'weight') {
      datasetObj = chartData.weight;
      unit = 'kg';
      metricLabel = 'Cân nặng của bé';
    } else if (metric === 'headCirc') {
      datasetObj = chartData.headCirc;
      unit = 'cm';
      metricLabel = 'Vòng đầu của bé';
    }

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels || [],
        datasets: [
          {
            label: metricLabel,
            data: datasetObj?.child || [],
            borderColor: '#33251F',
            backgroundColor: 'rgba(141, 160, 111, 0.18)',
            borderWidth: 3.5,
            pointBackgroundColor: '#33251F',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            fill: false,
            tension: 0.35,
            order: 1,
          },
          {
            label: 'WHO Chuẩn Trung bình (P50)',
            data: datasetObj?.whoP50 || [],
            borderColor: '#8DA06F',
            borderDash: [5, 5],
            borderWidth: 2.2,
            pointRadius: 0,
            fill: false,
            tension: 0.35,
            order: 2,
          },
          {
            label: 'WHO Ngưỡng trên (P97)',
            data: datasetObj?.whoP97 || [],
            borderColor: 'rgba(245, 184, 66, 0.65)',
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
            tension: 0.35,
            order: 3,
          },
          {
            label: 'WHO Ngưỡng dưới (P3)',
            data: datasetObj?.whoP3 || [],
            borderColor: 'rgba(233, 115, 50, 0.55)',
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
            tension: 0.35,
            order: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false, // Custom HTML legend used instead
          },
          tooltip: {
            backgroundColor: 'rgba(51, 37, 31, 0.95)',
            padding: 10,
            cornerRadius: 10,
            titleFont: { family: "'Outfit', sans-serif", size: 12, weight: 'bold' },
            bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
            callbacks: {
              label: (context) => {
                if (context.raw === null || context.raw === undefined) return '';
                return ` ${context.dataset.label}: ${context.raw} ${unit}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 10, weight: 'bold' },
              color: '#82776E',
            },
          },
          y: {
            grid: { color: '#ECE6DD' },
            ticks: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 10, weight: 'bold' },
              color: '#82776E',
              callback: (val) => `${val} ${unit}`,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartData, metric]);

  return (
    <div className="chart-canvas-wrapper" style={{ height: '240px', position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

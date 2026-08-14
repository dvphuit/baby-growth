import { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import type { StageExpenseData } from '../../types';

Chart.register(...registerables);

interface ExpenseBarProps {
  expenseData: StageExpenseData;
}

export const ExpenseBar: React.FC<ExpenseBarProps> = ({ expenseData }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !expenseData || !expenseData.monthlyHistory) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const history = expenseData.monthlyHistory || [];
    const labels = history.map((m) => m.month);
    const data = history.map((m) => m.amount);

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Chi tiêu (nghìn VNĐ)',
            data,
            backgroundColor: '#8DA06F',
            borderRadius: 8,
            hoverBackgroundColor: '#748756',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(51, 37, 31, 0.95)',
            padding: 8,
            cornerRadius: 10,
            bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
            callbacks: {
              label: (context) => {
                if (typeof context.raw === 'number') {
                  return ` Chi tiêu: ${(context.raw * 1000).toLocaleString('vi-VN')} đ`;
                }
                return '';
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 10 },
              color: '#82776E',
            },
          },
          y: {
            grid: { color: '#ECE6DD' },
            ticks: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 10 },
              color: '#82776E',
              callback: (val) => `${Number(val) / 1000} tr`,
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [expenseData]);

  return (
    <div className="bar-chart-container" style={{ height: '180px', position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

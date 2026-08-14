import { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import type { StageExpenseData } from '../../types';

Chart.register(...registerables);

interface ExpenseDonutProps {
  expenseData: StageExpenseData;
}

export const ExpenseDonut: React.FC<ExpenseDonutProps> = ({ expenseData }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !expenseData || !expenseData.categories) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const labels = expenseData.categories.map((c) => c.name);
    const data = expenseData.categories.map((c) => c.percent);
    const colors = expenseData.categories.map((c) => c.color);

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderWidth: 3,
            borderColor: '#FFFFFF',
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(51, 37, 31, 0.95)',
            padding: 8,
            cornerRadius: 10,
            bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
            callbacks: {
              label: (context) => ` ${context.label}: ${context.raw}%`,
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
    <div className="donut-chart-container" style={{ height: '200px', position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

import { useBabyStore } from '@/store/useBabyStore';
import { useState } from 'react';
import { ExpenseDonut } from './ExpenseDonut';
import { PieChart, GraduationCap, Plus, Wallet, Sparkles } from 'lucide-react';

interface ExpensesViewProps {
  onOpenAddExpense: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ onOpenAddExpense }) => {
  const currentStageData = useBabyStore(s => s.currentStageData());
  const exp = currentStageData.expenses || {
    totalMonth: '4,850,000 đ',
    budgetMonth: '6,000,000 đ',
    budgetPercent: 80,
    categories: [],
  };

  const [savingAmount, setSavingAmount] = useState<number>(3000000);

  // Compound interest calculation for 18 years at 8.5% annual return
  const years = 18;
  const rate = 0.085 / 12;
  const n = years * 12;
  const futureValue = Math.round(
    savingAmount * ((Math.pow(1 + rate, n) - 1) / rate) * (1 + rate)
  );

  return (
    <div className="expenses-view-container">
      {/* 1. EXPENSE SUMMARY HERO */}
      <div className="expense-summary-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="expense-hero-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Wallet size={11} /> TỔNG CHI THÁNG NÀY
            </div>
            <div className="expense-hero-amount">{exp.totalMonth}</div>
          </div>
          <button
            id="btnQuickAddExpenseFromTab"
            onClick={onOpenAddExpense}
            style={{
              background: '#FFFFFF',
              color: 'var(--color-primary-dark)',
              border: 'none',
              fontFamily: 'var(--font-family-display)',
              fontSize: '10.5px',
              fontWeight: 700,
              padding: '5px 10px',
              borderRadius: 'var(--radius-pill)',
              cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(0,0,0,0.18)',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <Plus size={12} strokeWidth={2.4} />
            <span>Thêm chi</span>
          </button>
        </div>

        <div className="budget-progress-box">
          <div className="budget-text-row">
            <span>Đã dùng: {exp.budgetPercent}%</span>
            <span>Hạn mức: {exp.budgetMonth}</span>
          </div>
          <div className="budget-bar-track">
            <div className="budget-bar-fill" style={{ width: `${exp.budgetPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY BREAKDOWN CHART CARD */}
      <div className="chart-card-container">
        <div className="card-header-row">
          <div className="card-title">
            <PieChart size={15} color="var(--color-sage-dark)" />
            <span>Danh mục Chi tiêu</span>
          </div>
        </div>

        <ExpenseDonut expenseData={exp} />

        <div className="expense-categories-list">
          {(exp.categories || []).map((cat, idx) => (
            <div key={idx} className="expense-cat-item">
              <div className="cat-item-left">
                <div className="cat-color-dot" style={{ background: cat.color }}></div>
                <span className="cat-name">
                  {cat.name} ({cat.percent}%)
                </span>
              </div>
              <span className="cat-amount">{cat.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. FUTURE PLANNING & SAVINGS CALCULATOR */}
      <div className="future-calc-card">
        <div className="future-calc-header">
          <div style={{ color: 'var(--color-primary-dark)' }}>
            <GraduationCap size={20} />
          </div>
          <span className="future-calc-title">Quỹ Tương lai (18 Tuổi)</span>
        </div>

        <div className="slider-control-group">
          <div className="slider-label-row">
            <span>Tiết kiệm mỗi tháng:</span>
            <strong id="sliderSavingVal" style={{ color: 'var(--color-primary-dark)' }}>
              {savingAmount.toLocaleString('vi-VN')} đ
            </strong>
          </div>
          <input
            type="range"
            min="500000"
            max="20000000"
            step="500000"
            value={savingAmount}
            className="custom-range-slider"
            id="monthlySavingSlider"
            onChange={(e) => setSavingAmount(parseInt(e.target.value, 10))}
          />
        </div>

        <div className="future-result-box">
          <span className="future-result-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Sparkles size={11} /> ƯỚC TÍNH TÍCH LŨY KHI 18 TUỔI
          </span>
          <div className="future-result-amount" id="futureAccumulatedVal">
            {futureValue.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '9.5px', color: 'var(--color-text-muted)', marginTop: '3px' }}>
            *Giả định lãi kép 8.5%/năm qua quỹ đầu tư giáo dục.
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Haven expenses timeline: unified monthly summary hero card,
 * monthly budget progress bar, category filter pills,
 * and wrap-safe responsive daily timeline stream.
 */
import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  FilterX,
  Pencil,
  Plus,
  Receipt,
  RotateCcw,
  Sparkles,
  Tag,
  Target,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import { useExpenseStore } from '@/store/useExpenseStore';
import { ExpenseCategoryIcon } from './ExpenseCategoryIcon';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';
import { getExpenseCategory } from '@/data/expenseCategories';
import type { ExpenseRecord } from '@/types/expense';
import type { AddToast } from '@/hooks/useAppModals';

interface ExpensesViewProps {
  onOpenAddExpense: () => void;
  onShowToast?: AddToast;
}

interface DateGroup {
  dateKey: string;
  dateLabel: string;
  totalDayAmount: number;
  records: ExpenseRecord[];
}

function formatCurrency(value: number): string {
  return `${Math.round(value).toLocaleString('vi-VN')} đ`;
}

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatGroupDateLabel(dateKey: string): string {
  try {
    const [year, month, day] = dateKey.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const yesterday = new Date(Date.now() - 86_400_000);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (dateKey === todayKey) {
      return `Hôm nay · ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
    }
    if (dateKey === yesterdayKey) {
      return `Hôm qua · ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
    }

    const dayOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][d.getDay()];
    return `${dayOfWeek} · ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  } catch {
    return dateKey;
  }
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  onOpenAddExpense,
  onShowToast,
}) => {
  const expenses = useExpenseStore((state) => state.expenses);
  const deleteExpense = useExpenseStore((state) => state.deleteExpense);
  const monthlyBudget = useExpenseStore((state) => state.monthlyBudget);
  const setMonthlyBudget = useExpenseStore((state) => state.setMonthlyBudget);

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInputK, setBudgetInputK] = useState('5000');

  const realNow = useMemo(() => new Date(), []);
  const isViewingCurrentMonth =
    currentDate.getFullYear() === realNow.getFullYear() &&
    currentDate.getMonth() === realNow.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleResetMonth = () => {
    setCurrentDate(new Date());
  };

  // Filter expenses by selected month
  const monthExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const d = new Date(item.occurredAt);
      return (
        d.getFullYear() === currentDate.getFullYear() &&
        d.getMonth() === currentDate.getMonth()
      );
    });
  }, [expenses, currentDate]);

  const totalMonth = useMemo(
    () => monthExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [monthExpenses]
  );

  // Budget calculations
  const safeBudget = monthlyBudget > 0 ? monthlyBudget : 5_000_000;
  const usedPercent = Math.round((totalMonth / safeBudget) * 100);
  const isOverBudget = totalMonth > safeBudget;
  const remainingBudget = safeBudget - totalMonth;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const valK = parseFloat(budgetInputK.replace(/,/g, ''));
    if (!isNaN(valK) && valK > 0) {
      const newBudget = Math.round(valK * 1000);
      setMonthlyBudget(newBudget);
      setIsEditingBudget(false);
      if (onShowToast) {
        onShowToast(`Đã đổi ngân sách tháng thành ${formatCurrency(newBudget)}`, '🎯');
      }
    }
  };

  // Category breakdown stats
  const categoryTotals = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    monthExpenses.forEach((item) => {
      const cats = item.category.split(',').map((c) => c.trim()).filter(Boolean);
      if (cats.length > 1) {
        const splitAmount = (Number(item.amount) || 0) / cats.length;
        cats.forEach((cat) => {
          const current = map.get(cat) || { total: 0, count: 0 };
          map.set(cat, { total: current.total + splitAmount, count: current.count + 1 });
        });
      } else {
        const cat = item.category || 'Khác';
        const current = map.get(cat) || { total: 0, count: 0 };
        map.set(cat, { total: current.total + (Number(item.amount) || 0), count: current.count + 1 });
      }
    });
    return Array.from(map.entries()).sort((a, b) => b[1].total - a[1].total);
  }, [monthExpenses]);

  // Filtered transactions for timeline
  const displayedExpenses = useMemo(() => {
    const list = selectedCategoryFilter
      ? monthExpenses.filter((item) => item.category.includes(selectedCategoryFilter))
      : monthExpenses;
    return [...list].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }, [monthExpenses, selectedCategoryFilter]);

  // Group timeline by date (YYYY-MM-DD)
  const timelineDateGroups = useMemo(() => {
    const map = new Map<string, ExpenseRecord[]>();

    displayedExpenses.forEach((record) => {
      try {
        const d = new Date(record.occurredAt);
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const group = map.get(dateKey) || [];
        group.push(record);
        map.set(dateKey, group);
      } catch {
        const fallbackKey = 'other';
        const group = map.get(fallbackKey) || [];
        group.push(record);
        map.set(fallbackKey, group);
      }
    });

    const groups: DateGroup[] = [];
    map.forEach((records, dateKey) => {
      records.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
      const totalDay = records.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      groups.push({
        dateKey,
        dateLabel: formatGroupDateLabel(dateKey),
        totalDayAmount: totalDay,
        records,
      });
    });

    groups.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
    return groups;
  }, [displayedExpenses]);

  const monthLabel = `Tháng ${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
  const topCategoryEntry = categoryTotals[0];

  // Days in month calculation for average
  const daysInCurrentMonth = useMemo(() => {
    if (isViewingCurrentMonth) {
      return Math.max(1, realNow.getDate());
    }
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  }, [currentDate, isViewingCurrentMonth, realNow]);

  const averagePerDay = Math.round(totalMonth / daysInCurrentMonth);

  const handleDelete = (record: ExpenseRecord) => {
    if (window.confirm(`Bạn có chắc muốn xóa khoản chi "${record.category}" (${formatCurrency(record.amount)})?`)) {
      deleteExpense(record.id);
      if (onShowToast) {
        onShowToast(`Đã xóa khoản chi ${record.category}`, '🗑️');
      }
    }
  };

  return (
    <div className="haven-expenses">
      {/* 1. Decorated Main Summary Card (Card Chính là Summary) */}
      <section className="haven-expense-summary-card" aria-labelledby="expense-summary-title">
        {/* Glowing atmospheric orb */}
        <div className="haven-summary-ambient-glow" aria-hidden="true" />

        {/* Month Navigator Header */}
        <div className="haven-summary-month-nav">
          <button
            type="button"
            className="haven-month-nav-btn"
            onClick={handlePrevMonth}
            aria-label="Tháng trước"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="haven-month-nav-center">
            <CalendarDays size={13} className="haven-month-icon-dot" />
            <span className="haven-month-nav-title">{monthLabel}</span>
            {!isViewingCurrentMonth && (
              <button
                type="button"
                className="haven-month-reset-badge"
                onClick={handleResetMonth}
                title="Về tháng hiện tại"
              >
                <RotateCcw size={10} /> Hiện tại
              </button>
            )}
          </div>
          <button
            type="button"
            className="haven-month-nav-btn"
            onClick={handleNextMonth}
            aria-label="Tháng sau"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Hero Spending Amount Readout */}
        <div className="haven-summary-hero-row">
          <div className="haven-summary-hero-copy">
            <div className="haven-eyebrow-pill">
              <Sparkles size={10} className="haven-sparkle-ico" />
              <span>TỔNG QUAN CHI TIÊU</span>
            </div>
            <h2 id="expense-summary-title">{formatCurrency(totalMonth)}</h2>
            <p>
              {monthExpenses.length ? (
                <>
                  <b>{monthExpenses.length} khoản đã ghi</b>
                  {totalMonth > 0 && <span> · ~ {formatCurrency(averagePerDay)}/ngày</span>}
                </>
              ) : (
                'Chưa có khoản chi nào trong tháng'
              )}
            </p>
          </div>

          {/* Prominent Icon-Only Quick Add CTA Jewel Button */}
          <button
            type="button"
            id="btnHeroAddExpense"
            className="haven-hero-add-gem-btn"
            aria-label="+ Thêm khoản chi"
            onClick={onOpenAddExpense}
            title="Thêm khoản chi tiêu mới"
          >
            <div className="haven-add-gem-outer">
              <div className="haven-add-gem-core">
                <Plus size={22} strokeWidth={2.8} className="haven-add-gem-icon" />
              </div>
            </div>
          </button>
        </div>

        {/* Budget Progress Bar Section */}
        <div className="haven-budget-panel" aria-label="Tiến độ ngân sách tháng">
          <div className="haven-budget-header">
            <div className="haven-budget-title-group">
              <Target size={12} className="haven-budget-icon" />
              <span className="haven-budget-label">Ngân sách:</span>
              {isEditingBudget ? (
                <form onSubmit={handleSaveBudget} className="haven-budget-edit-form">
                  <input
                    type="number"
                    className="haven-budget-input"
                    value={budgetInputK}
                    onChange={(e) => setBudgetInputK(e.target.value)}
                    placeholder="5000"
                    autoFocus
                    min="100"
                    step="100"
                    aria-label="Số tiền ngân sách tính theo nghìn đồng"
                  />
                  <span className="haven-budget-k-unit">k</span>
                  <button type="submit" className="haven-budget-action-btn haven-budget-save" title="Lưu">
                    <Check size={11} />
                  </button>
                  <button
                    type="button"
                    className="haven-budget-action-btn haven-budget-cancel"
                    onClick={() => setIsEditingBudget(false)}
                    title="Hủy"
                  >
                    <X size={11} />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  className="haven-budget-val-btn"
                  onClick={() => {
                    setBudgetInputK(String(Math.round(safeBudget / 1000)));
                    setIsEditingBudget(true);
                  }}
                  title="Chạm để chỉnh sửa hạn mức ngân sách"
                >
                  <span>{formatCurrency(safeBudget)}</span>
                  <Pencil size={10} className="haven-budget-pencil" />
                </button>
              )}
            </div>

            <span className={`haven-budget-percent-badge ${isOverBudget ? 'over' : usedPercent > 80 ? 'warn' : ''}`}>
              {isOverBudget ? `Vượt ${usedPercent}%` : `${usedPercent}%`}
            </span>
          </div>

          {/* Progress Bar Track */}
          <div
            className="haven-budget-track"
            role="progressbar"
            aria-valuenow={usedPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Tỷ lệ sử dụng ngân sách"
          >
            <div
              className={`haven-budget-fill ${isOverBudget ? 'over' : usedPercent > 80 ? 'warn' : ''}`}
              style={{ width: `${Math.min(100, Math.max(usedPercent > 0 ? 3 : 0, usedPercent))}%` }}
            />
          </div>

          {/* Budget Subline Status */}
          <div className="haven-budget-footer">
            <span className="haven-budget-foot-spent">
              Đã chi: <b>{formatCurrency(totalMonth)}</b>
            </span>
            <span className={`haven-budget-foot-rem ${isOverBudget ? 'over' : ''}`}>
              {isOverBudget
                ? `Vượt: +${formatCurrency(totalMonth - safeBudget)}`
                : `Còn: ${formatCurrency(remainingBudget)}`}
            </span>
          </div>
        </div>

        {/* Mini Stats Row inside Summary Card */}
        {monthExpenses.length > 0 && (
          <div className="haven-summary-metrics-strip">
            <div className="haven-summary-metric">
              <div className="haven-metric-title-row">
                <TrendingUp size={10} />
                <span className="haven-metric-label">TB / ngày</span>
              </div>
              <strong className="haven-metric-val">{formatCurrency(averagePerDay)}</strong>
            </div>
            <div className="haven-summary-metric-divider" />
            <div className="haven-summary-metric">
              <div className="haven-metric-title-row">
                <Tag size={10} />
                <span className="haven-metric-label">Nhiều nhất</span>
              </div>
              <strong className="haven-metric-val" title={topCategoryEntry ? topCategoryEntry[0] : ''}>
                {topCategoryEntry ? topCategoryEntry[0] : '—'}
              </strong>
            </div>
            <div className="haven-summary-metric-divider" />
            <div className="haven-summary-metric">
              <div className="haven-metric-title-row">
                <Receipt size={10} />
                <span className="haven-metric-label">Giao dịch</span>
              </div>
              <strong className="haven-metric-val">{monthExpenses.length} khoản</strong>
            </div>
          </div>
        )}

        {/* Category Breakdown & Filter Pills */}
        {categoryTotals.length > 0 && (
          <div className="haven-summary-filter-section" aria-label="Bộ lọc danh mục chi tiêu">
            <div className="haven-filter-pills-row">
              <button
                type="button"
                className={`haven-filter-pill ${selectedCategoryFilter === null ? 'active' : ''}`}
                onClick={() => setSelectedCategoryFilter(null)}
              >
                <span>Tất cả</span>
                <span className="haven-filter-count">{monthExpenses.length}</span>
              </button>
              {categoryTotals.map(([catName, info]) => {
                const isSelected = selectedCategoryFilter === catName;
                const catDef = getExpenseCategory(catName);
                return (
                  <button
                    key={catName}
                    type="button"
                    className={`haven-filter-pill ${isSelected ? 'active' : ''}`}
                    style={{
                      borderColor: isSelected ? catDef.color : undefined,
                      backgroundColor: isSelected ? catDef.bgLight : undefined,
                      color: isSelected ? catDef.color : undefined,
                    }}
                    onClick={() =>
                      setSelectedCategoryFilter((prev) => (prev === catName ? null : catName))
                    }
                  >
                    <ExpenseCategoryIcon category={catName} size={12} />
                    <span>{catName}</span>
                    <span className="haven-filter-count">{formatCurrency(info.total)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 2. Timeline Stream (Không lồng trong outer card, wrap-safe cho mọi màn hình) */}
      <section className="haven-expense-timeline-section" aria-label="Dòng thời gian chi tiêu">
        {selectedCategoryFilter && (
          <div className="haven-timeline-filter-banner">
            <span className="haven-filter-banner-text">
              Đang lọc danh mục: <strong>{selectedCategoryFilter}</strong>
            </span>
            <button
              type="button"
              className="haven-filter-clear-btn"
              onClick={() => setSelectedCategoryFilter(null)}
              title="Bỏ lọc danh mục"
            >
              <FilterX size={12} /> Bỏ lọc
            </button>
          </div>
        )}

        {timelineDateGroups.length === 0 ? (
          <div className="haven-empty-state haven-timeline-empty">
            <span>
              <Sparkles size={20} />
            </span>
            <strong>
              {selectedCategoryFilter
                ? `Không có khoản chi nào thuộc "${selectedCategoryFilter}" trong ${monthLabel}`
                : `Chưa có khoản chi nào trong ${monthLabel}`}
            </strong>
            <p>Ghi chép các khoản chi giúp theo dõi nhịp tài chính gia đình một cách nhẹ nhàng, chủ động.</p>
            <button
              type="button"
              className="haven-empty-action"
              onClick={onOpenAddExpense}
            >
              Thêm khoản chi ngay
            </button>
          </div>
        ) : (
          <div className="haven-timeline-stream">
            {timelineDateGroups.map((group) => (
              <div key={group.dateKey} className="haven-timeline-day-group">
                {/* Sticky Day Header */}
                <div className="haven-day-header">
                  <div className="haven-day-header-left">
                    <CalendarDays size={13} className="haven-day-icon" />
                    <span className="haven-day-label">{group.dateLabel}</span>
                  </div>
                  <span className="haven-day-sum-badge">
                    Tổng: <b>{formatCurrency(group.totalDayAmount)}</b>
                  </span>
                </div>

                {/* Day Timeline Track */}
                <div className="haven-day-timeline-track">
                  {group.records.map((record) => {
                    const primaryCatName = record.category.split(',')[0].trim();
                    const primaryCatDef = getExpenseCategory(primaryCatName);
                    const allCatNames = record.category.split(',').map((c) => c.trim()).filter(Boolean);

                    return (
                      <div key={record.id} className="haven-timeline-item">
                        {/* Timeline Node Icon */}
                        <div
                          className="haven-timeline-node"
                          style={{
                            borderColor: primaryCatDef.color,
                            color: primaryCatDef.color,
                          }}
                        >
                          <ExpenseCategoryIcon category={primaryCatName} size={12} />
                        </div>

                        {/* 3-Tier Wrap-Safe Card */}
                        <div className="haven-timeline-card">
                          {/* Row 1: Categories & Amount */}
                          <div className="haven-tl-row-top">
                            <div className="haven-tl-cat-list">
                              {allCatNames.map((catName) => {
                                const catDef = getExpenseCategory(catName);
                                return (
                                  <span
                                    key={catName}
                                    className="haven-tl-cat-badge"
                                    style={{
                                      backgroundColor: catDef.bgLight,
                                      borderColor: `${catDef.color}30`,
                                      color: catDef.color,
                                    }}
                                  >
                                    <ExpenseCategoryIcon category={catName} size={11} />
                                    <span>{catName}</span>
                                  </span>
                                );
                              })}
                            </div>
                            <div className="haven-tl-amount-badge">
                              <span className="haven-tl-amount">{formatCurrency(record.amount)}</span>
                            </div>
                          </div>

                          {/* Row 2: Note Box with Natural Wrapping */}
                          {record.note && (
                            <div className="haven-tl-note-box">
                              <p className="haven-tl-note">{record.note}</p>
                            </div>
                          )}

                          {/* Row 3: Footer with Time and Action Buttons */}
                          <div className="haven-tl-footer">
                            <span className="haven-tl-time">{formatTime(record.occurredAt)}</span>
                            <div className="haven-tl-actions">
                              <button
                                type="button"
                                className="haven-tl-act-btn"
                                onClick={() => setEditingExpense(record)}
                                title="Chỉnh sửa khoản chi"
                              >
                                <Pencil size={11} /> Sửa
                              </button>
                              <button
                                type="button"
                                className="haven-tl-act-btn haven-tl-act-del"
                                onClick={() => handleDelete(record)}
                                title="Xóa khoản chi"
                              >
                                <Trash2 size={11} /> Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Edit Expense Modal */}
      {editingExpense && (
        <AddExpenseModal
          isOpen={true}
          onClose={() => setEditingExpense(null)}
          editingExpense={editingExpense}
          onSuccessToast={(msg) => onShowToast?.(msg)}
        />
      )}
    </div>
  );
};

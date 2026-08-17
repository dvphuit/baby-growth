import React, { useState, useEffect, useMemo } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { useExpenseStore } from '@/store/useExpenseStore';
import {
  EXPENSE_CATEGORIES,
} from '@/data/expenseCategories';
import { ExpenseKeypad } from '../expenses/ExpenseKeypad';
import {
  evaluateMathExpression,
  formatExpression,
} from '@/utils/expenseMath';
import { ExpenseCategoryIcon } from '../expenses/ExpenseCategoryIcon';
import type { ExpenseRecord } from '@/types/expense';
import { Calendar, Check } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
  editingExpense?: ExpenseRecord | null;
}

function localDateTimeInputValue(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function getYesterdayDateTime(): string {
  const yesterday = new Date(Date.now() - 86_400_000);
  const local = new Date(yesterday.getTime() - yesterday.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
  editingExpense,
}) => {
  const addExpense = useExpenseStore((state) => state.addExpense);
  const updateExpense = useExpenseStore((state) => state.updateExpense);

  const [expression, setExpression] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    EXPENSE_CATEGORIES[0].name,
  ]);
  const [occurredAt, setOccurredAt] = useState(localDateTimeInputValue);
  const [datePreset, setDatePreset] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Sync initial state when opened or when editingExpense changes
  useEffect(() => {
    if (isOpen) {
      if (editingExpense) {
        // Express amount in thousands (x1000)
        const thousandsVal = editingExpense.amount / 1000;
        setExpression(String(thousandsVal));
        // Parse multi categories if separated by comma
        const parsed = (editingExpense.category || '')
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean);
        setSelectedCategories(parsed.length > 0 ? parsed : ['Khác']);
        setOccurredAt(localDateTimeInputValue(new Date(editingExpense.occurredAt)));
        setDatePreset('custom');
        setNote(editingExpense.note || '');
      } else {
        setExpression('');
        setSelectedCategories([EXPENSE_CATEGORIES[0].name]);
        setOccurredAt(localDateTimeInputValue());
        setDatePreset('today');
        setNote('');
      }
      setError(null);
    }
  }, [isOpen, editingExpense]);

  // currentAmount in thousands (e.g. 350 for 350.000 đ)
  const currentThousands = useMemo(() => evaluateMathExpression(expression), [expression]);
  const finalVndAmount = useMemo(() => Math.round(currentThousands * 1000), [currentThousands]);

  const handleToggleCategory = (catName: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(catName)) {
        const filtered = prev.filter((c) => c !== catName);
        // Default to ['Khác'] if empty
        return filtered.length > 0 ? filtered : ['Khác'];
      } else {
        // If currently only ['Khác'] and selecting another category, replace 'Khác'
        if (prev.length === 1 && prev[0] === 'Khác' && catName !== 'Khác') {
          return [catName];
        }
        return [...prev, catName];
      }
    });
  };

  const handleDatePreset = (preset: 'today' | 'yesterday' | 'custom') => {
    setDatePreset(preset);
    if (preset === 'today') {
      setOccurredAt(localDateTimeInputValue());
    } else if (preset === 'yesterday') {
      setOccurredAt(getYesterdayDateTime());
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!Number.isFinite(finalVndAmount) || finalVndAmount <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ lớn hơn 0.');
      return;
    }

    const effectiveCategories = selectedCategories.length > 0 ? selectedCategories : ['Khác'];
    const combinedCategory = effectiveCategories.join(', ');

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        amount: finalVndAmount,
        category: combinedCategory,
        occurredAt: new Date(occurredAt).toISOString(),
        note: note.trim() || undefined,
      });
      onSuccessToast?.(`Đã cập nhật khoản chi ${finalVndAmount.toLocaleString('vi-VN')} đ.`);
    } else {
      addExpense({
        amount: finalVndAmount,
        category: combinedCategory,
        occurredAt: new Date(occurredAt).toISOString(),
        note: note.trim() || undefined,
      });
      onSuccessToast?.(`Đã lưu chi tiêu ${finalVndAmount.toLocaleString('vi-VN')} đ.`);
    }

    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={editingExpense ? 'Sửa khoản chi' : 'Thêm chi tiêu'}
    >
      <form onSubmit={handleSubmit} className="haven-expense-form">
        {/* 1. Multi-Select Category Wrap Grid */}
        <div className="haven-form-section">
          <div className="haven-section-header-compact">
            <label className="log-form-label">
              Danh mục chi tiêu {selectedCategories.length > 1 ? `(${selectedCategories.length} đã chọn)` : ''}
            </label>
          </div>
          <div
            className="haven-category-wrap-group"
            role="group"
            aria-label="Danh mục chi tiêu (chọn một hoặc nhiều)"
          >
            {EXPENSE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat.name);
              return (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={isSelected}
                  className={`haven-cat-pill-btn ${isSelected ? 'active' : ''}`}
                  style={{
                    backgroundColor: isSelected ? cat.bgLight : undefined,
                    borderColor: isSelected ? cat.color : undefined,
                    color: isSelected ? cat.color : undefined,
                  }}
                  onClick={() => handleToggleCategory(cat.name)}
                >
                  <ExpenseCategoryIcon category={cat.name} size={15} />
                  <span className="haven-cat-pill-title">{cat.name}</span>
                  {isSelected && <Check size={12} strokeWidth={2.6} className="haven-cat-check-ico" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Amount Display Box (Clean, without duplicate tags or redundant x1000 label) */}
        <div className="haven-expense-display">
          <div className="haven-expense-display-header">
            <span className="haven-display-title-label">Số tiền</span>
            <span className="haven-unit-badge">
              Đơn vị: <b>×1.000 đ</b>
            </span>
          </div>

          <div className="haven-expense-amount-readout">
            {/* Formula row showing exact input (e.g. 50 × 2 + 60 × 3) */}
            <div className="haven-formula-scroll-box" title="Biểu thức đã nhập">
              <span className="haven-formula-text">
                {expression ? formatExpression(expression) : '0'}
              </span>
            </div>

            {/* Big calculated VND amount */}
            <div className="haven-total-vnd-line">
              <span className="haven-amount-number">
                {finalVndAmount > 0 ? finalVndAmount.toLocaleString('vi-VN') : '0'}
              </span>
              <span className="haven-amount-unit">đ</span>
            </div>
          </div>
        </div>

        {/* 3. Virtual Keypad & Calculator (Always Visible) */}
        <div className="haven-form-keypad-wrapper">
          <ExpenseKeypad
            expression={expression}
            onChangeExpression={setExpression}
          />
        </div>

        {/* 4. Full-width Date Segmented Control */}
        <div className="haven-form-section">
          <label className="log-form-label">Thời gian</label>
          <div className="haven-date-segmented-bar">
            <button
              type="button"
              className={`haven-date-seg-btn ${datePreset === 'today' ? 'active' : ''}`}
              onClick={() => handleDatePreset('today')}
            >
              Hôm nay
            </button>
            <button
              type="button"
              className={`haven-date-seg-btn ${datePreset === 'yesterday' ? 'active' : ''}`}
              onClick={() => handleDatePreset('yesterday')}
            >
              Hôm qua
            </button>
            <button
              type="button"
              className={`haven-date-seg-btn ${datePreset === 'custom' ? 'active' : ''}`}
              onClick={() => handleDatePreset('custom')}
            >
              <Calendar size={12} /> Ngày khác
            </button>
          </div>

          {datePreset === 'custom' && (
            <input
              className="log-input-control haven-date-input"
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              required
            />
          )}
        </div>

        {/* 5. Note Input */}
        <div className="haven-form-section">
          <label className="log-form-label">Ghi chú chi tiết</label>
          <input
            className="log-input-control"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: 2 hộp Meiji, bình sữa Comotomo..."
          />
        </div>

        {error && (
          <p role="alert" className="haven-form-error">
            {error}
          </p>
        )}

        {/* 6. Primary Submit Button */}
        <button
          type="submit"
          className="log-btn-primary haven-expense-submit-btn"
          disabled={finalVndAmount <= 0}
        >
          {editingExpense ? 'Lưu thay đổi' : 'Lưu khoản chi'}
          {finalVndAmount > 0 ? ` • ${finalVndAmount.toLocaleString('vi-VN')} đ` : ''}
        </button>
      </form>
    </BottomSheet>
  );
};

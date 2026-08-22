import React, { useCallback } from 'react';
import { Delete, RotateCcw, Plus, Minus, X, Divide } from 'lucide-react';
import { PRESET_ADD_AMOUNTS } from '@/features/expenses/domain/expenseCategories';
import { evaluateMathExpression } from '@/features/expenses/domain/expenseMath';

interface ExpenseKeypadProps {
  expression: string;
  onChangeExpression: (newExpr: string) => void;
  onQuickAdd?: (amount: number) => void;
  className?: string;
}

export const ExpenseKeypad: React.FC<ExpenseKeypadProps> = ({
  expression,
  onChangeExpression,
  onQuickAdd,
  className = '',
}) => {
  const handleKeyPress = useCallback((key: string) => {
    if (key === 'C') {
      onChangeExpression('');
      return;
    }

    if (key === 'BACKSPACE') {
      if (!expression || expression.length <= 1) {
        onChangeExpression('');
      } else {
        onChangeExpression(expression.slice(0, -1));
      }
      return;
    }

    if (key === '=') {
      const result = evaluateMathExpression(expression);
      onChangeExpression(result > 0 ? String(result) : '');
      return;
    }

    if (['+', '-', '*', '/'].includes(key)) {
      if (!expression) {
        return;
      }
      const lastChar = expression.slice(-1);
      if ('+-*/'.includes(lastChar)) {
        // Replace previous operator
        onChangeExpression(expression.slice(0, -1) + key);
      } else {
        onChangeExpression(expression + key);
      }
      return;
    }

    if (key === '.') {
      if (!expression) {
        onChangeExpression('0.');
        return;
      }
      const lastChar = expression.slice(-1);
      if ('+-*/'.includes(lastChar)) {
        onChangeExpression(expression + '0.');
        return;
      }
      // Check if current number segment already has a decimal point
      const segments = expression.split(/[+\-*/]/);
      const currentSegment = segments[segments.length - 1];
      if (!currentSegment.includes('.')) {
        onChangeExpression(expression + '.');
      }
      return;
    }

    // Number keys 0-9
    if (/^\d$/.test(key)) {
      if (expression === '0' && key === '0') return;
      if (expression === '0') {
        onChangeExpression(key);
      } else {
        onChangeExpression(expression + key);
      }
    }
  }, [expression, onChangeExpression]);

  const handlePresetAdd = (amount: number) => {
    if (onQuickAdd) {
      onQuickAdd(amount);
      return;
    }
    if (!expression || expression === '0') {
      onChangeExpression(String(amount));
      return;
    }
    const currentVal = evaluateMathExpression(expression);
    const nextVal = currentVal + amount;
    onChangeExpression(String(nextVal));
  };

  return (
    <div className={`haven-keypad-root ${className}`}>
      {/* Quick Add Amount Chips */}
      <div className="haven-keypad-presets" aria-label="Cộng nhanh số tiền (x1.000 đ)">
        {PRESET_ADD_AMOUNTS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="haven-preset-chip"
            onClick={() => handlePresetAdd(preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Main Numeric & Calculator Grid */}
      <div className="haven-keypad-grid">
        {/* Row 1: Actions & Top Operators */}
        <button
          type="button"
          className="haven-key haven-key-action haven-key-clear"
          onClick={() => handleKeyPress('C')}
          aria-label="Xóa tất cả"
        >
          <RotateCcw size={15} />
        </button>
        <button
          type="button"
          className="haven-key haven-key-op"
          onClick={() => handleKeyPress('/')}
          aria-label="Chia"
        >
          <Divide size={16} />
        </button>
        <button
          type="button"
          className="haven-key haven-key-op"
          onClick={() => handleKeyPress('*')}
          aria-label="Nhân"
        >
          <X size={16} />
        </button>
        <button
          type="button"
          className="haven-key haven-key-action haven-key-backspace"
          onClick={() => handleKeyPress('BACKSPACE')}
          aria-label="Xóa 1 ký tự"
        >
          <Delete size={17} />
        </button>

        {/* Row 2: 7 8 9 - */}
        <button type="button" className="haven-key haven-key-num" onClick={() => handleKeyPress('7')}>7</button>
        <button type="button" className="haven-key haven-key-num" onClick={() => handleKeyPress('8')}>8</button>
        <button type="button" className="haven-key haven-key-num" onClick={() => handleKeyPress('9')}>9</button>
        <button
          type="button"
          className="haven-key haven-key-op"
          onClick={() => handleKeyPress('-')}
          aria-label="Trừ"
        >
          <Minus size={16} />
        </button>

        {/* Row 3: 4 5 6 + */}
        <button type="button" className="haven-key haven-key-num" onClick={() => handleKeyPress('4')}>4</button>
        <button type="button" className="haven-key haven-key-num" onClick={() => handleKeyPress('5')}>5</button>
        <button type="button" className="haven-key haven-key-num" onClick={() => handleKeyPress('6')}>6</button>
        <button
          type="button"
          className="haven-key haven-key-op"
          onClick={() => handleKeyPress('+')}
          aria-label="Cộng"
        >
          <Plus size={16} />
        </button>

        {/* Row 4: 1 2 3 = */}
        <button type="button" className="haven-key haven-key-num" onClick={() => handleKeyPress('1')}>1</button>
        <button type="button" className="haven-key haven-key-num" onClick={() => handleKeyPress('2')}>2</button>
        <button type="button" className="haven-key haven-key-num" onClick={() => handleKeyPress('3')}>3</button>
        <button
          type="button"
          className="haven-key haven-key-equal"
          style={{ gridRow: 'span 2' }}
          onClick={() => handleKeyPress('=')}
          aria-label="="
        >
          =
        </button>

        {/* Row 5: 0 (span 2) . */}
        <button
          type="button"
          className="haven-key haven-key-num"
          style={{ gridColumn: 'span 2' }}
          onClick={() => handleKeyPress('0')}
        >
          0
        </button>
        <button
          type="button"
          className="haven-key haven-key-num"
          onClick={() => handleKeyPress('.')}
        >
          .
        </button>
      </div>
    </div>
  );
};

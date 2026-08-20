import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpenseKeypad } from './ExpenseKeypad';
import {
  evaluateMathExpression,
  formatExpression,
} from '@/utils/expenseMath';

describe('evaluateMathExpression', () => {
  it('evaluates basic numbers correctly', () => {
    expect(evaluateMathExpression('350')).toBe(350);
    expect(evaluateMathExpression('0')).toBe(0);
    expect(evaluateMathExpression('')).toBe(0);
  });

  it('evaluates expressions like 50*2+60*3 correctly', () => {
    expect(evaluateMathExpression('50*2+60*3')).toBe(280);
    expect(evaluateMathExpression('150+50')).toBe(200);
    expect(evaluateMathExpression('250-50')).toBe(200);
    expect(evaluateMathExpression('100+50-30')).toBe(120);
  });

  it('evaluates multiplication and division with precedence', () => {
    expect(evaluateMathExpression('50*3')).toBe(150);
    expect(evaluateMathExpression('300/2')).toBe(150);
    expect(evaluateMathExpression('100+50*2')).toBe(200);
  });

  it('handles trailing operators gracefully', () => {
    expect(evaluateMathExpression('150+')).toBe(150);
    expect(evaluateMathExpression('200*')).toBe(200);
  });
});

describe('formatExpression', () => {
  it('formats expressions with readable operators', () => {
    expect(formatExpression('50*2+60*3')).toBe('50 × 2 + 60 × 3');
    expect(formatExpression('150+50')).toBe('150 + 50');
    expect(formatExpression('50*3')).toBe('50 × 3');
    expect(formatExpression('')).toBe('0');
  });
});

describe('ExpenseKeypad Component', () => {
  it('renders all numpad digits and preset buttons', () => {
    render(
      <ExpenseKeypad
        expression="100"
        onChangeExpression={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: '+50k' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+100k' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '7' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '.' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '=' })).toBeInTheDocument();
  });

  it('triggers number input when keys are clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <ExpenseKeypad
        expression=""
        onChangeExpression={handleChange}
      />
    );

    await user.click(screen.getByRole('button', { name: '5' }));
    expect(handleChange).toHaveBeenCalledWith('5');
  });

  it('handles quick preset additions in thousands (k)', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <ExpenseKeypad
        expression="100"
        onChangeExpression={handleChange}
      />
    );

    await user.click(screen.getByRole('button', { name: '+50k' }));
    expect(handleChange).toHaveBeenCalledWith('150');
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HavenMilkAmountInput } from './HavenMilkAmountInput';

describe('HavenMilkAmountInput', () => {
  it('renders current value and preset chips', () => {
    const handleChange = vi.fn();
    render(<HavenMilkAmountInput value="120" onChange={handleChange} />);

    expect(screen.getByLabelText('Lượng sữa (ml)')).toHaveValue(120);
    expect(screen.getByRole('button', { name: '120 ml' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '90 ml' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('handles steppers +5 and -5', () => {
    const handleChange = vi.fn();
    render(<HavenMilkAmountInput value="120" onChange={handleChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Tăng 5ml' }));
    expect(handleChange).toHaveBeenCalledWith('125');

    fireEvent.click(screen.getByRole('button', { name: 'Giảm 5ml' }));
    expect(handleChange).toHaveBeenCalledWith('115');
  });

  it('handles selecting preset chip', () => {
    const handleChange = vi.fn();
    render(<HavenMilkAmountInput value="60" onChange={handleChange} />);

    fireEvent.click(screen.getByRole('button', { name: '180 ml' }));
    expect(handleChange).toHaveBeenCalledWith('180');
  });

  it('handles slider change with snap step 5', () => {
    const handleChange = vi.fn();
    render(<HavenMilkAmountInput value="90" onChange={handleChange} />);

    const slider = screen.getByLabelText('Kéo chọn lượng sữa');
    expect(slider).toHaveAttribute('step', '5');
    fireEvent.change(slider, { target: { value: '145' } });
    expect(handleChange).toHaveBeenCalledWith('145');
  });

  it('renders recommendation advice for the baby', () => {
    const handleChange = vi.fn();
    render(
      <HavenMilkAmountInput
        value="120"
        onChange={handleChange}
        recommendation={{
          minMl: 90,
          maxMl: 150,
          label: 'Gợi ý: 90 – 150 ml / cữ',
          ageText: '2 tháng tuổi · 5.5 kg',
        }}
      />
    );

    expect(screen.getByText(/Gợi ý bé 2 tháng tuổi · 5.5 kg/)).toBeInTheDocument();
    expect(screen.getByText('90–150 ml')).toBeInTheDocument();
    expect(screen.getByText('✓ Chuẩn mức')).toBeInTheDocument();
  });

  it('handles direct keyboard input', () => {
    const handleChange = vi.fn();
    render(<HavenMilkAmountInput value="90" onChange={handleChange} />);

    const input = screen.getByLabelText('Lượng sữa (ml)');
    fireEvent.change(input, { target: { value: '135' } });
    expect(handleChange).toHaveBeenCalledWith('135');
  });
});

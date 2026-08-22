import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { HavenTemperatureInput } from './HavenTemperatureInput';

function TemperatureInputHarness({ initial = '36.8' }: { initial?: string }) {
  const [val, setVal] = useState(initial);

  useEffect(() => {
    setVal(initial);
  }, [initial]);

  return (
    <div>
      <output data-testid="temp-output">{val}</output>
      <HavenTemperatureInput value={val} onChange={setVal} />
    </div>
  );
}

describe('HavenTemperatureInput', () => {
  it('renders initial temperature and normal status advice', () => {
    render(<TemperatureInputHarness initial="36.8" />);
    expect(screen.getByRole('spinbutton', { name: 'Thân nhiệt (°C)' })).toHaveValue(36.8);
    expect(screen.getByText('✓ Thân nhiệt tốt')).toBeInTheDocument();
    expect(screen.getByText(/trong khoảng tham khảo/)).toBeInTheDocument();
  });

  it('adjusts temperature by +-0.1 with stepper buttons', async () => {
    const user = userEvent.setup();
    render(<TemperatureInputHarness initial="37.0" />);

    const plusBtn = screen.getByRole('button', { name: 'Tăng 0.1°C' });
    await user.click(plusBtn);
    expect(screen.getByTestId('temp-output')).toHaveTextContent('37.1');

    const minusBtn = screen.getByRole('button', { name: 'Giảm 0.1°C' });
    await user.click(minusBtn);
    expect(screen.getByTestId('temp-output')).toHaveTextContent('37.0');
  });

  it('updates temperature status and advice across fever and hypothermia tiers', () => {
    const { rerender } = render(<TemperatureInputHarness initial="35.5" />);
    expect(screen.getByText('⚠️ Hạ thân nhiệt')).toBeInTheDocument();

    rerender(<TemperatureInputHarness initial="37.8" />);
    expect(screen.getByText('Theo dõi')).toBeInTheDocument();

    rerender(<TemperatureInputHarness initial="38.8" />);
    expect(screen.getByText('Sốt ≥ 38°C')).toBeInTheDocument();

    rerender(<TemperatureInputHarness initial="40.0" />);
    expect(screen.getByText('🚨 Nguy hiểm')).toBeInTheDocument();
  });

  it('selects preset chips', async () => {
    const user = userEvent.setup();
    render(<TemperatureInputHarness initial="36.8" />);

    const feverChip = screen.getByRole('button', { name: /38.5°/ });
    await user.click(feverChip);
    expect(screen.getByTestId('temp-output')).toHaveTextContent('38.5');
  });

  it('handles slider change', () => {
    render(<TemperatureInputHarness initial="36.8" />);
    const slider = screen.getByLabelText('Kéo chọn thân nhiệt');
    fireEvent.change(slider, { target: { value: '38.0' } });
    expect(screen.getByTestId('temp-output')).toHaveTextContent('38.0');
  });
});

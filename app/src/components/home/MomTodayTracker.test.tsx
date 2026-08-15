import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MomTodayTracker } from './MomTodayTracker';

describe('MomTodayTracker', () => {
  it('renders mom tracker data and forwards pumping actions', () => {
    const onOpenPumping = vi.fn();
    render(<MomTodayTracker todayTotal="540 ml" sessionsToday={3} sleepDebt="2.5h" epdsScore="4/30" onOpenPumping={onOpenPumping} />);
    expect(screen.getByText('540 ml (3 cữ)')).toBeInTheDocument();
    expect(screen.getByText('2.5h')).toBeInTheDocument();
    expect(screen.getByText('4/30 (Rất an toàn)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ghi nhận cữ hút sữa mẹ' }));
    fireEvent.click(screen.getByRole('button', { name: 'Thêm ghi chép hôm nay' }));
    expect(onOpenPumping).toHaveBeenCalledTimes(2);
  });
});

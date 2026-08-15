import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MomHealthMetrics } from './MomHealthMetrics';

describe('MomHealthMetrics', () => {
  it('preserves wellness and frozen milk cards', () => {
    const onOpenScoreDetail = vi.fn();
    render(<MomHealthMetrics wellnessScore={88} onOpenScoreDetail={onOpenScoreDetail} />);
    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText('4.85 L')).toBeInTheDocument();
    expect(screen.getByText('24 túi trữ an toàn')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xem chi tiết chỉ số hồi phục của mẹ' }));
    expect(onOpenScoreDetail).toHaveBeenCalledTimes(1);
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BabyCareResources } from './BabyCareResources';

describe('BabyCareResources', () => {
  it('preserves care guide copy and toast actions', () => {
    const onShowToast = vi.fn();
    render(<BabyCareResources onShowToast={onShowToast} />);

    expect(screen.getByText('Cẩm nang Chăm sóc')).toBeInTheDocument();
    expect(screen.getByText('Thực đơn ăn dặm giàu sắt từ 8 tháng?')).toBeInTheDocument();
    expect(screen.getByText('Rèn bé tự ngủ xuyên đêm không quấy?')).toBeInTheDocument();
    expect(screen.getByText('Lịch tiêm phòng quan trọng năm đầu đời')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Xem tất cả' }));
    expect(onShowToast).toHaveBeenCalledWith('Cẩm nang chi tiết đang được hoàn thiện.');

    fireEvent.click(screen.getByRole('button', { name: /Thực đơn ăn dặm giàu sắt từ 8 tháng/ }));
    fireEvent.click(screen.getByRole('button', { name: /Rèn bé tự ngủ xuyên đêm không quấy/ }));
    fireEvent.click(screen.getByRole('button', { name: /Lịch tiêm phòng quan trọng năm đầu đời/ }));
    expect(onShowToast).toHaveBeenCalledWith('Bài viết này sẽ mở trong phiên bản tiếp theo.');
    expect(onShowToast).toHaveBeenCalledTimes(4);
  });

  it('keeps toast callback optional', () => {
    render(<BabyCareResources />);
    expect(() => fireEvent.click(screen.getByRole('button', { name: 'Xem tất cả' }))).not.toThrow();
  });
});

import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { HavenCalendar, type HavenDateRange } from './HavenCalendar';
import { HavenDialog } from './HavenDialog';
import { HavenDropdown } from './HavenDropdown';

function RangeCalendarHarness() {
  const [range, setRange] = useState<HavenDateRange>({ start: '2026-08-18', end: '2026-08-18' });
  return <HavenCalendar mode="range" value={range} onChange={setRange} />;
}

function DropdownHarness() {
  const [value, setValue] = useState<'all' | 'baby'>('all');
  return (
    <HavenDropdown
      label="Lọc người"
      value={value}
      onChange={setValue}
      options={[{ value: 'all', label: 'Cả nhà' }, { value: 'baby', label: 'Của bé' }]}
    />
  );
}

function DialogHarness() {
  const [open, setOpen] = useState(true);
  return <HavenDialog open={open} onClose={() => setOpen(false)} title="Chi tiết"><p>Nội dung</p></HavenDialog>;
}

describe('Haven reusable primitives', () => {
  it('selects a single calendar day', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [value, setValue] = useState('2026-08-18');
      return <><output>{value}</output><HavenCalendar mode="single" value={value} onChange={setValue} /></>;
    }
    render(<Harness />);
    const grid = screen.getByRole('grid', { name: 'Chọn ngày' });
    const day = within(grid).getAllByRole('gridcell').find((cell) => cell.textContent === '19' && !cell.classList.contains('other-month'));
    expect(day).toBeDefined();
    await user.click(day!);
    expect(screen.getByText('2026-08-19')).toBeInTheDocument();
  });

  it('selects a range with two calendar clicks', async () => {
    const user = userEvent.setup();
    render(<RangeCalendarHarness />);
    const grid = screen.getByRole('grid', { name: 'Chọn khoảng ngày' });
    const currentMonthDay = (day: string) => within(grid).getAllByRole('gridcell').find((cell) => cell.textContent === day && !cell.classList.contains('other-month'))!;
    await user.click(currentMonthDay('10'));
    expect(currentMonthDay('10')).toHaveClass('range-start');
    await user.click(currentMonthDay('13'));
    expect(currentMonthDay('13')).toHaveClass('range-end');
    expect(currentMonthDay('11')).toHaveClass('in-range');
  });

  it('swipes between months and highlights weekends', () => {
    const { container } = render(<RangeCalendarHarness />);
    expect(screen.getByText(/tháng 8.*2026/i)).toBeInTheDocument();
    const month = container.querySelector('.haven-calendar-pager')!;
    const saturday = screen.getByRole('gridcell', { name: /Thứ Bảy, 22 tháng 8, 2026/i });
    const sunday = screen.getByRole('gridcell', { name: /Chủ Nhật, 23 tháng 8, 2026/i });
    expect(saturday).toHaveClass('weekend');
    expect(sunday).toHaveClass('weekend');

    fireEvent.pointerDown(month, { clientX: 240 });
    fireEvent.pointerMove(month, { clientX: 150 });
    expect((container.querySelector('.haven-calendar-track') as HTMLElement).style.transform).toContain('-90px');
    fireEvent.pointerUp(month, { clientX: 100 });
    fireEvent.transitionEnd(container.querySelector('.haven-calendar-track')!);
    expect(screen.getByText(/tháng 9.*2026/i)).toBeInTheDocument();
  });

  it('enforces minimum and maximum selectable dates', () => {
    function BoundedCalendar() {
      const [value, setValue] = useState('2026-08-18');
      return <HavenCalendar mode="single" value={value} minDate="2026-08-10" maxDate="2026-08-20" onChange={setValue} />;
    }
    render(<BoundedCalendar />);
    expect(screen.getByRole('gridcell', { name: /Chủ Nhật, 9 tháng 8, 2026/i })).toBeDisabled();
    expect(screen.getByRole('gridcell', { name: /Thứ Sáu, 21 tháng 8, 2026/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Tháng trước' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Tháng sau' })).toBeDisabled();
  });

  it('uses a custom popup dropdown and updates its selection', async () => {
    const user = userEvent.setup();
    render(<DropdownHarness />);
    await user.click(screen.getByRole('button', { name: 'Lọc người: Cả nhà' }));
    expect(screen.getByRole('listbox', { name: 'Lọc người' })).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'Của bé' }));
    expect(screen.getByRole('button', { name: 'Lọc người: Của bé' })).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes a custom dialog with Escape', async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);
    expect(screen.getByRole('dialog', { name: 'Chi tiết' })).toHaveAttribute('aria-modal', 'true');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

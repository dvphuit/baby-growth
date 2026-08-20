import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { HavenCalendar, type HavenDateRange } from './HavenCalendar';
import { HavenDatePicker } from './HavenDatePicker';
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
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('supports numeric value options and disabled state in HavenDropdown', async () => {
    const user = userEvent.setup();
    function NumberDropdownHarness() {
      const [val, setVal] = useState<number>(0);
      return (
        <>
          <HavenDropdown<number>
            label="Cột mốc"
            value={val}
            onChange={setVal}
            options={[
              { value: 0, label: 'Mốc sơ sinh', description: '0 tháng' },
              { value: 2, label: 'Mốc 2 tháng', description: '2 tháng tuổi' },
            ]}
          />
          <HavenDropdown
            label="Khóa"
            value="disabled"
            disabled
            onChange={() => {}}
            options={[{ value: 'disabled', label: 'Không khả dụng' }]}
          />
        </>
      );
    }
    render(<NumberDropdownHarness />);
    const trigger = screen.getByRole('button', { name: 'Cột mốc: Mốc sơ sinh' });
    await user.click(trigger);
    expect(screen.getByRole('listbox', { name: 'Cột mốc' })).toBeInTheDocument();
    expect(screen.getByText('2 tháng tuổi')).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: /Mốc 2 tháng/i }));
    expect(screen.getByRole('button', { name: 'Cột mốc: Mốc 2 tháng' })).toBeInTheDocument();

    const disabledTrigger = screen.getByRole('button', { name: 'Khóa: Không khả dụng' });
    expect(disabledTrigger).toBeDisabled();
    await user.click(disabledTrigger);
    expect(screen.queryByRole('listbox', { name: 'Khóa' })).not.toBeInTheDocument();
  });

  it('picks single dates and datetimes with HavenDatePicker', async () => {
    const user = userEvent.setup();
    function DatePickerHarness() {
      const [date, setDate] = useState('2026-08-18');
      const [dateTime, setDateTime] = useState('2026-08-18T10:30');
      return (
        <>
          <HavenDatePicker label="Ngày đo" value={date} onChange={setDate} />
          <HavenDatePicker label="Thời điểm" value={dateTime} showTime onChange={setDateTime} />
        </>
      );
    }
    render(<DatePickerHarness />);

    const dateTrigger = screen.getByRole('button', { name: /Ngày đo: 18\/08\/2026/ });
    await user.click(dateTrigger);
    const day19 = screen.getByRole('gridcell', { name: /Thứ Tư, 19 tháng 8, 2026/i });
    await user.click(day19);
    expect(screen.getByRole('button', { name: /Ngày đo: 19\/08\/2026/ })).toBeInTheDocument();

    const dateTimeTrigger = screen.getByRole('button', { name: /Thời điểm: 18\/08\/2026 · 10:30/ });
    await user.click(dateTimeTrigger);
    const timeTab = screen.getByRole('tab', { name: /10:30/ });
    await user.click(timeTab);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();

    const increaseHour = screen.getByRole('button', { name: 'Tăng 1 giờ' });
    await user.click(increaseHour);
    expect(screen.getByText('11')).toBeInTheDocument();

    const doneBtn = screen.getByRole('button', { name: /Xong/ });
    expect(doneBtn).toBeInTheDocument();
    await user.click(doneBtn);
    expect(screen.getByRole('button', { name: /Thời điểm: 18\/08\/2026 · 11:30/ })).toBeInTheDocument();
  });

  it('closes a custom dialog with Escape', async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);
    expect(screen.getByRole('dialog', { name: 'Chi tiết' })).toHaveAttribute('aria-modal', 'true');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

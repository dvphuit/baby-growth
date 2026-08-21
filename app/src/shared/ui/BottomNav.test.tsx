import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { BottomNav } from './BottomNav';

function renderNav(onRouteIntent = vi.fn(), onOpenQuickLog = vi.fn()) {
  render(
    <MemoryRouter initialEntries={['/']}>
      <BottomNav onOpenQuickLog={onOpenQuickLog} onRouteIntent={onRouteIntent} />
      <Routes>
        <Route path="/" element={<div>Home route</div>} />
        <Route path="/timeline" element={<div>Timeline route</div>} />
        <Route path="/growth" element={<div>Growth route</div>} />
        <Route path="/expenses" element={<div>Expenses route</div>} />
      </Routes>
    </MemoryRouter>,
  );
  return { onRouteIntent, onOpenQuickLog };
}

describe('BottomNav', () => {
  it('prefetches on interaction intent before navigation', () => {
    const { onRouteIntent } = renderNav();
    const timelineLink = screen.getByRole('link', { name: 'Nhật ký' });

    fireEvent.pointerDown(timelineLink);
    expect(onRouteIntent).toHaveBeenLastCalledWith('/timeline');
    expect(screen.getByText('Home route')).toBeInTheDocument();

    fireEvent.focus(timelineLink);
    expect(onRouteIntent).toHaveBeenLastCalledWith('/timeline');

    fireEvent.click(timelineLink);
    expect(screen.getByText('Timeline route')).toBeInTheDocument();
  });

  it('keeps the center Quick Log action functional', () => {
    const { onOpenQuickLog } = renderNav();

    fireEvent.click(screen.getByRole('button', { name: 'Ghi chép nhanh' }));

    expect(onOpenQuickLog).toHaveBeenCalledTimes(1);
  });
});

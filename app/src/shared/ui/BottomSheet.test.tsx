import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BottomSheet } from './BottomSheet';

function BottomSheetHarness() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>Open sheet</button>
      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} title="Accessible sheet">
        <button type="button">First action</button>
        <button type="button">Last action</button>
      </BottomSheet>
    </>
  );
}

describe('BottomSheet accessibility and dismissal', () => {
  it('acts as a named modal, traps focus, and restores focus to its opener', async () => {
    const user = userEvent.setup();
    render(<BottomSheetHarness />);
    const opener = screen.getByRole('button', { name: 'Open sheet' });

    await user.click(opener);

    const dialog = screen.getByRole('dialog', { name: 'Accessible sheet' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));

    const close = screen.getByRole('button', { name: 'Đóng' });
    const last = screen.getByRole('button', { name: 'Last action' });
    last.focus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(last).toHaveFocus();

    await user.click(close);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 500 });
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('does not start any dismissal path when dismissible is false', () => {
    const onClose = vi.fn();
    render(
      <BottomSheet isOpen onClose={onClose} title="Locked sheet" dismissible={false}>
        <button type="button">Action</button>
      </BottomSheet>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Locked sheet' });
    const backdrop = document.querySelector('.modal-backdrop')!;
    const handle = document.querySelector('.sheet-handle-bar')!;

    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.click(backdrop);
    fireEvent.click(handle);
    fireEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    fireEvent.pointerDown(dialog, { pointerId: 1, clientY: 0 });
    fireEvent.pointerMove(dialog, { pointerId: 1, clientY: 120 });
    fireEvent.pointerUp(dialog, { pointerId: 1, clientY: 120 });

    expect(onClose).not.toHaveBeenCalled();
    expect(dialog).not.toHaveClass('closing');
  });

  it('portals the overlay to document.body so app stacking contexts cannot cover it', () => {
    const { container } = render(
      <div style={{ position: 'relative', zIndex: 2 }}>
        <BottomSheet isOpen onClose={() => {}} title="Nested sheet">
          <p>Nested content</p>
        </BottomSheet>
      </div>,
    );

    const backdrop = document.querySelector('.modal-backdrop');
    expect(backdrop).not.toBeNull();
    expect(backdrop?.parentElement).toBe(document.body);
    expect(container.querySelector('.modal-backdrop')).toBeNull();
  });

  it('renders fixed footer outside the scrollable content body', () => {
    render(
      <BottomSheet
        isOpen
        onClose={() => {}}
        title="Footer test"
        footer={<button type="button">Fixed Save</button>}
      >
        <p>Scrollable body content</p>
      </BottomSheet>,
    );

    expect(screen.getByRole('button', { name: 'Fixed Save' })).toBeInTheDocument();
    const footerEl = screen.getByRole('button', { name: 'Fixed Save' }).parentElement;
    expect(footerEl).toHaveClass('sheet-footer');
  });
});

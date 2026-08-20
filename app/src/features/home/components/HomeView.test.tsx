import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomeView } from './HomeView';

let profileMode: 'baby' | 'mom' = 'baby';

vi.mock('@/store/useUIStore', () => ({
  useUIStore: (selector: (state: { profileMode: 'baby' | 'mom' }) => unknown) => selector({ profileMode }),
}));

vi.mock('./MomHomeView', () => ({
  MomHomeView: ({ onOpenPumping }: { onOpenPumping: () => void }) => (
    <div>Mom Home marker<button onClick={onOpenPumping}>mom pumping</button></div>
  ),
}));

vi.mock('./BabyHomeView', () => ({
  BabyHomeView: ({ onOpenQuickLog }: { onOpenQuickLog: () => void }) => (
    <div>Baby Home marker<button onClick={onOpenQuickLog}>baby quick log</button></div>
  ),
}));

describe('HomeView', () => {
  it('renders BabyHomeView in baby mode and forwards quick log', () => {
    profileMode = 'baby';
    const onOpenQuickLog = vi.fn();
    render(<HomeView onOpenQuickLog={onOpenQuickLog} onOpenPumping={vi.fn()} />);
    expect(screen.getByText('Baby Home marker')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'baby quick log' }));
    expect(onOpenQuickLog).toHaveBeenCalledTimes(1);
  });

  it('renders MomHomeView in mom mode and forwards pumping', async () => {
    profileMode = 'mom';
    const onOpenPumping = vi.fn();
    render(<HomeView onOpenQuickLog={vi.fn()} onOpenPumping={onOpenPumping} />);
    expect(await screen.findByText('Mom Home marker')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'mom pumping' }));
    expect(onOpenPumping).toHaveBeenCalledTimes(1);
  });
});

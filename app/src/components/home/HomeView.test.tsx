import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomeView } from './HomeView';

let profileMode: 'baby' | 'mom' = 'baby';

vi.mock('@/store/useUIStore', () => ({
  useUIStore: (selector: (state: { profileMode: 'baby' | 'mom' }) => unknown) =>
    selector({ profileMode }),
}));

vi.mock('./MomHomeView', () => ({
  MomHomeView: (props: {
    onOpenScoreDetail: () => void;
    onOpenAiChat: () => void;
    onOpenPumping: () => void;
  }) => (
    <div>
      Mom Home marker
      <button onClick={props.onOpenScoreDetail}>mom score</button>
      <button onClick={props.onOpenAiChat}>mom ai</button>
      <button onClick={props.onOpenPumping}>mom pumping</button>
    </div>
  ),
}));

vi.mock('./BabyHomeView', () => ({
  BabyHomeView: (props: {
    onOpenScoreDetail: () => void;
    onOpenQuickLog: () => void;
    onOpenAiChat: () => void;
  }) => (
    <div>
      Baby Home marker
      <button onClick={props.onOpenScoreDetail}>baby score</button>
      <button onClick={props.onOpenQuickLog}>baby quick log</button>
      <button onClick={props.onOpenAiChat}>baby ai</button>
    </div>
  ),
}));

describe('HomeView', () => {
  it('renders BabyHomeView in baby mode and forwards callbacks', () => {
    profileMode = 'baby';
    const onOpenQuickLog = vi.fn();

    render(
      <HomeView
        onOpenScoreDetail={vi.fn()}
        onOpenQuickLog={onOpenQuickLog}
        onOpenAiChat={vi.fn()}
        onOpenPumping={vi.fn()}
      />,
    );

    expect(screen.getByText('Baby Home marker')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'baby quick log' }));
    expect(onOpenQuickLog).toHaveBeenCalledTimes(1);
  });

  it('renders MomHomeView in mom mode and forwards callbacks', () => {
    profileMode = 'mom';
    const onOpenPumping = vi.fn();

    render(
      <HomeView
        onOpenScoreDetail={vi.fn()}
        onOpenQuickLog={vi.fn()}
        onOpenAiChat={vi.fn()}
        onOpenPumping={onOpenPumping}
      />,
    );

    expect(screen.getByText('Mom Home marker')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'mom pumping' }));
    expect(onOpenPumping).toHaveBeenCalledTimes(1);
  });
});

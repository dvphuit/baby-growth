import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppRoutes, type AppRoutesProps } from './AppRoutes';

vi.mock('@/components/home/HomeView', () => ({
  HomeView: ({ onOpenScoreDetail, onOpenQuickLog }: { onOpenScoreDetail: () => void; onOpenQuickLog: () => void }) => (
    <div>
      <span>Home marker</span>
      <button onClick={onOpenScoreDetail}>open score</button>
      <button onClick={onOpenQuickLog}>open quick log</button>
    </div>
  ),
}));

vi.mock('@/components/home/ScoreDetailView', () => ({
  ScoreDetailView: ({ onBack }: { onBack: () => void }) => (
    <div>
      <span>Score marker</span>
      <button onClick={onBack}>back score</button>
    </div>
  ),
}));

vi.mock('@/components/timeline/TimelineView', () => ({
  TimelineView: ({ onOpenLightbox, onOpenAddEntry }: { onOpenLightbox: (src: string, isVideo?: boolean) => void; onOpenAddEntry: () => void }) => (
    <div>
      <span>Timeline marker</span>
      <button onClick={() => onOpenLightbox('/media.jpg', true)}>open lightbox</button>
      <button onClick={onOpenAddEntry}>add timeline</button>
    </div>
  ),
}));

vi.mock('@/components/growth/GrowthView', () => ({
  GrowthView: ({ onOpenAddMeasurement }: { onOpenAddMeasurement: () => void }) => (
    <div>
      <span>Growth marker</span>
      <button onClick={onOpenAddMeasurement}>open growth</button>
    </div>
  ),
}));

vi.mock('@/components/expenses/ExpensesView', () => ({
  ExpensesView: ({ onOpenAddExpense }: { onOpenAddExpense: () => void }) => (
    <div>
      <span>Expenses marker</span>
      <button onClick={onOpenAddExpense}>open expense</button>
    </div>
  ),
}));

vi.mock('@/components/profile/ProfileView', () => ({
  ProfileView: ({ onOpenEditProfile }: { onOpenEditProfile: () => void }) => (
    <div>
      <span>Profile marker</span>
      <button onClick={onOpenEditProfile}>edit profile</button>
    </div>
  ),
}));

function createProps(overrides: Partial<AppRoutesProps> = {}): AppRoutesProps {
  return {
    currentSubView: null,
    onBackFromScoreDetail: vi.fn(),
    onOpenScoreDetail: vi.fn(),
    onOpenQuickLog: vi.fn(),
    onOpenAiChat: vi.fn(),
    onOpenPumping: vi.fn(),
    onShowToast: vi.fn(),
    onOpenLightbox: vi.fn(),
    onOpenAddTimelineEntry: vi.fn(),
    onOpenAddGrowth: vi.fn(),
    onOpenAddExpense: vi.fn(),
    onOpenEditProfile: vi.fn(),
    ...overrides,
  };
}

function renderRoute(path: string, props = createProps()) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes {...props} />
    </MemoryRouter>,
  );
  return props;
}

describe('AppRoutes', () => {
  it.each([
    ['/', 'Home marker'],
    ['/timeline', 'Timeline marker'],
    ['/growth', 'Growth marker'],
    ['/expenses', 'Expenses marker'],
    ['/profile', 'Profile marker'],
    ['/unknown', 'Home marker'],
  ])('renders %s at the expected surface', async (path, marker) => {
    renderRoute(path);
    expect(await screen.findByText(marker)).toBeInTheDocument();
  });

  it('renders score detail for the home score subview and wires back', async () => {
    const user = userEvent.setup();
    const onBackFromScoreDetail = vi.fn();
    renderRoute('/', createProps({ currentSubView: 'score-detail', onBackFromScoreDetail }));

    expect(await screen.findByText('Score marker')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'back score' }));
    expect(onBackFromScoreDetail).toHaveBeenCalledTimes(1);
  });

  it('wires home and feature actions to shell callbacks', async () => {
    const user = userEvent.setup();
    const homeProps = createProps();
    renderRoute('/', homeProps);
    await user.click(screen.getByRole('button', { name: 'open score' }));
    await user.click(screen.getByRole('button', { name: 'open quick log' }));
    expect(homeProps.onOpenScoreDetail).toHaveBeenCalledTimes(1);
    expect(homeProps.onOpenQuickLog).toHaveBeenCalledTimes(1);
  });

  it('wires the growth action', async () => {
    const user = userEvent.setup();
    const props = createProps();
    renderRoute('/growth', props);
    await user.click(await screen.findByRole('button', { name: 'open growth' }));
    expect(props.onOpenAddGrowth).toHaveBeenCalledTimes(1);
  });

  it('wires timeline media and add-entry actions', async () => {
    const user = userEvent.setup();
    const props = createProps();
    renderRoute('/timeline', props);
    await user.click(await screen.findByRole('button', { name: 'open lightbox' }));
    await user.click(screen.getByRole('button', { name: 'add timeline' }));
    expect(props.onOpenLightbox).toHaveBeenCalledWith('/media.jpg', true);
    expect(props.onOpenAddTimelineEntry).toHaveBeenCalledTimes(1);
  });
});

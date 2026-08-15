import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomeAIBanner } from './HomeAIBanner';

describe('HomeAIBanner', () => {
  it('renders mode-specific description and opens AI chat', () => {
    const onOpenAiChat = vi.fn();

    render(
      <HomeAIBanner
        description="Về giấc ngủ, bú và phát triển của bé"
        openButtonId="btnOpenAiBanner"
        onOpenAiChat={onOpenAiChat}
      />,
    );

    expect(screen.getByText('Về giấc ngủ, bú và phát triển của bé')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mở tư vấn AI' }));
    expect(onOpenAiChat).toHaveBeenCalledTimes(1);
  });

  it('preserves the customize toast message', () => {
    const onShowToast = vi.fn();

    render(
      <HomeAIBanner
        description="Về phục hồi, giấc ngủ và sức khỏe của mẹ"
        openButtonId="btnOpenAiFromHome"
        onOpenAiChat={vi.fn()}
        onShowToast={onShowToast}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Tùy chỉnh trợ lý AI' }));
    expect(onShowToast).toHaveBeenCalledWith('Tùy chỉnh trợ lý AI sẽ có trong bản cập nhật sau.');
  });

  it('stops propagation for both banner actions', () => {
    const onParentClick = vi.fn();

    render(
      <div onClick={onParentClick}>
        <HomeAIBanner
          description="Về giấc ngủ, bú và phát triển của bé"
          openButtonId="btnOpenAiBanner"
          onOpenAiChat={vi.fn()}
          onShowToast={vi.fn()}
        />
      </div>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Mở tư vấn AI' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tùy chỉnh trợ lý AI' }));
    expect(onParentClick).not.toHaveBeenCalled();
  });
});

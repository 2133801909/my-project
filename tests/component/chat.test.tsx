import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatPage } from '@/features/friends/ChatPage';
import { renderWithProviders } from '../render';

describe('ChatPage', () => {
  it('sends a text message into the local conversation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChatPage />, {
      path: '/friends/:friendId/chat',
      entries: ['/friends/u1/chat'],
    });

    await user.type(screen.getByLabelText('聊天消息'), '今晚图书馆见');
    await user.click(screen.getByRole('button', { name: '发送消息' }));

    expect(screen.getByText('今晚图书馆见')).toBeInTheDocument();
    expect(screen.getByLabelText('聊天消息')).toHaveValue('');
  });
});

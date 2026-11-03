import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/App';
import { renderWithProviders } from '../render';

describe('application shell', () => {
  it('renders the dashboard for a guest session', () => {
    renderWithProviders(<App />, { entries: ['/'] });

    expect(screen.getByRole('heading', { name: '你好，林同学' })).toBeInTheDocument();
    expect(screen.getAllByText('第 9 教学周', { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: '课表' }).length).toBeGreaterThan(0);
  });

  it('navigates between feature routes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { entries: ['/'] });

    await user.click(screen.getAllByRole('link', { name: '课表' })[0]);
    expect(await screen.findByRole('heading', { name: '我的课表' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '添加课程' })).toBeInTheDocument();

    await user.click(screen.getAllByRole('link', { name: '校园论坛' })[0]);
    expect(await screen.findByRole('heading', { name: '校园论坛' })).toBeInTheDocument();
  });

  it('registers a demo account and enters the app', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { initialSession: null, entries: ['/login'] });

    await user.click(screen.getByRole('tab', { name: '注册' }));
    await user.type(screen.getByLabelText('演示昵称'), '新同学');
    await user.click(screen.getByRole('button', { name: '创建账号' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '你好，林同学' })).toBeInTheDocument();
    });
  });

  it('redirects unauthenticated visitors to the login screen', () => {
    renderWithProviders(<App />, { initialSession: null, entries: ['/settings'] });
    expect(screen.getByRole('heading', { name: '进入演示账号' })).toBeInTheDocument();
  });
});

import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthPage } from '@/features/auth/AuthPage';
import { renderWithProviders } from '../render';

describe('AuthPage', () => {
  it('declares a demo-only flow and never renders a password field', () => {
    const { container } = renderWithProviders(<AuthPage />, {
      initialSession: null,
      path: '/login',
      entries: ['/login'],
    });

    expect(screen.getByText(/登录、注册仅为界面演示/)).toBeInTheDocument();
    expect(container.querySelector('input[type="password"]')).toBeNull();
    expect(screen.getByText(/不收集、不保存密码/)).toBeInTheDocument();
  });

  it('rejects too-short nicknames', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage />, {
      initialSession: null,
      path: '/login',
      entries: ['/login'],
    });

    await user.type(screen.getByLabelText('演示昵称'), 'x');
    await user.click(screen.getByRole('button', { name: '登录' }));

    expect(screen.getByRole('alert')).toHaveTextContent('昵称需为 2–40 个字符');
  });

  it('reports missing demo accounts on login', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage />, {
      initialSession: null,
      path: '/login',
      entries: ['/login'],
    });

    await user.type(screen.getByLabelText('演示昵称'), '不存在的同学');
    await user.click(screen.getByRole('button', { name: '登录' }));

    expect(screen.getByRole('alert')).toHaveTextContent('找不到该演示账号');
  });

  it('lets a visitor continue without an account', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage />, {
      initialSession: null,
      path: '/login',
      entries: ['/login'],
    });

    expect(screen.getByRole('button', { name: '演示访客进入' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '演示访客进入' }));
  });
});

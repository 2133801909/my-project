import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/App';
import { createSeed } from '@/state/seed';
import { FIXED_NOW, renderWithProviders } from '../render';

describe('local notifications', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  it('shows concrete local items and updates after a task is completed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);

    await user.click(screen.getByRole('button', { name: '应用内通知，7 条' }));
    const dialog = screen.getByRole('dialog', { name: '应用内通知' });
    expect(within(dialog).getByText('陈同学申请添加你为好友')).toBeInTheDocument();
    expect(within(dialog).getByText('一起去图书馆自习？')).toBeInTheDocument();
    expect(within(dialog).getByText('开源社例会')).toBeInTheDocument();
    expect(within(dialog).queryByText('阅读：算法导论第 3 章')).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole('link', { name: /完成链表实验报告/ }));

    expect(screen.getByRole('heading', { name: '完成链表实验报告' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '标记完成' }));
    await user.click(screen.getByRole('button', { name: '应用内通知，6 条' }));
    expect(
      within(screen.getByRole('dialog')).queryByText('完成链表实验报告'),
    ).not.toBeInTheDocument();
  });

  it('hides notifications when reminders are disabled and links to settings', async () => {
    const user = userEvent.setup();
    const state = createSeed(FIXED_NOW);
    state.settings.reminders = false;
    renderWithProviders(<App />, { initialState: state });

    await user.click(screen.getByRole('button', { name: '应用内通知，0 条' }));
    const dialog = screen.getByRole('dialog', { name: '应用内通知' });
    expect(within(dialog).getByText('应用内提醒已关闭。')).toBeInTheDocument();
    expect(within(dialog).queryByRole('list', { name: '通知列表' })).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole('link', { name: '前往设置开启' }));
    expect(screen.getByRole('heading', { name: '隐私与设置' })).toBeInTheDocument();
  });

  it('shows an empty state when there are no local items', async () => {
    const user = userEvent.setup();
    const state = createSeed(FIXED_NOW);
    state.requests = [];
    state.invites = [];
    state.tasks = [];
    state.events = [];
    renderWithProviders(<App />, { initialState: state });

    await user.click(screen.getByRole('button', { name: '应用内通知，0 条' }));
    expect(within(screen.getByRole('dialog')).getByText('暂无通知。')).toBeInTheDocument();
  });
});

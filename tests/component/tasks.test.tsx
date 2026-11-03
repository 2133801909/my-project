import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TasksPage } from '@/features/tasks/TasksPage';
import { renderWithProviders } from '../render';
import { createSeed } from '@/state/seed';

const now = new Date('2026-11-03T09:00:00');

describe('TasksPage', () => {
  it('toggles a task to done and moves it into the completed block', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TasksPage />);

    await user.click(screen.getByLabelText('标记「完成链表实验报告」为完成'));

    expect(await screen.findByLabelText('标记「完成链表实验报告」为未完成')).toBeInTheDocument();
    expect(screen.getByText('已完成 2 项')).toBeInTheDocument();
  });

  it('adds a task with a due date', async () => {
    const user = userEvent.setup();
    const state = createSeed(now);
    renderWithProviders(<TasksPage />, { initialState: state });

    await user.click(screen.getByRole('button', { name: '添加待办' }));
    const dialog = screen.getByRole('dialog', { name: '添加待办作业' });
    await user.type(within(dialog).getByLabelText('作业标题'), '编译原理实验');
    await user.click(within(dialog).getByRole('button', { name: '添加待办' }));

    expect(await screen.findByText('编译原理实验')).toBeInTheDocument();
  });

  it('toggles a personal event reminder', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TasksPage />);

    const toggle = screen.getByLabelText('关闭「开源社例会」提醒');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await user.click(toggle);
    expect(screen.getByLabelText('开启「开源社例会」提醒')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SchedulePage } from '@/features/schedule/SchedulePage';
import { createSeed } from '@/state/seed';
import { FIXED_NOW, renderWithProviders } from '../render';

describe('SchedulePage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds a course through the dialog (regression: the old app called an undefined handler)', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SchedulePage />);

    await user.click(screen.getByRole('button', { name: '添加课程' }));
    const dialog = screen.getByRole('dialog', { name: '添加课程' });

    await user.type(within(dialog).getByLabelText('课程名称'), '编译原理');
    await user.clear(within(dialog).getByLabelText('开始时间'));
    await user.type(within(dialog).getByLabelText('开始时间'), '10:00');
    await user.clear(within(dialog).getByLabelText('结束时间'));
    await user.type(within(dialog).getByLabelText('结束时间'), '11:40');
    await user.click(within(dialog).getByRole('button', { name: '添加课程' }));

    expect(await screen.findByText('编译原理')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('rejects a course whose end time precedes its start time', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SchedulePage />);

    await user.click(screen.getByRole('button', { name: '添加课程' }));
    const dialog = screen.getByRole('dialog', { name: '添加课程' });

    await user.type(within(dialog).getByLabelText('课程名称'), '错误时间');
    await user.clear(within(dialog).getByLabelText('结束时间'));
    await user.type(within(dialog).getByLabelText('结束时间'), '07:00');
    await user.click(within(dialog).getByRole('button', { name: '添加课程' }));

    expect(within(dialog).getByRole('alert')).toHaveTextContent('结束时间晚于开始时间');
    expect(screen.queryByText('错误时间')).not.toBeInTheDocument();
  });

  it('switches to day view and filters by teaching week', async () => {
    const user = userEvent.setup();
    const state = createSeed(FIXED_NOW);
    state.courses = [state.courses[1], { ...state.courses[4], day: 1 }];
    renderWithProviders(<SchedulePage />, { initialState: state });

    await user.click(screen.getByRole('button', { name: '日视图' }));
    await user.click(screen.getByRole('tab', { name: /周一/ }));

    await user.click(screen.getByRole('button', { name: '单周' }));
    expect(screen.getByText(/第 9 教学周/)).toBeInTheDocument();
    expect(screen.getByText('大学英语（提升）')).toBeInTheDocument();
    expect(screen.queryByText('形势与政策')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '双周' }));
    expect(screen.getByText(/第 10 教学周/)).toBeInTheDocument();
    expect(screen.getByText('形势与政策')).toBeInTheDocument();
    expect(screen.queryByText('大学英语（提升）')).not.toBeInTheDocument();
  });
});

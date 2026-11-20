import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MapPage } from '@/features/map/MapPage';
import { renderWithProviders } from '../render';

describe('campus map', () => {
  it('shows a different local map when the campus changes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MapPage />);

    const original = screen.getByRole('img', { name: /下沙校区/ });
    const originalSource = original.getAttribute('src');
    await user.selectOptions(screen.getByLabelText('选择校区'), '文一校区');

    const selected = screen.getByRole('img', { name: /文一校区/ });
    expect(selected.getAttribute('src')).not.toBe(originalSource);
    expect(screen.getByRole('link', { name: 'OpenStreetMap 贡献者' })).toHaveAttribute(
      'href',
      'https://www.openstreetmap.org/copyright',
    );
    await user.click(screen.getByRole('button', { name: '地点搜索' }));
    expect(screen.getByText(/地点搜索、室内信息和路线导航尚未接入/)).toBeInTheDocument();
  });
});

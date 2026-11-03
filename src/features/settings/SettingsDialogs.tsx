import { useState } from 'react';
import { useApp } from '@/app/context';
import type { Visibility } from '@/domain/types';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { SelectField, TextField } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/toast/context';

export function ProfileDialog({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useApp();
  const { show } = useToast();
  const [error, setError] = useState('');

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const department = String(form.get('department') ?? '').trim();
    const year = String(form.get('year') ?? '').trim();
    if (!name) {
      setError('昵称不能为空。');
      return;
    }
    dispatch({
      type: 'profile/update',
      profile: {
        name,
        department: department || state.profile.department,
        year: year || state.profile.year,
      },
    });
    show('演示资料已更新', 'success');
    onClose();
  };

  return (
    <Dialog title="编辑演示资料" onClose={onClose}>
      <form className="stack" onSubmit={submit}>
        <TextField label="昵称" name="name" defaultValue={state.profile.name} required />
        <TextField
          label="院系（未验证）"
          name="department"
          defaultValue={state.profile.department}
        />
        <SelectField label="年级" name="year" defaultValue={state.profile.year}>
          {['大一', '大二', '大三', '大四', '研究生'].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </SelectField>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="dialog-actions">
          <span className="spacer" />
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button type="submit">保存</Button>
        </div>
      </form>
    </Dialog>
  );
}

export function InterestsDialog({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useApp();
  const { show } = useToast();

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const raw = String(new FormData(event.currentTarget).get('interests') ?? '');
    const interests = [
      ...new Set(
        raw
          .split(/[,，]/)
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ];
    dispatch({ type: 'profile/update', profile: { interests } });
    show('兴趣标签已更新', 'success');
    onClose();
  };

  return (
    <Dialog title="编辑兴趣标签" onClose={onClose}>
      <form className="stack" onSubmit={submit}>
        <TextField
          label="兴趣标签"
          name="interests"
          defaultValue={state.profile.interests.join('，')}
          hint="用逗号分隔，用于匹配页筛选"
        />
        <div className="dialog-actions">
          <span className="spacer" />
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button type="submit">保存</Button>
        </div>
      </form>
    </Dialog>
  );
}

const VISIBILITY_OPTIONS: Array<{ value: Visibility; label: string; description: string }> = [
  { value: 'private', label: '仅自己', description: '默认；任何人都看不到你的课表。' },
  { value: 'friends', label: '好友可见', description: '好友可查看，或只看到忙闲。' },
  { value: 'public', label: '公开', description: '演示环境中的所有人可见。' },
];

export function VisibilityControl() {
  const { state, dispatch } = useApp();

  return (
    <div className="choice-grid" role="radiogroup" aria-label="课表可见范围">
      {VISIBILITY_OPTIONS.map((option) => (
        <label
          key={option.value}
          className={`choice${state.settings.visibility === option.value ? ' is-active' : ''}`}
        >
          <input
            type="radio"
            name="visibility"
            value={option.value}
            checked={state.settings.visibility === option.value}
            onChange={() => dispatch({ type: 'settings/set-visibility', visibility: option.value })}
          />
          <span>
            <strong>{option.label}</strong>
            <small>{option.description}</small>
          </span>
        </label>
      ))}
    </div>
  );
}

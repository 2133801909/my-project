import { useState } from 'react';
import { useApp } from '@/app/context';
import { uid } from '@/domain/ids';
import type { User } from '@/domain/types';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { SelectField, TextField } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/toast/context';

export function AddFriendDialog({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useApp();
  const { show } = useToast();
  const [error, setError] = useState('');

  const candidates = state.users.filter(
    (user) =>
      !user.friend &&
      !state.blocked.includes(user.id) &&
      !state.requests.some(
        (request) => request.userId === user.id && request.status !== 'accepted',
      ),
  );

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userId = String(new FormData(event.currentTarget).get('userId') ?? '');
    if (!userId) {
      setError('请选择一位同学');
      return;
    }
    dispatch({
      type: 'friends/request',
      request: { id: uid('r'), userId, status: 'outgoing' },
    });
    show('好友申请已记录（本地演示）', 'success');
    onClose();
  };

  return (
    <Dialog title="查找同学" onClose={onClose}>
      <form className="stack" onSubmit={submit}>
        <p className="muted">好友申请只写入本地演示数据，不会通知真实用户。</p>
        <SelectField label="选择同学" name="userId" defaultValue="">
          <option value="">请选择</option>
          {candidates.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} · {user.department} · {user.year}
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
          <Button type="submit" disabled={candidates.length === 0}>
            发送申请
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export function InviteDialog({ user, onClose }: { user: User; onClose: () => void }) {
  const { dispatch } = useApp();
  const { show } = useToast();
  const [error, setError] = useState('');

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') ?? '').trim();
    const time = String(form.get('time') ?? '').trim();
    const place = String(form.get('place') ?? '').trim();
    if (!title || !time) {
      setError('请填写邀请内容和时间。');
      return;
    }
    dispatch({
      type: 'invites/add',
      invite: {
        id: uid('i'),
        userId: user.id,
        title,
        time,
        place,
        status: 'pending',
        direction: 'outgoing',
      },
    });
    show(`已向 ${user.name} 发送本地演示邀约`, 'success');
    onClose();
  };

  return (
    <Dialog title={`邀请 ${user.name} 一起安排时间`} onClose={onClose}>
      <form className="stack" onSubmit={submit}>
        <TextField label="邀请内容" name="title" defaultValue="一起学习 / 吃饭 / 运动" required />
        <TextField label="时间" name="time" placeholder="例如：周三 16:30" required />
        <TextField label="地点" name="place" placeholder="例如：图书馆一楼" />
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
          <Button type="submit">发送邀约</Button>
        </div>
      </form>
    </Dialog>
  );
}

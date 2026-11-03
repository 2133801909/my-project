import { useState } from 'react';
import { useApp } from '@/app/context';
import { POST_TYPES } from '@/domain/forum';
import { uid } from '@/domain/ids';
import type { PostType } from '@/domain/types';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { SelectField, TextAreaField, TextField } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/toast/context';

export function CreatePostDialog({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useApp();
  const { show } = useToast();
  const [error, setError] = useState('');

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') ?? '').trim();
    const body = String(form.get('body') ?? '').trim();
    const type = String(form.get('type') ?? '讨论') as PostType;
    const tags = String(form.get('tags') ?? '')
      .split(/[,，]/)
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 5);

    if (!title || !body) {
      setError('请填写标题和正文。');
      return;
    }

    dispatch({
      type: 'forum/add-post',
      post: {
        id: uid('p'),
        type,
        author: state.profile.name,
        time: '刚刚',
        title,
        body,
        tags,
        likes: 0,
        liked: false,
        comments: [],
      },
    });
    show('内容已发布到本地演示论坛', 'success');
    onClose();
  };

  return (
    <Dialog title="发布校园内容" onClose={onClose}>
      <form className="stack" onSubmit={submit}>
        <SelectField label="内容类型" name="type" defaultValue="讨论">
          {POST_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </SelectField>
        <TextField label="标题" name="title" required />
        <TextAreaField label="正文" name="body" rows={6} required />
        <TextField
          label="标签"
          name="tags"
          placeholder="用逗号分隔，例如：开源, 求建议"
          hint="最多 5 个"
        />
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
          <Button type="submit">发布</Button>
        </div>
      </form>
    </Dialog>
  );
}

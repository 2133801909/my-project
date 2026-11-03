import { useState } from 'react';
import { useApp } from '@/app/context';
import { isValidEvent, isValidTask } from '@/domain/tasks';
import { uid } from '@/domain/ids';
import { toISODateTime } from '@/domain/dates';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { SelectField, TextAreaField, TextField } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/toast/context';

export function TaskDialog({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useApp();
  const { show } = useToast();
  const [defaultDue] = useState(() => toISODateTime(new Date(Date.now() + 86_400_000)));
  const [error, setError] = useState('');

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const task = {
      id: uid('t'),
      title: String(form.get('title') ?? '').trim(),
      course: String(form.get('course') ?? '').trim(),
      due: String(form.get('due') ?? ''),
      note: String(form.get('note') ?? '').trim(),
      done: false,
    };
    if (!isValidTask(task)) {
      setError('请填写作业标题和截止时间。');
      return;
    }
    dispatch({ type: 'tasks/add', task });
    show('待办已添加', 'success');
    onClose();
  };

  return (
    <Dialog title="添加待办作业" onClose={onClose}>
      <form className="stack" onSubmit={submit}>
        <TextField label="作业标题" name="title" required />
        <SelectField label="关联课程" name="course" defaultValue="">
          <option value="">不关联课程</option>
          {state.courses.map((course) => (
            <option key={course.id} value={course.title}>
              {course.title}
            </option>
          ))}
        </SelectField>
        <TextField
          label="截止时间"
          name="due"
          type="datetime-local"
          defaultValue={defaultDue}
          required
        />
        <TextAreaField label="备注" name="note" rows={3} placeholder="可选" />
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
          <Button type="submit">添加待办</Button>
        </div>
      </form>
    </Dialog>
  );
}

export function EventDialog({ onClose }: { onClose: () => void }) {
  const { dispatch } = useApp();
  const { show } = useToast();
  const [defaultDate] = useState(() => toISODateTime(new Date(Date.now() + 86_400_000)));
  const [error, setError] = useState('');

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const draft = {
      id: uid('e'),
      title: String(form.get('title') ?? '').trim(),
      date: String(form.get('date') ?? ''),
      place: String(form.get('place') ?? '').trim(),
      note: String(form.get('note') ?? '').trim(),
      reminder: form.get('reminder') === 'on',
    };
    if (!isValidEvent(draft)) {
      setError('请填写安排名称和时间。');
      return;
    }
    dispatch({ type: 'events/add', event: draft });
    show('个人安排已添加', 'success');
    onClose();
  };

  return (
    <Dialog title="添加个人安排" onClose={onClose}>
      <form className="stack" onSubmit={submit}>
        <TextField label="安排名称" name="title" required />
        <TextField
          label="时间"
          name="date"
          type="datetime-local"
          defaultValue={defaultDate}
          required
        />
        <TextField label="地点" name="place" placeholder="可选" />
        <TextAreaField label="备注" name="note" rows={3} placeholder="可选" />
        <label className="checkbox-row">
          <input type="checkbox" name="reminder" defaultChecked />
          <span>开启本地提醒（仅按钮状态，不发送系统通知）</span>
        </label>
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
          <Button type="submit">添加安排</Button>
        </div>
      </form>
    </Dialog>
  );
}

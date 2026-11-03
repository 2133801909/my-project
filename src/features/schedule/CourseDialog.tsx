import { useState } from 'react';
import { useApp } from '@/app/context';
import { isValidCourse } from '@/domain/schedule';
import type { Course, CourseColor, WeekType } from '@/domain/types';
import { uid } from '@/domain/ids';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { SelectField, TextField } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/toast/context';

interface CourseDialogProps {
  course?: Course;
  onClose: () => void;
}

export function CourseDialog({ course, onClose }: CourseDialogProps) {
  const { dispatch } = useApp();
  const { show } = useToast();
  const [error, setError] = useState('');
  const editing = Boolean(course);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const draft = {
      id: course?.id ?? uid('c'),
      title: String(form.get('title') ?? '').trim(),
      day: Number(form.get('day')),
      start: String(form.get('start') ?? ''),
      end: String(form.get('end') ?? ''),
      location: String(form.get('location') ?? '').trim(),
      teacher: String(form.get('teacher') ?? '').trim(),
      color: (String(form.get('color') ?? 'blue') as CourseColor) || 'blue',
      weekType: String(form.get('weekType') ?? 'every') as WeekType,
    };

    if (!isValidCourse(draft)) {
      setError('请填写课程名称，并确保星期在 1–7、结束时间晚于开始时间。');
      return;
    }

    dispatch({ type: editing ? 'courses/update' : 'courses/add', course: draft });
    show(editing ? '课程已更新' : '课程已添加', 'success');
    onClose();
  };

  const remove = () => {
    if (!course) return;
    if (!window.confirm(`确定删除「${course.title}」吗？`)) return;
    dispatch({ type: 'courses/delete', id: course.id });
    show('课程已删除', 'info');
    onClose();
  };

  return (
    <Dialog title={editing ? '编辑课程' : '添加课程'} onClose={onClose}>
      <form className="stack" onSubmit={submit}>
        <TextField label="课程名称" name="title" defaultValue={course?.title ?? ''} required />
        <div className="form-row">
          <SelectField label="星期" name="day" defaultValue={String(course?.day ?? 1)}>
            {['一', '二', '三', '四', '五', '六', '日'].map((label, index) => (
              <option key={label} value={index + 1}>
                周{label}
              </option>
            ))}
          </SelectField>
          <SelectField label="上课周次" name="weekType" defaultValue={course?.weekType ?? 'every'}>
            <option value="every">每周</option>
            <option value="odd">单周</option>
            <option value="even">双周</option>
          </SelectField>
        </div>
        <div className="form-row">
          <TextField
            label="开始时间"
            name="start"
            type="time"
            defaultValue={course?.start ?? '08:00'}
            required
          />
          <TextField
            label="结束时间"
            name="end"
            type="time"
            defaultValue={course?.end ?? '09:40'}
            required
          />
        </div>
        <div className="form-row">
          <TextField
            label="地点"
            name="location"
            defaultValue={course?.location ?? ''}
            placeholder="教一 · 204"
          />
          <TextField
            label="教师"
            name="teacher"
            defaultValue={course?.teacher ?? ''}
            placeholder="张老师"
          />
        </div>
        <SelectField label="课程颜色" name="color" defaultValue={course?.color ?? 'blue'}>
          <option value="blue">蓝色</option>
          <option value="green">绿色</option>
          <option value="orange">橙色</option>
          <option value="plum">梅子色</option>
        </SelectField>

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="dialog-actions">
          {editing ? (
            <Button variant="danger" onClick={remove}>
              删除课程
            </Button>
          ) : null}
          <span className="spacer" />
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button type="submit">{editing ? '保存修改' : '添加课程'}</Button>
        </div>
      </form>
    </Dialog>
  );
}

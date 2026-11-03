import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/app/context';
import { ROUTES } from '@/app/routes';
import { formatDateTime } from '@/domain/dates';
import { dueLabel } from '@/domain/tasks';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, PageHeader } from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/toast/context';

export function TaskDetailPage() {
  const { taskId = '' } = useParams();
  const { state, dispatch } = useApp();
  const { show } = useToast();
  const navigate = useNavigate();
  const task = state.tasks.find((item) => item.id === taskId);

  if (!task) {
    return (
      <div className="page">
        <EmptyState
          icon="tasks"
          title="找不到这项待办"
          description="它可能已经被删除。"
          action={<Link to={ROUTES.tasks}>返回待办列表</Link>}
        />
      </div>
    );
  }

  const remove = () => {
    if (!window.confirm(`确定删除「${task.title}」吗？`)) return;
    dispatch({ type: 'tasks/delete', id: task.id });
    show('待办已删除', 'info');
    navigate(ROUTES.tasks);
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="待办详情"
        title={task.title}
        description={`${task.course || '个人待办'} · ${formatDateTime(task.due)} · ${dueLabel(task.due)}`}
        actions={
          <Link to={ROUTES.tasks} className="btn btn--ghost btn--md">
            <Icon name="arrowLeft" size={16} /> 返回列表
          </Link>
        }
      />

      <section className="panel detail-panel">
        <div className="detail-grid">
          <div>
            <span>关联课程</span>
            <strong>{task.course || '未关联'}</strong>
          </div>
          <div>
            <span>截止时间</span>
            <strong>{formatDateTime(task.due)}</strong>
          </div>
          <div>
            <span>完成状态</span>
            <strong>{task.done ? '已完成' : '未完成'}</strong>
          </div>
        </div>

        <div className="detail-note">
          <span>备注</span>
          <p>{task.note || '暂无备注'}</p>
        </div>

        <div className="dialog-actions">
          <Button variant="danger" icon={<Icon name="trash" size={16} />} onClick={remove}>
            删除待办
          </Button>
          <span className="spacer" />
          <Button
            variant={task.done ? 'secondary' : 'primary'}
            icon={<Icon name={task.done ? 'refresh' : 'check'} size={16} />}
            onClick={() => {
              dispatch({ type: 'tasks/toggle', id: task.id });
              show(task.done ? '已标记为未完成' : '已完成，做得不错', 'success');
            }}
          >
            {task.done ? '标记为未完成' : '标记完成'}
          </Button>
        </div>
      </section>
    </div>
  );
}

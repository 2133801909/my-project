import { Link } from 'react-router-dom';
import { useApp } from '@/app/context';
import { ROUTES } from '@/app/routes';
import { formatDateTime, formatToday, toISODate } from '@/domain/dates';
import { currentAcademicWeek, isCourseVisibleInWeek, sortCourses } from '@/domain/schedule';
import { pendingTasks } from '@/domain/tasks';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, PageHeader, Stat, Tag } from '@/components/ui/PageHeader';

export function DashboardPage() {
  const { state, dispatch } = useApp();
  const now = new Date();
  const todayDay = ((now.getDay() + 6) % 7) + 1;
  const week = currentAcademicWeek(state, now);
  const todayCourses = sortCourses(
    state.courses.filter(
      (course) => course.day === todayDay && isCourseVisibleInWeek(course, week),
    ),
  );
  const pending = pendingTasks(state.tasks);
  const upcomingEvents = [...state.events]
    .filter((event) => event.date >= `${toISODate(now)}T00:00`)
    .sort((a, b) => a.date.localeCompare(b.date));
  const incoming = state.requests.filter((request) => request.status === 'incoming');
  const friends = state.users.filter((user) => user.friend && !state.blocked.includes(user.id));
  const latestPosts = state.posts.slice(0, 3);

  return (
    <div className="page">
      <PageHeader
        eyebrow={formatToday()}
        title={`你好，${state.profile.name}`}
        description={`第 ${week} 教学周 · ${state.profile.department} · 今天也按自己的节奏来。`}
        actions={
          <Link to={ROUTES.schedule} className="btn btn--secondary btn--md">
            <Icon name="calendar" size={16} /> 查看课表
          </Link>
        }
      />

      <div className="stats-grid">
        <Stat label="未完成待办" value={pending.length} hint="按截止时间排序" />
        <Stat label="今日课程" value={todayCourses.length} hint={`第 ${week} 教学周`} />
        <Stat label="好友" value={friends.length} hint={`${incoming.length} 条申请待处理`} />
        <Stat label="近期安排" value={upcomingEvents.length} hint="含个人计划" />
      </div>

      <div className="dashboard-grid">
        <section className="panel dashboard-card dashboard-card--wide">
          <div className="panel__head">
            <h2>今天的课</h2>
            <span className="pill">
              周{['一', '二', '三', '四', '五', '六', '日'][todayDay - 1]}
            </span>
          </div>
          {todayCourses.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="今天没有课程"
              description="可以用来处理待办、运动或休息。"
              action={<Link to={ROUTES.schedule}>查看完整课表</Link>}
            />
          ) : (
            <ul className="agenda">
              {todayCourses.map((course) => (
                <li key={course.id} className={`agenda__item course-card--${course.color}`}>
                  <span className="agenda__time">
                    {course.start}
                    <small>{course.end}</small>
                  </span>
                  <div>
                    <strong>{course.title}</strong>
                    <small>
                      {course.location || '地点待定'}
                      {course.teacher ? ` · ${course.teacher}` : ''}
                    </small>
                  </div>
                  {course.weekType !== 'every' ? (
                    <em className="pill">{course.weekType === 'odd' ? '单周' : '双周'}</em>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel dashboard-card">
          <div className="panel__head">
            <h2>待办提醒</h2>
            <Link to={ROUTES.tasks}>全部</Link>
          </div>
          {pending.length === 0 ? (
            <EmptyState icon="tasks" title="待办已清空" description="今天没有截止事项。" />
          ) : (
            <ul className="mini-list">
              {pending.slice(0, 4).map((task) => (
                <li key={task.id}>
                  <Link to={ROUTES.task(task.id)}>
                    <span className={`mini-dot${new Date(task.due) < now ? ' is-danger' : ''}`} />
                    <span>
                      <strong>{task.title}</strong>
                      <small>{formatDateTime(task.due)}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel dashboard-card">
          <div className="panel__head">
            <h2>好友申请</h2>
            <Link to={ROUTES.friends}>好友页</Link>
          </div>
          {incoming.length === 0 ? (
            <EmptyState
              icon="users"
              title="没有待处理申请"
              description="去论坛或匹配页认识新同学。"
            />
          ) : (
            <ul className="mini-list">
              {incoming.slice(0, 4).map((request) => {
                const user = state.users.find((item) => item.id === request.userId);
                return (
                  <li key={request.id}>
                    <div className="request-mini">
                      <Avatar name={user?.name ?? '同学'} size="sm" />
                      <span>
                        <strong>{user?.name ?? '同学'}</strong>
                        <small>{user?.department ?? '院系未知'}</small>
                      </span>
                      <span className="spacer" />
                      <Button
                        size="sm"
                        onClick={() => dispatch({ type: 'friends/accept', requestId: request.id })}
                      >
                        接受
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="panel dashboard-card">
          <div className="panel__head">
            <h2>近期安排</h2>
            <Link to={ROUTES.tasks}>管理</Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <EmptyState icon="clock" title="暂无安排" description="添加自习或社团计划。" />
          ) : (
            <ul className="mini-list">
              {upcomingEvents.slice(0, 4).map((event) => (
                <li key={event.id}>
                  <div className="event-mini">
                    <span className="event-mini__date">{formatDateTime(event.date)}</span>
                    <span>
                      <strong>{event.title}</strong>
                      <small>{event.place || '地点待定'}</small>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel dashboard-card dashboard-card--wide">
          <div className="panel__head">
            <h2>校园论坛</h2>
            <Link to={ROUTES.forum}>进入论坛</Link>
          </div>
          <div className="dashboard-posts">
            {latestPosts.map((post) => (
              <Link key={post.id} to={ROUTES.post(post.id)} className="dashboard-post">
                <div className="dashboard-post__head">
                  <strong>{post.title}</strong>
                  <span className="pill pill--soft">{post.type}</span>
                </div>
                <small>
                  {post.author} · {post.time} · ♡ {post.likes}
                </small>
                <div className="friend-card__tags">
                  {post.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

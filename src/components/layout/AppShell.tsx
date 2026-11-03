import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '@/app/context';
import { NAV_ITEMS, ROUTES } from '@/app/routes';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';

function currentTitle(pathname: string): string {
  if (/^\/friends\/[^/]+\/chat\/?$/.test(pathname)) return '好友聊天';
  if (/^\/tasks\/[^/]+\/?$/.test(pathname)) return '待办详情';
  if (/^\/forum\/[^/]+\/?$/.test(pathname)) return '内容详情';

  const item = [...NAV_ITEMS]
    .sort((a, b) => b.to.length - a.to.length)
    .find((nav) => (nav.to === '/' ? pathname === '/' : pathname.startsWith(nav.to)));
  return item?.label ?? '同频';
}

export function AppShell() {
  const { state, session, signOut } = useApp();
  const location = useLocation();
  const [bannerVisible, setBannerVisible] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const pendingRequests = state.requests.filter((request) => request.status === 'incoming').length;
  const pendingInvites = state.invites.filter(
    (invite) => invite.status === 'pending' && invite.direction === 'incoming',
  ).length;
  const openTasks = state.tasks.filter((task) => !task.done).length;
  const notificationCount = pendingRequests + pendingInvites;

  const accountLabel =
    session?.mode === 'account' ? session.name : session?.mode === 'guest' ? '访客' : '未登录';

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__mark">同</span>
          <span className="brand__text">
            <strong>同频</strong>
            <small>校园生活助手</small>
          </span>
        </div>

        <nav className="nav" aria-label="主导航">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav__item${isActive ? ' is-active' : ''}`}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__note">
          <span className="pill pill--soft">本地演示</span>
          <p>数据只保存在当前浏览器，不会同步到其他设备。</p>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar__title">
            <span className="topbar__eyebrow">CAMPUS · YOUR SPACE</span>
            <strong>{currentTitle(location.pathname)}</strong>
          </div>

          <div className="topbar__actions">
            <button
              type="button"
              className="icon-button icon-button--badge"
              aria-label={`应用内提醒，${notificationCount} 条待处理`}
              onClick={() => setNotificationsOpen(true)}
            >
              <Icon name="bell" />
              {notificationCount > 0 ? <span className="badge">{notificationCount}</span> : null}
            </button>

            <NavLink to={ROUTES.settings} className="user-chip" aria-label="打开设置">
              <Avatar name={state.profile.name} size="sm" decorative />
              <span className="user-chip__text">
                <strong>{state.profile.name}</strong>
                <small>{accountLabel}</small>
              </span>
            </NavLink>

            <Button
              variant="ghost"
              size="sm"
              icon={<Icon name="logOut" size={16} />}
              onClick={signOut}
            >
              退出登录
            </Button>
          </div>
        </header>

        {bannerVisible ? (
          <div className="demo-banner" role="note">
            <Icon name="shield" size={16} />
            <span>
              这是本地演示：账号、好友、匹配、论坛与提醒均为当前浏览器内的模拟数据，不联网、不验证身份。
            </span>
            <button
              type="button"
              className="icon-button"
              aria-label="关闭演示说明"
              onClick={() => setBannerVisible(false)}
            >
              <Icon name="x" size={15} />
            </button>
          </div>
        ) : null}

        <main className="content">
          <Outlet />
        </main>
      </div>

      <nav className="mobile-nav" aria-label="移动端导航">
        {NAV_ITEMS.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `mobile-nav__item${isActive ? ' is-active' : ''}`}
          >
            <Icon name={item.icon} size={19} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {notificationsOpen ? (
        <Dialog title="应用内提醒" onClose={() => setNotificationsOpen(false)}>
          <div className="stack">
            <p>
              {state.settings.reminders
                ? '提醒功能已开启，但原型只在页面内展示状态，不会在浏览器关闭后推送通知。'
                : '应用内提醒当前已关闭，可在设置页重新开启。'}
            </p>
            <ul className="notice-list">
              <li>
                <strong>{openTasks}</strong> 项待办未完成
              </li>
              <li>
                <strong>{pendingRequests}</strong> 条好友申请待处理
              </li>
              <li>
                <strong>{pendingInvites}</strong> 个邀约待回复
              </li>
            </ul>
            <Button onClick={() => setNotificationsOpen(false)}>知道了</Button>
          </div>
        </Dialog>
      ) : null}
    </div>
  );
}

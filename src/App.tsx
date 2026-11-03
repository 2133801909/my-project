import { Link, Route, Routes } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { RequireSession } from '@/app/guards';
import { AppShell } from '@/components/layout/AppShell';
import { AuthPage } from '@/features/auth/AuthPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ForumPage } from '@/features/forum/ForumPage';
import { PostDetailPage } from '@/features/forum/PostDetailPage';
import { ChatPage } from '@/features/friends/ChatPage';
import { FriendsPage } from '@/features/friends/FriendsPage';
import { MapPage } from '@/features/map/MapPage';
import { MatchingPage } from '@/features/matching/MatchingPage';
import { SchedulePage } from '@/features/schedule/SchedulePage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { TaskDetailPage } from '@/features/tasks/TaskDetailPage';
import { TasksPage } from '@/features/tasks/TasksPage';

function NotFoundPage() {
  return (
    <div className="page">
      <h1>页面不存在</h1>
      <p className="muted">这个地址没有对应的演示页面。</p>
      <Link to={ROUTES.dashboard}>返回首页</Link>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<AuthPage />} />

      <Route element={<RequireSession />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/:taskId" element={<TaskDetailPage />} />
          <Route path="friends" element={<FriendsPage />} />
          <Route path="friends/:friendId/chat" element={<ChatPage />} />
          <Route path="matching" element={<MatchingPage />} />
          <Route path="forum" element={<ForumPage />} />
          <Route path="forum/:postId" element={<PostDetailPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

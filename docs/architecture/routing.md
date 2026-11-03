# 路由与鉴权

## 路由表

路由常量唯一来源：`src/app/routes.ts` 的 `ROUTES`。

| 路径                      | 页面             | 说明                                       |
| ------------------------- | ---------------- | ------------------------------------------ |
| `/login`                  | `AuthPage`       | 登录/注册/访客入口；已登录会重定向到首页。 |
| `/`                       | `DashboardPage`  | 首页概览。                                 |
| `/schedule`               | `SchedulePage`   | 课表周/日视图、课程 CRUD、教学周设置。     |
| `/tasks`                  | `TasksPage`      | 待办与个人安排。                           |
| `/tasks/:taskId`          | `TaskDetailPage` | 待办详情、完成/删除。                      |
| `/friends`                | `FriendsPage`    | 好友、申请、邀约、拉黑。                   |
| `/friends/:friendId/chat` | `ChatPage`       | 本地聊天、图片/语音/表情。                 |
| `/matching`               | `MatchingPage`   | 同系匹配与兴趣筛选。                       |
| `/forum`                  | `ForumPage`      | 论坛列表与发布。                           |
| `/forum/:postId`          | `PostDetailPage` | 帖子详情、评论、点赞、撤回。               |
| `/map`                    | `MapPage`        | 校区选择与占位地图。                       |
| `/settings`               | `SettingsPage`   | 资料、隐私、提醒、数据导出/重置。          |

## 路由结构

`src/App.tsx` 使用嵌套路由：

```tsx
<Route path="/login" element={<AuthPage />} />
<Route element={<RequireSession />}>
  <Route element={<AppShell />}>
    <Route index element={<DashboardPage />} />
    ...
  </Route>
</Route>
```

- `RequireSession`（`src/app/guards.tsx`）在无会话时 `<Navigate to="/login" />`。
- `AppShell` 渲染侧边栏/顶栏/移动导航，并通过 `<Outlet />` 渲染页面。
- 详情页是真实路由，不是内存字符串；刷新后仍可定位。

## Hash 路由

使用 `HashRouter`，URL 形如 `/#/schedule`。原因见 ADR 0002：

- 构建产物可直接部署到任意静态托管，无需服务器 rewrite；
- 不依赖 `file://` 的 History API 行为；
- 演示分发简单。

新增路由时同步更新：

1. `ROUTES` 常量；
2. `src/App.tsx`；
3. 导航项 `NAV_ITEMS`（若需要出现在侧边栏）；
4. 本文档与 `docs/modules/features.md`。

## 页面内导航

- 导航链接使用 `NavLink`，激活态由 `isActive` 控制。
- 详情返回使用普通 `Link` 到列表路由。
- 登录跳转使用 `navigate(ROUTES.dashboard, { replace: true })`，避免回退到登录页。

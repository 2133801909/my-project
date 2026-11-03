# `src/features/` 功能模块

每个功能目录拥有自己的页面、对话框与局部交互，通过 `useApp()` 读取状态、`dispatch` 写入状态。页面不得直接访问存储。

| 目录         | 文件                                                                          | 职责                                          | 主要依赖                               |
| ------------ | ----------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------- |
| `auth/`      | `AuthPage.tsx`                                                                | 演示登录/注册/访客入口；无密码。              | `useApp`, `ROUTES`                     |
| `dashboard/` | `DashboardPage.tsx`                                                           | 统计、今日课程、待办、申请、安排、论坛摘要。  | schedule/tasks domain                  |
| `schedule/`  | `SchedulePage.tsx`, `WeekGrid.tsx`, `CourseDialog.tsx`                        | 周/日视图、单双周、课程 CRUD、教学周设置。    | `isValidCourse`, `currentAcademicWeek` |
| `tasks/`     | `TasksPage.tsx`, `TaskDialogs.tsx`, `TaskDetailPage.tsx`                      | 待办/安排 CRUD、完成状态、提醒开关、详情页。  | tasks domain                           |
| `friends/`   | `FriendsPage.tsx`, `FriendDialogs.tsx`, `ChatPage.tsx`                        | 申请、好友、邀约、拉黑、聊天与媒体。          | chat domain, media service             |
| `matching/`  | `MatchingPage.tsx`                                                            | 开启匹配、同系/兴趣筛选、加好友/邀约。        | `eligibleMatches`                      |
| `forum/`     | `ForumPage.tsx`, `PostCard.tsx`, `PostDetailPage.tsx`, `CreatePostDialog.tsx` | 筛选、发布、点赞、评论、撤回、作者加好友。    | forum domain                           |
| `map/`       | `MapPage.tsx`                                                                 | 校区选择、占位地图、接入说明。                | 无                                     |
| `settings/`  | `SettingsPage.tsx`, `SettingsDialogs.tsx`                                     | 资料/兴趣编辑、隐私、提醒、导出、重置、退出。 | storage via provider                   |

## 页面契约

### AuthPage

- 已登录时 `<Navigate to="/">`。
- 表单不渲染 `type="password"`；错误通过 `role="alert"` 展示。
- 注册成功进入首页；访客直接进入首页。

### SchedulePage

- 周视图固定 7 列，横向滚动；今日列高亮。
- 周次模式 `current|odd|even` 通过 `scheduleWeekNumber` 换算显示周。
- 课程卡点击打开编辑；新增与编辑共用 `CourseDialog`。
- 删除前 `window.confirm`。
- 教学周设置写入 `weekCalendar.start`。

### TasksPage / TaskDetailPage

- 待办按截止时间排序；完成后进入折叠区。
- 复选框按钮使用 `aria-pressed`；行标题链接到详情。
- 个人安排的提醒开关为 `role="switch"`。
- 详情页找不到 ID 时显示 EmptyState，不抛错。

### FriendsPage / ChatPage

- 申请：接受把 request 置为 accepted 并把用户设为好友；忽略删除 request。
- 拉黑：写入双方 `blocked`，并把好友关系置 false；匹配/好友列表过滤。
- 邀约状态机：`pending` → `accepted`/`declined`/`cancelled`。
- 聊天：文本、表情、图片、语音；图片上限 8MB，压缩到最大边 1280；语音上限 20 秒。
- 图片点击打开缩放预览（0.5–4 倍）。
- 录音需要安全上下文；不支持时按钮禁用并显示说明。

### MatchingPage

- 未开启匹配时只显示开启入口。
- 候选：同院系 + 双方开启 + 未被拉黑。
- “兴趣重合”模式要求至少一个共同兴趣；标签筛选可叠加。
- 已是好友显示聊天；否则显示加好友（已申请则禁用）。

### ForumPage / PostDetailPage

- `项目` 是内容类型，不是独立页面；筛选使用 `postsForFilter`。
- 点赞是本地布尔值与计数同步。
- 仅作者可撤回，确认后从列表移除。
- 作者头像/名字可触发加好友；已是好友跳转聊天。
- 评论追加到对应帖子，评论表单提交后清空。

### MapPage

- 五个校区名称可切换；不得生成建筑坐标或路线。
- “地图数据未接入”必须始终可见；搜索只显示说明对话框。

### SettingsPage

- 隐私三选一（仅自己/好友/忙闲/公开），默认私密。
- 导出 JSON 使用 Blob + 临时对象 URL；不支持时提示。
- 重置需确认，恢复到新种子。
- 退出登录保存当前状态后清空会话。

## 新增功能的最小步骤

1. 在 `src/domain/` 增加类型/纯函数与单测（如有业务规则）。
2. 在 `src/state/reducer.ts` 增加 action 与测试。
3. 在 `src/features/<domain>/` 创建页面/对话框。
4. 在 `ROUTES` 与 `App.tsx` 注册路由；需要导航时更新 `NAV_ITEMS`。
5. 在 `src/styles/` 增加功能样式并 import 到 `main.tsx`。
6. 增加组件测试 + 浏览器冒烟。
7. 更新 `docs/modules/features.md` 与相关架构文档。

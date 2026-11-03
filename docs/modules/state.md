# `src/state/` 与 `src/app/` 模块接口

## `src/state/seed.ts`

```ts
createSeed(now?: Date): AppState
```

生成时间相对化的演示数据：课程表固定，待办/安排的日期相对 `now` 计算，便于任何日期打开都有“今天”的内容。返回全新对象，调用方可安全修改。

**不要**在组件顶层直接调用 `createSeed()` 生成状态；生产入口由 `AppProvider` 调用，测试可注入固定时钟。

## `src/state/reducer.ts`

```ts
export type AppAction = ...
export function appReducer(state: AppState, action: AppAction): AppState
```

reducer 是纯函数：不调用时间、随机数、存储或 DOM。所有 action 均为判别联合，新增 action 必须：

1. 在 `AppAction` 中声明；
2. 在 `appReducer` 的 `switch` 中处理；
3. 返回新对象，不修改 `state`；
4. 在 `tests/unit/reducer.test.ts` 覆盖关键分支。

### Action 表

| 分组 | Action                                                                                    | 结果                                       |
| ---- | ----------------------------------------------------------------------------------------- | ------------------------------------------ |
| 全局 | `state/replace`, `state/reset`                                                            | 用外部状态替换（登录、重置）。             |
| 资料 | `profile/update`, `profile/toggle-matching`                                               | 合并资料或切换匹配开关。                   |
| 设置 | `settings/set-visibility`, `settings/toggle-busy-only`, `settings/toggle-reminders`       | 更新隐私/提醒。                            |
| 课程 | `courses/add`, `courses/update`, `courses/delete`, `week/set-start`                       | 课程 CRUD 与教学周。                       |
| 待办 | `tasks/add`, `tasks/toggle`, `tasks/delete`                                               | 待办 CRUD。                                |
| 安排 | `events/add`, `events/delete`, `events/toggle-reminder`                                   | 个人安排。                                 |
| 好友 | `friends/request`, `friends/accept`, `friends/decline`, `friends/remove`, `friends/block` | 申请与好友关系；block 同步双方 blocked。   |
| 邀约 | `invites/add`, `invites/respond`                                                          | 邀约状态机。                               |
| 聊天 | `chat/send`                                                                               | 追加到 `conversations[userId]`。           |
| 论坛 | `forum/add-post`, `forum/toggle-like`, `forum/comment`, `forum/withdraw`                  | 帖子与点赞/评论；撤回复用 `withdrawPost`。 |
| 地图 | `map/select`                                                                              | 选择校区。                                 |

### 为什么 ID 不在 reducer 生成

reducer 必须可预测、可重放。`uid()` 依赖随机数/时钟，因此在点击处理器生成完整对象后作为 action payload 传入。同理，时间字符串在事件处理器生成。

## `src/app/AppProvider.tsx`

```ts
interface AppProviderProps {
  children: ReactNode;
  repository?: AppRepository; // 测试注入
  sessionRepository?: SessionRepository;
  initialState?: AppState; // 跳过仓库加载
  initialSession?: DemoSession; // 跳过 session 读取
  now?: () => Date; // 固定时钟
}
```

提供 `AppContextValue`：

```ts
{
  (state,
    dispatch,
    session,
    signIn(name),
    register(name),
    continueAsGuest(),
    signOut(),
    resetDemoData());
}
```

行为：

- **初始化**：读取/校验 session → 加载 state。account 会话指向不存在的账号时视为未登录。
- **自动保存**：`state` 或 `session` 变化后调用 `repository.save()`；失败只提示一次。
- **注册**：新账号获得全新种子数据；已存在则报错。
- **登录**：只允许已存在的演示账号。
- **访客**：读取全局状态，不写入账号快照。
- **退出**：保存后清空会话，内存状态重置为种子。
- **重置**：用新种子替换，自动保存由 effect 完成。

## `src/app/context.ts`

`AppContext` + `useApp()`。`useApp()` 在 Provider 外调用会抛错，便于测试捕获错误挂载。

## `src/app/routes.ts`

`ROUTES` 是路径唯一来源；`NAV_ITEMS` 决定侧边栏与移动导航。路径函数（`task(id)`、`chat(id)`、`post(id)`）避免手写模板字符串。

## `src/app/guards.tsx`

`RequireSession`：无会话时 `<Navigate to="/login" replace />`，否则渲染 `<Outlet />`。

## 修改检查清单

- 新 action → reducer + 测试 + 本文档 action 表。
- 新持久化字段 → `types.ts`、`createSeed()`、`normalizeState()`、`state-model.md`。
- 新鉴权行为 → 先读 ADR 0005；不得引入密码。

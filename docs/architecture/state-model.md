# 状态模型

`AppState` 定义在 `src/domain/types.ts`，由 `createSeed()` 生成初始值，经 `appReducer()` 更新，由 `AppRepository` 序列化为 JSON。

## 结构

| 字段            | 类型                            | 说明                                                               |
| --------------- | ------------------------------- | ------------------------------------------------------------------ |
| `profile`       | `Profile`                       | 当前演示用户：昵称、院系、年级、兴趣、是否开启匹配。               |
| `settings`      | `Settings`                      | 课表可见范围、是否只分享忙闲、应用内提醒开关。                     |
| `courses`       | `Course[]`                      | 课程：星期 1–7、`HH:MM` 起止、地点、教师、颜色、单双周。           |
| `tasks`         | `Task[]`                        | 作业/待办：标题、关联课程名、截止时间、备注、完成状态。            |
| `events`        | `EventItem[]`                   | 个人安排：时间、地点、备注、提醒标记。                             |
| `users`         | `User[]`                        | 演示同学：院系、兴趣、匹配开关、好友状态、忙闲描述、拉黑列表。     |
| `requests`      | `FriendRequest[]`               | 好友申请，状态为 `incoming` / `outgoing` / `accepted`。            |
| `invites`       | `Invite[]`                      | 邀约，含方向与 `pending` / `accepted` / `declined` / `cancelled`。 |
| `conversations` | `Record<string, ChatMessage[]>` | 以用户 ID 为键的本地聊天记录。                                     |
| `posts`         | `Post[]`                        | 论坛内容，`type` 为 `讨论` / `分享` / `项目`。                     |
| `blocked`       | `string[]`                      | 当前用户拉黑的用户 ID（唯一事实来源）。                            |
| `mapCampus`     | `Campus`                        | 当前选中的校区名称。                                               |
| `weekCalendar`  | `{ start: string }`             | 第 1 教学周周一日期，`YYYY-MM-DD`。                                |

## 消息联合类型

`ChatMessage` 是判别联合，按 `type` 收窄：

- `text` / `emoji`：`body`；
- `image`：`dataUrl`（`data:image/...`）；
- `audio`：`dataUrl`（`data:audio/...`）+ `duration` 秒。

所有消息都带 `id`、`author`、`time`、`mine`。

## 不变量

1. `courses.day ∈ [1,7]`；`start`/`end` 匹配 `HH:MM` 且 `end > start`；`weekType ∈ every|odd|even`。
2. `tasks.due`、`events.date` 为本地时间字符串；任务必须有标题与截止时间。
3. `conversations` 的键是 `User.id`，不是昵称。
4. `blocked` 与 `users[].blocked` 同步维护：拉黑时同时写入双方，便于匹配规则判断。
5. `profile.id` 当前固定为 `'you'`；拉黑逻辑用它写入对方的 `blocked`。
6. `weekCalendar.start` 始终为 `YYYY-MM-DD`；非法值回退到种子值。
7. 持久化数据只保证“可渲染”，不保证可信；`normalizeState()` 会对缺失/类型错误的集合回退到种子。

## 会话模型

`DemoSession` 不属于 `AppState`，存放在 `sessionStorage`：

```ts
type DemoSession = { mode: 'account'; name: string } | { mode: 'guest' } | null;
```

- `account`：从 `campus-life-demo-account:<小写昵称>` 读取该昵称的快照。
- `guest`：读取全局 `campus-life-demo:v2`。
- `null`：未登录，路由守卫跳转 `/login`。

## 派生数据

以下数据不进入 state，渲染时计算：

- 当前教学周：`currentAcademicWeek(state)`；
- 单双周过滤：`isCourseVisibleInWeek()`；
- 匹配候选：`eligibleMatches({ ...profile, blocked }, users)`；
- 待办排序：`pendingTasks()`；
- 论坛筛选：`postsForFilter()`。

派生逻辑放 `src/domain/`，不要塞进组件或 reducer。

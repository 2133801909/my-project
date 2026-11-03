# `src/domain/` 模块接口

领域层是**无 React、无浏览器依赖**的纯 TypeScript。所有函数必须可重复调用且不修改入参（除非明确返回新对象）。异常输入应返回安全默认值，不抛异常。

## `types.ts`

`AppState`、`Course`、`Task`、`EventItem`、`User`、`FriendRequest`、`Invite`、`Post`、`ChatMessage`、`Profile`、`Settings`、`DemoSession`、`PersistenceResult` 等共享类型。字段含义见 [`../architecture/state-model.md`](../architecture/state-model.md)。

## `auth.ts`

| 导出                                          | 签名                         | 契约                                                                 |
| --------------------------------------------- | ---------------------------- | -------------------------------------------------------------------- |
| `demoAccountKey`                              | `(name: string) => string`   | 去除首尾空格、转小写后拼接前缀。前缀为 `campus-life-demo-account:`。 |
| `isValidDemoAccountName`                      | `(name: unknown) => boolean` | trim 后长度 2–40。                                                   |
| `DEMO_ACCOUNT_PREFIX/ MIN_LENGTH/ MAX_LENGTH` | 常量                         | 存储键与校验的唯一来源。                                             |

## `dates.ts`

工具函数均使用**本地时区**，不经过 UTC，避免“日期少一天”。

| 导出                                                                   | 用途                                     |
| ---------------------------------------------------------------------- | ---------------------------------------- |
| `toISODate` / `toISODateTime`                                          | 生成 `YYYY-MM-DD` / `YYYY-MM-DDTHH:mm`。 |
| `parseDate`                                                            | 解析失败返回 `null`。                    |
| `mondayOf` / `addDays`                                                 | 周一基准与日期加减。                     |
| `formatMonthDay` / `formatDateTime` / `formatToday` / `formatChatTime` | `zh-CN` 展示格式。                       |
| `pad2`                                                                 | 两位补零。                               |

## `schedule.ts`

```ts
canViewSchedule(settings, viewerIsFriend): boolean
visibleSchedule(courses, settings, viewerIsFriend): Array<Course | BusySlot>
isValidCourse(course): boolean
academicWeekNumber(startDate, currentDate): number
isCourseVisibleInWeek(course, weekNumber): boolean
scheduleWeekNumber(mode, currentWeek): number
currentAcademicWeek(state, now?): number
sortCourses(courses): T[]
```

- 隐私：`private` 拒绝；`public` 允许；`friends` 仅好友允许。`shareBusyOnly` 时把课程投影为 `{ day, start, end, label: '忙碌' }`。
- 课程校验：标题非空、`day` 整数 1–7、时间 `HH:MM`、`end > start`、`weekType` 合法。
- 单双周：奇数周只显示 `odd`，偶数周只显示 `even`，`every` 始终显示。
- 教学周：以第 1 周周一为基准计算 1-based 周次；非法日期返回 1。

## `tasks.ts`

```ts
isValidEvent(event): boolean   // 标题 + 时间；地点可选
isValidTask(task): boolean     // 标题 + 截止时间
toggleTask(task): Task         // 返回新对象
sortTasksByDue(tasks): Task[]
pendingTasks(tasks): Task[]
dueLabel(due, now?): string    // 已逾期 / 今天截止 / 明天截止 / N 天后截止
```

## `matching.ts`

```ts
eligibleMatches(me, candidates): T[]
sharedInterests(a, b): string[]
```

匹配规则：`me.matchingEnabled === true` 且 `me.department` 非空；候选也必须开启、同院系、双方未拉黑、不是自己。`me.blocked` 需由调用方合并全局拉黑列表。

## `chat.ts`

| 导出                         | 契约                                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `isValidChatMessage`         | 文本 1–2000 字；图片 `data:image/` 且字符串 ≤ 3MiB；语音 `data:audio/` 且 1–20 秒；不支持的类型返回 false。 |
| `isAllowedImageSize`         | `0 < bytes ≤ 8MiB`。                                                                                        |
| `isAllowedRecordingDuration` | `0 < seconds ≤ 20`。                                                                                        |
| `isImageMessage`             | 判别守卫。                                                                                                  |
| `nextImageZoom`              | 0.5–4 倍，步长 0.25，`direction=0` 还原为 1。                                                               |

## `forum.ts`

```ts
POST_TYPES: ['讨论','分享','项目']
canWithdrawPost(post, author): boolean
withdrawPost(posts, postId, author): Post[]
forumAuthorAction(user, state): { kind: 'missing'|'friend'|'pending'|'add'; userId? }
postsForFilter(posts, filter): Post[]
```

`withdrawPost` 只移除作者匹配的帖子；作者不匹配时原样返回（新数组）。

## `ids.ts`

`uid(prefix)` 生成带业务前缀的本地唯一 ID，优先 `crypto.randomUUID`。**只能在事件处理器/服务中调用**，禁止在 reducer 或渲染函数体内调用。

## 修改规则

- 新增规则先加纯函数 + 单测，再接入 UI/reducer。
- 不在此目录 import `react`、`window`、`localStorage`。
- 类型变化必须同步 `docs/architecture/state-model.md`。

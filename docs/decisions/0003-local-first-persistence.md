# ADR 0003：本地优先持久化与版本迁移

- 状态：已接受
- 日期：2026-11-03

## 背景

演示没有后端，但需要跨刷新保留课程、待办、聊天等数据；同时要支持多个演示账号在同一浏览器中互不覆盖。

## 决策

- 全局状态：`localStorage['campus-life-demo:v2']`。
- 账号快照：`localStorage['campus-life-demo-account:<trim+lowercase(name)>']`。
- 会话：`sessionStorage['campus-life-demo-session-v2']`，JSON。
- 旧版键 `campus-life-demo-v1` / `campus-life-demo-session` 只读迁移；下一次保存写入新键。
- 所有存储访问经 `AppRepository`/`SessionRepository`，失败返回结果对象而不是抛异常。
- `normalizeState()` 对不可信 JSON 做白名单/回退，避免旧数据或手工篡改导致崩溃。

## 后果

正面：

- 刷新可恢复；账号切换互不污染；
- 存储失败可提示且不阻塞当前会话；
- 旧用户数据平滑迁移。

负面：

- 数据仅限当前浏览器，无法跨设备；
- 账号快照会复制全量状态，空间随账号数增长；
- 清除浏览器数据即丢失。

## 约束

- 不得在组件中直接使用 `localStorage`。
- 修改键名必须新增迁移路径与 ADR。
- 发送前严格限制附件大小，避免轻易触发 5MB 配额。

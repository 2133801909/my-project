# `tests/` 测试架构

## 技术栈

- **Vitest 5** + **jsdom**；
- **@testing-library/react** + **user-event** + **jest-dom**；
- 无 Playwright/Cypress；浏览器冒烟由开发流程手动/代理完成。

## 命令

```sh
npm test              # 单次运行全部测试
npm run test:watch    # 监听模式
npm run typecheck     # 测试文件也参与类型检查
npm run check         # typecheck + lint + test + build
```

## 目录

| 路径                                | 内容                                                     |
| ----------------------------------- | -------------------------------------------------------- |
| `tests/setup.ts`                    | 注册 jest-dom、清理 DOM、补 `scrollTo`/`matchMedia`。    |
| `tests/render.tsx`                  | 统一 Provider 夹具：内存存储、固定时钟、`MemoryRouter`。 |
| `tests/unit/domain.test.ts`         | 领域规则：隐私、单双周、匹配、聊天限制、论坛规则。       |
| `tests/unit/reducer.test.ts`        | reducer 不可变性、好友/拉黑、点赞、撤回、聊天追加。      |
| `tests/unit/storage.test.ts`        | 持久化、账号隔离、迁移、配额失败、会话迁移。             |
| `tests/component/auth.test.tsx`     | 无密码字段、昵称校验、找不到账号、访客入口。             |
| `tests/component/app.test.tsx`      | 路由渲染、导航、注册进入、未登录重定向。                 |
| `tests/component/schedule.test.tsx` | 添加课程回归、时间校验、日视图/单双周切换。              |
| `tests/component/tasks.test.tsx`    | 完成状态、添加待办、提醒开关。                           |
| `tests/component/chat.test.tsx`     | 发送文本并清空输入。                                     |

## `renderWithProviders`

```ts
renderWithProviders(<SchedulePage />, {
  initialState?,        // 默认 createSeed(FIXED_NOW)
  initialSession?,      // 默认 { mode: 'guest' }；null 表示未登录
  entries?,             // MemoryRouter 初始路径，默认 ['/']
  path?,                // 单页面测试的 Route path
})
```

返回 `{ repository, storage, sessionStorage, ...RTL }`，可直接断言持久化结果。

规则：

- 组件测试必须包在 Provider 中；不要 mock `useApp`。
- 需要路由参数时使用 `path + entries`（如 `/friends/:friendId/chat`）。
- 固定时钟 `FIXED_NOW = 2026-11-03T09:00:00`，避免日期相关断言漂移。
- 存储使用 `createMemoryStorage()`；不要污染真实 `localStorage`。

## 覆盖策略

优先测试：

1. **业务规则**（领域纯函数）——最稳定、最快；
2. **状态转换**（reducer）——不可变性、去重、权限；
3. **用户可见行为**（组件）——表单校验、关键路径、回归；
4. **持久化边界**——迁移、失败、隔离。

不测试：

- CSS 文本/class 的字符串匹配（旧版测试的反模式）；
- 组件内部实现细节、纯装饰性 class；
- 第三方库行为。

## 新增测试

- 新领域规则 → `tests/unit/domain.test.ts`（或拆分新文件）。
- 新 action → `tests/unit/reducer.test.ts`，断言原 state 未被修改。
- 新页面/表单 → `tests/component/<name>.test.tsx`，使用角色/label 查询。
- 交互优先 `userEvent`，避免 `fireEvent`。
- 异步断言使用 `findBy*`/`waitFor`，禁止固定 sleep。
- 回归测试命名说明“修复了什么”，例如“regression: the old app called an undefined handler”。

## 已知限制

- jsdom 不支持真实 canvas/媒体流；图片压缩与录音只做限制测试 + 浏览器冒烟。
- 无覆盖率阈值；新增关键路径应附带行为测试。
- 浏览器验证清单：登录/注册/访客、课表 CRUD、待办完成、聊天发送、论坛发帖/评论、设置导出、移动端布局。

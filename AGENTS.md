# Repository Guidelines

> 本文件面向 AI 编码代理与新加入的工程师。**动手前先读文档，不要靠猜。** 详细接口与决策在 `docs/`。

## 0. 开工前必读

按顺序阅读，约 10 分钟：

1. [`docs/architecture/overview.md`](docs/architecture/overview.md) — 分层与依赖方向。
2. [`docs/architecture/state-model.md`](docs/architecture/state-model.md) — 状态合同与不变量。
3. [`docs/architecture/data-flow.md`](docs/architecture/data-flow.md) — 渲染/保存/登录流程。
4. 与本次改动相关的 [`docs/modules/`](docs/modules/) 文档。
5. 涉及技术选型或边界时，读 [`docs/decisions/`](docs/decisions/) 与 [`docs/conventions/demo-boundaries.md`](docs/conventions/demo-boundaries.md)。

文档索引：[`docs/README.md`](docs/README.md)。

## 1. 项目速览

同频（Tóngpín）是面向大学生的校园生活助手**本地演示**：课表、待办、个人安排、好友/邀约、同系匹配、论坛、聊天、占位地图与设置。

- 纯前端，无后端、无真实认证、无网络请求。
- 数据仅存当前浏览器：`localStorage` + `sessionStorage`。
- 演示边界是产品合同，见 `docs/conventions/demo-boundaries.md`。

## 2. 技术栈与运行环境

| 项     | 选择                                              |
| ------ | ------------------------------------------------- |
| UI     | React 19 + TypeScript（strict）                   |
| 构建   | Vite 8                                            |
| 路由   | React Router 7，`HashRouter`                      |
| 状态   | `useReducer` + Context（无 Redux/Zustand）        |
| 测试   | Vitest 5 + jsdom + Testing Library                |
| 样式   | 原生 CSS 分层 + 设计令牌（无 Tailwind/CSS-in-JS） |
| 运行时 | Node.js ≥ 20.19（开发/构建）；现代浏览器（应用）  |
| 包管理 | npm（`package-lock.json`）                        |

## 3. 常用命令

```sh
npm install            # 安装依赖（已有 node_modules 可跳过）
npm run dev            # 开发服务器 http://localhost:5173
npm test               # Vitest 单次运行
npm run test:watch     # 监听
npm run typecheck      # tsc --noEmit
npm run lint           # ESLint
npm run format         # Prettier 写入
npm run format:check   # Prettier 校验
npm run build          # 类型检查 + 生产构建到 dist/
npm run preview        # 预览构建产物
npm run check          # typecheck + lint + test + build（提交前）
```

## 4. 目录地图

```text
src/
  domain/        纯类型、校验、排序、匹配、论坛/聊天规则（无 React/浏览器）
  state/         createSeed、appReducer（纯函数）
  services/      storage 仓库、session 仓库、媒体处理、类型守卫
  app/           AppProvider、context、ROUTES、鉴权守卫
  components/    AppShell、通用 UI（Button/Dialog/Form/Toast/Icon/Avatar）
  features/      按业务域拆分的页面与对话框
  styles/        tokens/base/layout + 按功能拆分的 CSS
tests/
  unit/          领域、reducer、存储
  component/     页面与表单行为
  render.tsx     Provider/路由/内存存储夹具
docs/            架构、模块接口、ADR、规范
```

依赖方向（只能向下）：

```text
features → app / components → state → domain
                    ↘ services → domain
```

禁止：`domain` import React；`state` import 存储；页面直接访问 `localStorage`。

## 5. 架构要点

- 组合根：`src/main.tsx` → `ToastProvider` → `AppProvider` → `HashRouter` → `App`。
- 所有状态变更：组件 `dispatch(AppAction)` → `appReducer` → Provider effect 自动保存。
- ID/时间在事件处理器生成；reducer 保持纯函数。
- 持久化只经 `AppRepository` / `SessionRepository`；失败返回 `{ ok, reason }`。
- 领域派生数据（当前周、单双周、匹配候选）调用 `src/domain/` 纯函数。
- 详情页是真实路由（`/tasks/:id`、`/forum/:id`、`/friends/:id/chat`）。

## 6. 开发工作流（AI 必遵循）

### 修改现有功能

1. 用 `grep`/`read` 定位 feature 文件与对应 domain/reducer。
2. 若涉及导出符号，先查所有调用点。
3. 先改领域/状态，再改 UI。
4. 加/改行为测试。
5. 跑 `npm run check`。
6. 浏览器冒烟改动路径。
7. 更新文档。

### 新增功能

严格按 [`docs/conventions/adding-a-feature.md`](docs/conventions/adding-a-feature.md)：

1. `domain/` 加纯函数 + 单测（有业务规则时）。
2. `types.ts` / `seed.ts` / `normalizeState()`（如需持久化）。
3. `reducer.ts` 加 action + 测试。
4. `features/` 建页面/对话框。
5. `ROUTES` + `App.tsx` 注册；必要时 `NAV_ITEMS`。
6. `styles/` 加样式并 import 到 `main.tsx`。
7. 组件测试 + 浏览器冒烟。
8. 更新 `docs/modules/features.md` 等文档。

### 不要做

- 不要恢复旧版 `app.js` / `styles.css` / `innerHTML` 模板。
- 不要为“以后可能用到”加抽象、配置或依赖。
- 不要绕过 reducer 直接改 state。
- 不要在 render 中调用 `Date.now()` / `Math.random()` / `crypto.randomUUID()`。
- 不要放宽演示边界（见 §9）。
- 不要用源码正则测试替代行为测试。
- 不要编辑历史 ADR；新增一篇并在旧文标注取代关系。

## 7. 代码规范速查

- TypeScript strict，禁止 `any`；外部数据用 `unknown` + `isRecord()`。
- 导入用 `@/` 别名；类型用 `import type`；不建 barrel。
- 组件 PascalCase，页面以 `Page` 结尾；action 用 `域/动作`（`courses/add`）。
- 按钮默认 `type="button"`；提交按钮显式 `type="submit"`。
- 图标按钮必须有 `aria-label`；开关 `role="switch"` + `aria-checked`。
- 表单 hint 放在 `<label>` 外，避免污染可访问名称。
- 颜色/圆角/阴影只用 `src/styles/tokens.css` 变量。
- 可预期失败用中文 Toast/`role="alert"`，不要抛到界面。
- 详细规则：[`docs/conventions/coding.md`](docs/conventions/coding.md)。

## 8. 测试与验收

- 测试分层：领域 → reducer → 组件；不测 CSS 字符串与内部实现。
- 组件测试统一用 `tests/render.tsx` 的 `renderWithProviders`（内存存储、固定时钟、MemoryRouter）。
- 异步用 `findBy*` / `waitFor`，禁止固定 sleep。
- 提交前必须 `npm run check` 全绿。
- 行为变更必须在真实浏览器冒烟：`npm run dev` 或 `npm run preview`，走一遍改动路径；移动端至少检查 390×844。
- 细节：[`docs/modules/tests.md`](docs/modules/tests.md)。

## 9. 硬约束（演示边界）

- 不收集密码；任何 `type="password"` 都是回归。
- 不发起网络请求；唯一外部资源是 Google Fonts（可离线回退）。
- 不伪造地图坐标/路线；地图必须保留“未接入”说明。
- 不实现真实推送；提醒只是本地开关。
- 不宣称与杭州电子科技大学官方合作。
- 完整清单：[`docs/conventions/demo-boundaries.md`](docs/conventions/demo-boundaries.md)。

## 10. 文档同步协议

改代码时同步更新：

| 改动                       | 更新                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------- |
| 导出函数签名               | `docs/modules/domain.md` 或对应模块                                                 |
| action / 状态字段 / 存储键 | `docs/modules/state.md`、`architecture/state-model.md`、`architecture/data-flow.md` |
| 路由/页面                  | `architecture/routing.md`、`modules/features.md`                                    |
| 样式分层                   | `modules/styles.md`                                                                 |
| 技术选型/边界              | 新 ADR + 本文件相关段落                                                             |

文档过期视为缺陷。代码与文档冲突时：以可运行代码与测试为准，但必须在同一次修改中修正文档；涉及演示边界时先停下列出冲突。

## 11. 完成定义（Definition of Done）

- [ ] 需求端到端可用，不是半成品/占位实现。
- [ ] `npm run check` 通过（typecheck + lint + test + build）。
- [ ] 改动路径在真实浏览器验证过，控制台无错误。
- [ ] 没有新增死代码、未使用导出或临时脚手架。
- [ ] 文档与 ADR 已同步。
- [ ] 演示边界未被突破；文案仍明确“本地/演示/未接入”。

# 同频 · 工程文档索引

本目录是同频（校园生活助手本地演示）的长期知识库。**代码不是唯一事实来源**：修改模块接口、状态结构、存储键或技术选型时，必须同步更新对应文档。

## 阅读顺序

1. [`architecture/overview.md`](architecture/overview.md) — 分层、依赖方向、目录职责。
2. [`architecture/state-model.md`](architecture/state-model.md) — `AppState` 数据合同与不变量。
3. [`architecture/data-flow.md`](architecture/data-flow.md) — 渲染、reducer、持久化、会话恢复。
4. [`architecture/routing.md`](architecture/routing.md) — 路由表、鉴权守卫、Hash 路由。
5. `modules/` — 按目录记录的模块接口。
6. `decisions/` — 已接受的架构决策（ADR）。
7. `conventions/` — 编码、扩展功能、演示边界与文档维护规范。

## 模块文档

| 文档                                         | 覆盖目录                 | 内容                                           |
| -------------------------------------------- | ------------------------ | ---------------------------------------------- |
| [`modules/domain.md`](modules/domain.md)     | `src/domain/`            | 领域类型、纯函数、校验规则、公共 API           |
| [`modules/state.md`](modules/state.md)       | `src/state/`, `src/app/` | 种子数据、reducer action、Provider、会话与鉴权 |
| [`modules/services.md`](modules/services.md) | `src/services/`          | 存储仓库、会话仓库、媒体工具、运行时守卫       |
| [`modules/ui.md`](modules/ui.md)             | `src/components/`        | 布局、通用组件、Dialog、Toast、表单控件        |
| [`modules/features.md`](modules/features.md) | `src/features/`          | 各业务页面的职责、依赖与交互契约               |
| [`modules/styles.md`](modules/styles.md)     | `src/styles/`            | 样式分层、命名、断点、设计令牌                 |
| [`modules/tests.md`](modules/tests.md)       | `tests/`                 | 测试分层、夹具、编写约定                       |

## 决策记录（ADR）

| 编号                                                     | 决策                      |
| -------------------------------------------------------- | ------------------------- |
| [`0001`](decisions/0001-react-typescript-vite.md)        | React + TypeScript + Vite |
| [`0002`](decisions/0002-hash-routing.md)                 | Hash 路由与静态托管       |
| [`0003`](decisions/0003-local-first-persistence.md)      | 本地优先持久化与迁移      |
| [`0004`](decisions/0004-pure-domain-injectable-store.md) | 纯领域函数 + 可注入仓库   |
| [`0005`](decisions/0005-demo-auth-boundary.md)           | 演示账号边界              |
| [`0006`](decisions/0006-testing-strategy.md)             | 单元 + 组件测试策略       |

## 维护规则

- **接口变化**：更新 `modules/` 对应文档的签名与示例。
- **状态/存储变化**：更新 `architecture/state-model.md`、`data-flow.md`，并在 `decisions/` 追加 ADR（不要改写历史决策）。
- **新增目录**：在 `modules/` 增加一篇文档，并在本索引登记。
- **文档中的代码片段**必须来自真实实现；不要写“计划中”的 API 而不加标注。
- 修改演示边界（联网、真实认证、地图数据）前，先读 `conventions/demo-boundaries.md` 并新增 ADR。

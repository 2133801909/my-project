# ADR 0004：纯领域函数 + 可注入仓库 + 单一 reducer

- 状态：已接受
- 日期：2026-11-03

## 背景

旧版把校验、状态变更、DOM 更新、持久化混在同一函数里，测试只能读源码正则，无法验证行为。

## 决策

1. **领域层纯函数**：校验、排序、匹配、限制都在 `src/domain/`，不依赖 React/浏览器。
2. **单一 reducer**：所有状态变更通过 `AppAction` 进入 `appReducer`；reducer 不产生副作用。
3. **副作用在边缘**：ID/时间在事件处理器生成；存储、媒体、导航在服务或 Provider 中执行。
4. **依赖注入**：`AppProvider` 接受 `repository`、`sessionRepository`、`initialState`、`initialSession`、`now`，测试用内存实现与固定时钟。
5. **本地状态优先**：不引入 Redux/Zustand；当前规模用 `useReducer` + Context 足够。

## 后果

正面：

- reducer 与领域规则可在 Node 中毫秒级测试；
- 页面不依赖存储实现；
- 状态变更集中，易于审查。

负面：

- Context 每次 state 变化会重渲染整棵页面树；当前规模可接受，未来可用 selector 拆分。
- 新增 action 需要同时改类型、switch、测试、文档，略显繁琐但可追踪。

## 何时重新评估

- 页面树出现明显性能问题（列表 > 1000 项、频繁输入导致全树重绘）；
- 需要跨标签页同步或撤销/重做；
- 状态机复杂度超出单个 reducer 可读范围。

# 编码规范

## 通用

- TypeScript **strict**；禁止 `any`；不确定的外部数据用 `unknown` + 守卫。
- 2 空格缩进、单引号、尾随逗号、行宽 100（Prettier）。
- 提交前运行 `npm run check`（typecheck + lint + test + build）。
- 依赖保持最小：新增运行时依赖需说明体积/维护成本，并在 ADR 记录。
- UI 文案使用简体中文；代码标识符、注释可用英文。

## 导入

- 源码内使用 `@/` 别名（`@/domain/...`、`@/components/...`）。
- 类型导入使用 `import type`（ESLint 强制）。
- 不建立 barrel `index.ts`；直接从具体文件导入，避免循环依赖。
- 依赖方向：`features → app/components → state → domain`；`services` 可被 app/features 使用，但不得 import features。

## 命名

| 对象        | 规则                            | 示例                               |
| ----------- | ------------------------------- | ---------------------------------- |
| 组件/页面   | PascalCase，页面以 `Page` 结尾  | `SchedulePage`                     |
| Hook        | `useXxx`                        | `useApp`, `useToast`               |
| 领域函数    | camelCase，动词开头             | `isValidCourse`, `eligibleMatches` |
| action type | `域/动作`                       | `courses/add`, `friends/block`     |
| 存储键      | kebab/冒号命名，带版本          | `campus-life-demo:v2`              |
| CSS class   | BEM 风格，功能前缀              | `.post-card__head`                 |
| 文件        | 组件 PascalCase，工具 camelCase | `CourseDialog.tsx`, `storage.ts`   |

## React

- 函数组件 + hooks；不写 class 组件。
- 组件保持纯渲染；副作用放事件处理器或 `useEffect`。
- **不要在 render 中调用** `Date.now()`、`Math.random()`、`crypto.randomUUID()`。默认值用 `useState(() => ...)` 延迟初始化；ID 在提交处理器生成。
- 列表 key 使用稳定业务 ID，不用数组下标（静态占位网格除外）。
- Context value 不强行 `useMemo`；除非测量到重渲染问题。
- 组件文件只导出组件（Fast Refresh）；context/hook 放独立文件。

## 状态与数据

- 读取：`const { state, dispatch } = useApp()`。
- 写入：`dispatch({ type: '...' })`；不直接修改 `state`。
- 业务校验在 dispatch 前完成，错误用 `role="alert"` 或 Toast 展示。
- 派生数据在 render 中调用纯函数；重计算明显时再用 `useMemo`。
- 不在组件中访问 `localStorage`；使用 Provider 暴露的动作。

## 错误处理

- 可预期失败（校验、存储配额、媒体不可用）返回结果对象或展示中文提示，不抛到用户界面。
- 不可恢复的编程错误（Provider 外使用 hook、缺少 `#root`）直接抛错。
- `catch` 不吞掉原因；至少转换为用户可读消息。
- 不使用空 `catch {}`；若确实忽略，写明注释原因。

## 可访问性

- 图标按钮必须有 `aria-label`。
- 开关使用 `role="switch"` + `aria-checked`；切换按钮用 `aria-pressed`。
- Dialog 必须有标题、`role="dialog"`、`aria-modal`，支持 Escape 与遮罩关闭。
- 表单控件必须有关联 label；hint 不放进 label 的可访问名称。
- 保留键盘焦点样式，不设置 `outline: none`。

## 样式

- 只使用 `tokens.css` 的变量；不新增散落色值。
- 新样式放对应功能文件；组件删除时同步删样式。
- 响应式断点遵循 `styles.md`；移动端优先保证不横向溢出。

## 禁止

- `dangerouslySetInnerHTML`。
- 密码字段、真实网络请求、伪造地图坐标。
- 为“以后可能用到”新增抽象、配置项或依赖。
- 在 reducer 内产生副作用。

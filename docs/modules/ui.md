# `src/components/` 通用 UI 接口

通用组件不包含业务状态；需要数据时通过 props 传入。业务页面在 `src/features/`。

## `layout/AppShell.tsx`

```tsx
<AppShell /> // 渲染侧边栏、顶栏、移动导航与 <Outlet />
```

职责：

- 主导航（`NAV_ITEMS`）与激活态；
- 顶栏标题（按路径推导，详情页优先匹配）；
- 提醒按钮：聚合待处理好友申请与邀约，打开 `Dialog`；
- 用户区：头像、昵称、账号类型、退出登录；
- 演示说明横幅（本地可关闭）；
- 内容区 `<Outlet />` 与移动端底部导航。

依赖：`useApp()`、`NavLink`/`Outlet`/`useLocation`。

## `ui/Button.tsx`

```tsx
<Button variant?="primary|secondary|ghost|danger|soft" size?="sm|md"
        icon?={ReactNode} type?="button" ...buttonProps />
```

默认 `type="button"`，避免在表单里意外提交。表单提交按钮显式传 `type="submit"`。

## `ui/Dialog.tsx`

```tsx
<Dialog title="..." onClose={...} wide?>{children}</Dialog>
```

- 通过 `createPortal` 渲染到 `document.body`；
- `role="dialog"` + `aria-modal="true"`，标题用 `aria-labelledby`；
- 点击遮罩或按 Escape 关闭；打开时锁定 body 滚动并聚焦第一个可交互元素；
- 关闭回调通过 ref 同步，避免 effect 重跑。

业务表单把 `<form>` 放在 children 内，提交按钮放在表单底部，保证 Enter 可提交。

## `ui/FormFields.tsx`

`TextField`、`SelectField`、`TextAreaField`：

- 统一 `label` + `id` + `name` + `hint`；
- hint 位于 `<label>` 之外，保证可访问名称只包含标签文本；
- 透传原生属性（`defaultValue`、`required`、`type` 等）。

## `ui/PageHeader.tsx`

| 导出         | 用途                                |
| ------------ | ----------------------------------- |
| `PageHeader` | eyebrow/title/description/actions。 |
| `EmptyState` | 图标、标题、描述、可选操作。        |
| `Tag`        | 只读标签。                          |
| `Stat`       | 指标卡（label/value/hint）。        |

## `ui/Avatar.tsx`

```tsx
<Avatar name="林同学" size?="sm|md|lg" decorative? />
```

取名字首个字符，按码点选择配色；`decorative` 时加 `aria-hidden`。

## `ui/Icon.tsx`

`<Icon name={IconName} size? />`，内联 SVG，`stroke="currentColor"`。新增图标需扩展 `IconName` 与 `paths` 映射。

## `ui/toast/`

- `ToastProvider`：最多保留 3 条，3.2 秒自动消失；`aria-live="polite"`。
- `useToast()`：`show(message, tone?: 'info'|'success'|'error')`。
- 独立 context 文件避免 React Fast Refresh 的“组件/非组件混合导出”问题。

## 约定

- 不在通用组件里 import `useApp` 或业务 domain 函数。
- 所有交互元素必须有可访问名称；纯图标按钮使用 `aria-label`。
- 颜色/间距只使用 `src/styles/tokens.css` 的变量或既有 class，不写行内样式（图片缩放变换除外）。
- 新增通用组件前先检查 `features/` 是否已有局部实现；出现第二个调用点再提升。

# `src/styles/` 样式架构

## 文件分层

| 文件             | 内容                                                                        |
| ---------------- | --------------------------------------------------------------------------- |
| `tokens.css`     | 设计令牌：颜色、圆角、阴影、字体、侧边栏宽度。                              |
| `base.css`       | reset、排版、按钮、表单、Dialog、Toast、Tag、Avatar、通用面板/统计/空状态。 |
| `layout.css`     | 应用 Shell、侧边栏、顶栏、内容区、移动导航、认证页。                        |
| `components.css` | 跨功能组合：隐私选择卡、设置行、资料摘要、图片缩放。                        |
| `features.css`   | 首页、课表、待办/安排。                                                     |
| `social.css`     | 好友列表、申请、邀约。                                                      |
| `chat.css`       | 聊天布局、消息气泡、表情选择、录音工具条。                                  |
| `matching.css`   | 匹配状态、卡片网格。                                                        |
| `forum.css`      | 论坛列表、帖子卡、详情、评论。                                              |
| `map.css`        | 校区工具栏、占位地图。                                                      |
| `settings.css`   | 设置页网格。                                                                |

`src/main.tsx` 按上述顺序 import；功能样式依赖 `base.css` 的令牌与通用类。

## 命名

- 采用语义化 BEM 风格：`.post-card__head`、`.friend-card__actions`、`.week-day.is-today`。
- 状态类统一 `is-active` / `is-on` / `is-done` / `is-danger`。
- 功能前缀：`course-`、`task-`、`friend-`、`chat-`、`match-`、`post-`、`map-`、`settings-`。
- 颜色不写死在组件：用 `var(--brand)`、`var(--muted)`、`var(--danger)` 等。
- 课程颜色通过局部变量：`.course-card--blue { --course: ...; --course-bg: ...; }`，组件只使用 `var(--course)`。

## 布局

- Shell：`grid-template-columns: var(--sidebar-width) minmax(0, 1fr)`。
- 主内容最大宽度 1320px，`padding: 26px 32px 70px`。
- 页面纵向节奏由 `.page { gap: 18px }` 统一。
- 响应式断点：`1180px`（首页列数）、`1024px`（认证页）、`900px`（隐藏侧边栏、单列）、`680px`（卡片单列、表单单列）、`560/520px`（移动细节）。
- 移动端底部导航固定，内容区额外 `padding-bottom: 92px`。

## 可访问性

- 保留 `:focus-visible` 轮廓，不移除。
- 交互元素最小高度约 32–40px；移动端点击区域不小于 32px。
- `prefers-reduced-motion` 下缩短动画（如后续添加，必须遵守）。
- 图片缩放只改变 `transform`，不改变布局尺寸。

## 修改规则

- 新增样式放入对应功能文件，不创建“杂物”文件。
- 需要新颜色/圆角/阴影时先扩展 `tokens.css`。
- 删除组件时同步删除其样式；避免孤儿 class。
- 不引入 CSS-in-JS、Tailwind 或第二个设计系统。

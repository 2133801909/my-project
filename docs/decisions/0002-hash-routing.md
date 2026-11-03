# ADR 0002：使用 Hash 路由与静态托管

- 状态：已接受
- 日期：2026-11-03

## 背景

应用是纯静态演示，需要部署到 GitHub Pages、对象存储或任意静态服务器。History 路由要求服务器把所有未知路径重写到 `index.html`，否则刷新详情页会 404。

## 决策

使用 `HashRouter`，URL 形如：

```text
https://example.com/tongpin/#/schedule
https://example.com/tongpin/#/forum/p1
```

## 后果

正面：

- 任意静态托管均可直接刷新；
- 不需要 rewrite 配置；
- 详情页刷新仍能定位。

负面：

- URL 含 `#`，不如 History 路由美观；
- 不利于 SEO（本项目不需要）；
- 未来若接入服务端渲染需迁移。

## 备选方案

- `BrowserRouter` + 服务器 rewrite：部署复杂度高，演示分发不需要。
- 内存路由：刷新丢失页面，已否决。

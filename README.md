# 同频 · 校园生活助手

面向大学生的校园生活助手**本地演示**。React + TypeScript + Vite 构建，数据只保存在当前浏览器。

## 功能

- 演示账号登录/注册/访客进入（仅昵称，不收集密码）
- 首页概览、课表周/日视图、单双周、课程增删改
- 待办作业、个人安排、完成状态与本地提醒开关
- 好友申请、邀约、拉黑；本地聊天（文字/表情/图片/语音）
- 主动开启的同系匹配与兴趣筛选
- 校园论坛/项目分享、评论、点赞、撤回
- 校区名称选择与明确标注的占位地图
- JSON 数据导出与本地重置

## 快速开始

需要 Node.js ≥ 20.19。

```sh
npm install
npm run dev
```

打开终端输出的地址（默认 <http://localhost:5173>）。

生产构建：

```sh
npm run build
npm run preview
```

> 录音功能需要 HTTPS 或 `localhost`。直接以 `file://` 打开构建产物不保证可用；请使用预览服务器或静态托管。

## 脚本

| 命令                | 作用                |
| ------------------- | ------------------- |
| `npm run dev`       | 开发服务器          |
| `npm run build`     | 类型检查 + 生产构建 |
| `npm run preview`   | 预览构建产物        |
| `npm test`          | Vitest 测试         |
| `npm run typecheck` | TypeScript 检查     |
| `npm run lint`      | ESLint              |
| `npm run format`    | Prettier 格式化     |
| `npm run check`     | 全量校验            |

## 目录

```text
src/domain/     纯类型与业务规则
src/state/      种子数据与 reducer
src/services/   存储、会话、媒体
src/app/        Provider、路由、鉴权
src/components/ 布局与通用 UI
src/features/   业务页面
src/styles/     设计令牌与样式
tests/          单元与组件测试
docs/           架构、模块接口、ADR、规范
```

## 文档

- 文档索引：[`docs/README.md`](docs/README.md)
- AI/贡献者指南：[`AGENTS.md`](AGENTS.md)

## 演示边界

- 修改仅保存在当前浏览器 `localStorage`，不同步到其他设备。
- 好友、匹配、邀请、论坛、提醒和举报均为本地模拟，不联系真实用户，不发送后台通知。
- 登录/注册仅按昵称保存不同演示资料；不验证身份、密码或学校账号，不保存密码。
- 地图仅展示校区名称，未接入建筑坐标、室内信息或导航。
- 没有杭州电子科技大学官方背书。

## 来源

- 学校简介：<https://www.hdu.edu.cn/659/list.htm>
- 学校官网：<https://www.hdu.edu.cn/>

## 许可

演示原型，未声明开源许可。

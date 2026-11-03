# 如何新增一个功能

以下流程以“课程备注”为例，展示从领域到文档的完整改动面。

## 0. 先判断归属

- 只是展示变化？改 `features/`。
- 有业务规则/校验？加 `domain/`。
- 要持久化？加 `state/` + `types.ts` + 迁移。
- 需要浏览器能力？加 `services/`。
- 通用交互？先看 `components/` 是否已有。

## 1. 领域层

```ts
// src/domain/schedule.ts
export function isValidCourseNote(note: string): boolean {
  return note.length <= 200;
}
```

加单测到 `tests/unit/domain.test.ts`。纯函数不 import React。

## 2. 类型与种子

- 在 `src/domain/types.ts` 给 `Course` 加 `note?: string`。
- 在 `src/state/seed.ts` 的示例课程中补默认值（如需要）。
- 在 `src/services/storage.ts` 的 `normalizeState()` 中确保旧数据兼容（可选字段可不用处理，但要在文档说明）。

## 3. reducer

```ts
| { type: 'courses/update-note'; id: string; note: string }
```

在 `appReducer` 中返回新数组/新对象，不修改原 state。加 reducer 测试，断言原 state 未被修改。

## 4. UI

- 在 `src/features/schedule/CourseDialog.tsx` 增加字段。
- 提交时校验，失败显示 `role="alert"`。
- dispatch 新 action。
- 若新增页面，注册 `ROUTES` 与 `App.tsx`；需要导航再改 `NAV_ITEMS`。

## 5. 样式

在 `src/styles/features.css` 增加类，复用 tokens。不要写行内色值。

## 6. 测试

- 领域：边界值（空、超长、非法）。
- reducer：不可变性。
- 组件：用户可见行为（填写、提交、错误提示）。
- 浏览器冒烟：实际打开页面走一遍。

## 7. 文档

- `docs/modules/domain.md`：新函数签名。
- `docs/modules/state.md`：新 action。
- `docs/modules/features.md`：新交互。
- `docs/architecture/state-model.md`：字段变化。
- 若改变存储/技术选型：新增 ADR，不改历史 ADR。

## 完成检查清单

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] 浏览器冒烟（含移动端）
- [ ] 文档已更新
- [ ] 无新增死代码/未使用导出
- [ ] 演示边界未被悄然突破

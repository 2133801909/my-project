# `src/services/` 模块接口

服务层封装浏览器副作用，使页面与 reducer 保持可测试。

## `storage.ts`

### `KeyValueStorage`

```ts
interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
```

`localStorage`、`sessionStorage` 与测试内存实现都满足该接口。

### `AppRepository`

```ts
new AppRepository(storage: KeyValueStorage, now?: () => Date)

load(session: DemoSession): AppState
loadAccount(name: string, seed?: AppState): AppState
accountExists(name: string): boolean
save(state: AppState, session: DemoSession): PersistenceResult
```

- `load`：account 会话读账号快照；否则读全局键，并回退旧版 `campus-life-demo-v1`。
- `save`：总是写全局键；account 会话额外写 `campus-life-demo-account:<name>`。返回 `{ ok, reason?: 'quota'|'unavailable' }`，**不抛异常**。
- `normalizeState(raw, seed?)`：把不可信 JSON 合并到种子；数组字段类型错误时回退，`mapCampus` 白名单校验，`weekCalendar.start` 校验字符串。

### `SessionRepository`

```ts
new SessionRepository(storage: KeyValueStorage | null)

load(): DemoSession
save(session: DemoSession): void
```

- 读取 `campus-life-demo-session-v2`（JSON），回退旧版纯字符串（`guest` 或昵称）。
- `save(null)` 清除新旧会话键。
- 存储不可用时静默降级，会话只存在内存。

### 工厂

| 函数                            | 说明                                         |
| ------------------------------- | -------------------------------------------- |
| `createBrowserStorage()`        | 安全获取 `localStorage`；不可用返回 `null`。 |
| `createBrowserSessionStorage()` | 安全获取 `sessionStorage`。                  |
| `createMemoryStorage(initial?)` | 测试/降级用内存实现。                        |

## `media.ts`

| 导出                       | 签名                                                    | 说明                                                          |
| -------------------------- | ------------------------------------------------------- | ------------------------------------------------------------- |
| `formatDuration`           | `(seconds) => "m:ss"`                                   | 语音时长展示。                                                |
| `canRecordAudio`           | `() => boolean`                                         | 检测 `navigator.mediaDevices` + `MediaRecorder`。             |
| `readFileAsDataUrl`        | `(file: Blob) => Promise<string>`                       | FileReader 封装，使用 `Promise.withResolvers`。               |
| `compressImage`            | `(file, maxSide=1280, quality=0.72) => Promise<string>` | 通过 canvas 缩放并转 JPEG；失败时抛错。                       |
| `startMicrophoneRecording` | `(onStop, maxSeconds=20) => Promise<RecorderHandle>`    | 请求麦克风、录音、20 秒自动停止；停止后回调 data URL 与时长。 |

约束：

- 麦克风需要 HTTPS 或 `localhost`；在 `file://` 下预期失败，页面展示可读提示。
- 图片发送前先由页面检查 `isAllowedImageSize(file.size)`，压缩后再由领域层校验 data URL 长度。
- 录音结束必须释放 `MediaStream` 轨道；组件卸载时调用 `handle.stop()`。

## `guards.ts`

`isRecord(value)`：持久化/表单解析的共享对象守卫。**不要在调用点重复定义**；需要新的运行时守卫时，加到本文件或相邻的领域模块。

## 测试约定

- 存储测试使用 `createMemoryStorage()`，不要 mock 全局 `localStorage`。
- 配额失败通过让 `setItem` 抛 `DOMException('...', 'QuotaExceededError')` 模拟。
- 媒体测试聚焦纯工具（`formatDuration`、限制常量）；涉及 `MediaRecorder`/canvas 的路径走浏览器冒烟。

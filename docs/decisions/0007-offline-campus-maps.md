# ADR 0007：静态离线校园地图

- 状态：已接受
- 日期：2026-11-20

## 背景与决策

经用户同意，地图页从仅展示校区名称改为展示本地静态地图。地图由 OpenStreetMap 开放数据生成，不下载或使用 OpenStreetMap 公共瓦片服务的离线瓦片。应用运行时不请求地图服务。

地图数据 © [OpenStreetMap 贡献者](https://www.openstreetmap.org/copyright)，按 [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/) 提供。地图并非校方提供，内容可能不完整或过时；不支持地点搜索、室内信息和导航，不得虚构位置。

## 数据来源

2026-11-20 从 OpenStreetMap API 下载以下范围的原始地图数据，用道路、建筑、绿地和水域几何生成 `src/assets/maps/` 下的静态 SVG；名称来自数据本身。原始数据及后续更新可从以下链接获取：

- [下沙](https://api.openstreetmap.org/api/0.6/map?bbox=120.333,30.3118,120.345,30.3216)
- [文一](https://api.openstreetmap.org/api/0.6/map?bbox=120.132,30.2875,120.138,30.2915)
- [东岳](https://api.openstreetmap.org/api/0.6/map?bbox=120.0785,30.248,120.0825,30.2535)
- [绍兴](https://api.openstreetmap.org/api/0.6/map?bbox=120.656,29.998,120.663,30.0055)
- [青山湖](https://api.openstreetmap.org/api/0.6/map?bbox=119.815,30.289,119.826,30.299)

## 后果

- 地图随应用发布，可离线显示，但不会自动更新；开放数据覆盖度因校区而异。
- 地图页面必须显示署名、许可与数据局限；不可暗示校方背书。

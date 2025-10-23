% Week 5 Setup Guide - Map Integration (AMap)

# 快速说明

Week 5 重点是将地图（高德地图 AMap）集成到产品中，用于显示行程中的地点、绘制路线、以及地点检索与地理编码。
本指南描述从获取 API Key、配置环境变量、到在本地启动并验证地图功能的具体步骤。

---

## 1. 获取高德地图（AMap）API Key

1. 访问高德开放平台并注册/登录：https://console.amap.com/
2. 创建应用并获取 Web API Key（JS API）与可选的服务端 Secret（如果后端需要签名）。
3. 记录 Key 值（形如：abcd1234...），不要在公开仓库中提交该密钥。

---

## 2. 配置环境变量

在 `frontend/` 目录下创建或编辑 `.env`（或 `.env.local`），加入以下变量：

```powershell
# 高德地图 JS API Key
VITE_AMAP_KEY=your_amap_api_key_here
# 可选：服务端 Secret（如需要）
VITE_AMAP_SECRET=your_amap_secret_here
```

注意：`frontend/.env.example` 已包含示例变量。项目已将 `.env` 加入 `.gitignore`，请不要提交真实密钥。

---

## 3. 代码位置与主要功能

- 前端地图组件：`frontend/src/components/map/MapView.tsx`（渲染地图、添加标记、信息窗、绘制路线）
- 地图服务：`frontend/src/services/map/amap.ts`（封装 `loadAmapScript`、`geocodeAddress`、`reverseGeocode`、`planDrivingRoute`、`searchNearby` 等工具函数）
- Plan 详情页集成：`frontend/src/pages/TravelPlanner/PlanDetail.tsx`（通过 Tab 切换显示地图并将 itinerary 转换为地图位置）

主要能力：

- 动态加载高德 JS SDK
- 在地图上渲染活动、住处、餐饮等多类型 Marker
- 点击 Marker 显示信息窗口
- 绘制折线显示行程路线（showRoutes=true）
- 地址正/逆地理编码（geocode / reverseGeocode）
- 驾车路线规划（Driving）与结果解析
- 搜索附近 POI（PlaceSearch）

---

## 4. 在本地运行与验证

1. 安装依赖并启动前端开发服务器（在 `frontend` 目录下）

```powershell
cd frontend
npm install
npm run dev
```

2. 确保浏览器可以访问开发地址（默认 Vite: http://localhost:5173）

3. 登录并打开某个已有计划的详情页：`/plans/:id`，切换到 "地图" 标签页。

4. 验证项：
- 地图是否加载（有缩放控件与高德底图）
- 标记是否显示（活动、住宿等）
- 点击标记是否弹出信息窗口并显示内容
- 若数据包含多个位置，切换 `showRoutes=true` 是否绘制路线

---

## 5. 常见问题与排查

- 错误："请在设置中配置高德地图API密钥"
  - 确认 `VITE_AMAP_KEY` 已在 `frontend/.env` 中设置，并重启 dev server
- 错误：地图 SDK 加载失败 / 控制台提示 403
  - 检查 Key 是否正确、是否绑定了域名（若控制台设置了域名限制）
- 错误：Driving / PlaceSearch 无结果
  - 检查是否正确加载了插件（amap.ts 已在 script 中请求 plugin=AMap.Driving,AMap.Geocoder,AMap.PlaceSearch）
- 标注位置错位
  - 确认传入的坐标为经度 (lng) 在前、纬度 (lat) 在后，并且数值正确

---

## 6. 测试建议

- 创建包含经纬度字段的测试 itinerary（或使用已有计划），确认 PlanDetail 能将其转换为地图位置
- 本地模拟搜索：在控制台调用 `geocodeAddress('北京市天安门')` 来验证地理编码
- 若需大量 POI 检索，请考虑后端代理以隐藏 Secret，并增加请求限流/缓存

---

## 7. 下一步（可选改进）

- 在设置页提供 API Key 管理界面（仅当前用户可见）
- 将高德服务端 Secret 放到后端并通过后端签名请求以提升安全性
- 优化地图渲染性能：只在可见区域加载 POI、延迟加载图片资源
- 添加轨迹播放/导航预览功能

---

如果需要，我可以把常用的调试脚本或测试数据生成脚本也加入到 `frontend/scripts` 中，便于重复验证。

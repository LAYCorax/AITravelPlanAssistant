# AI旅行规划助手 - 技术选型文档

## 📋 文档信息
- **项目名称**: AI Travel Planner (AI旅行规划助手)
- **文档版本**: v1.0
- **制定日期**: 2025年10月22日
- **负责人**: 开发团队
- **最后更新**: 2025年10月22日

---

## 🎯 技术选型概览

| 技术领域 | 选型方案 | 版本 | 说明 |
|---------|---------|------|------|
| **前端框架** | React | 18.x | 现代化UI框架 |
| **后端服务** | Supabase | - | BaaS平台（数据库+认证） |
| **大语言模型** | 阿里云百炼平台 | - | 行程规划和预算分析 |
| **语音识别** | 科大讯飞 | - | 录音文件转写API |
| **地图服务** | 高德地图 | Web API v2.0 | 地图展示和导航 |

---

## 1. 前端技术栈

### 1.1 核心框架：React 18.x

#### 选型理由
- ✅ **生态成熟**: 拥有丰富的组件库和工具链
- ✅ **性能优秀**: 虚拟DOM、并发特性
- ✅ **社区活跃**: 大量学习资源和第三方库
- ✅ **易于维护**: 组件化开发，代码结构清晰
- ✅ **就业市场**: React技能需求量大

#### 技术栈组合
```
React 18.x + TypeScript + Vite
```

### 1.2 构建工具：Vite

#### 选型理由
- ⚡ **极速启动**: 基于ES模块的开发服务器
- ⚡ **热更新快**: 毫秒级HMR
- ⚡ **构建优化**: 基于Rollup的生产构建
- ⚡ **开箱即用**: 内置TypeScript支持

#### 配置
```json
{
  "framework": "React",
  "template": "react-ts",
  "plugins": ["@vitejs/plugin-react"]
}
```

### 1.3 编程语言：TypeScript

#### 选型理由
- 🔒 **类型安全**: 编译时错误检查
- 📝 **代码提示**: 更好的IDE支持
- 🛠️ **易于重构**: 类型系统支持
- 📚 **代码文档**: 类型即文档

### 1.4 UI组件库：Ant Design + Tailwind CSS

#### Ant Design
- **版本**: 5.x
- **用途**: 复杂组件（表单、表格、Modal等）
- **优势**: 企业级UI设计、组件丰富

#### Tailwind CSS
- **版本**: 3.x
- **用途**: 快速样式开发、自定义设计
- **优势**: 原子化CSS、高度可定制

### 1.5 状态管理：Zustand

#### 选型理由
- 🎯 **简单易用**: API简洁，学习成本低
- 📦 **轻量级**: 体积小（<1KB）
- ⚡ **性能好**: 基于hooks，按需渲染
- 🔧 **灵活**: 不需要Provider包裹

#### 替代方案
- Context API（简单场景）
- Redux Toolkit（复杂场景）

### 1.6 路由管理：React Router

- **版本**: 6.x
- **功能**: 声明式路由、懒加载、路由守卫

### 1.7 HTTP请求：Axios

- **版本**: 1.x
- **功能**: 请求拦截、响应处理、错误处理

### 1.8 其他前端库

| 库名称 | 用途 | 版本 |
|--------|------|------|
| `react-map-gl` | 高德地图React封装 | 7.x |
| `recharts` | 图表可视化 | 2.x |
| `date-fns` | 日期处理 | 2.x |
| `react-dropzone` | 文件上传 | 14.x |
| `framer-motion` | 动画效果 | 10.x |
| `react-hook-form` | 表单管理 | 7.x |
| `zod` | 表单验证 | 3.x |

---

## 2. 后端服务：Supabase

### 2.1 服务概览

Supabase是一个开源的Firebase替代品，提供：
- 🗄️ PostgreSQL数据库
- 🔐 用户认证
- 📦 文件存储
- ⚡ 实时订阅
- 🔧 RESTful API
- 🛠️ 管理后台

### 2.2 选型理由

#### 优势
- ✅ **免费额度充足**: 
  - 500MB数据库存储
  - 1GB文件存储
  - 50,000次认证用户
  - 每月2GB带宽
  
- ✅ **功能完整**: 数据库、认证、存储一体化
- ✅ **开发效率高**: 自动生成API，无需编写后端代码
- ✅ **实时能力**: 支持数据库实时订阅
- ✅ **PostgreSQL**: 强大的关系型数据库
- ✅ **开源**: 可自托管
- ✅ **文档完善**: 详细的文档和示例

#### 使用场景
- 用户注册/登录/认证
- 旅行计划数据存储
- 费用记录管理
- 用户偏好设置
- API密钥加密存储

### 2.3 数据库设计

使用PostgreSQL数据库，表结构参考PRD文档：
- `users` - 用户表
- `travel_plans` - 旅行计划表
- `itinerary_details` - 行程详情表
- `expenses` - 费用记录表
- `user_preferences` - 用户偏好表
- `api_configs` - API配置表

### 2.4 认证方案

```typescript
// 邮箱密码认证
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// 第三方登录（可选）
- Google OAuth
- GitHub OAuth
```

### 2.5 安全配置

- Row Level Security (RLS) 行级安全策略
- API密钥管理
- HTTPS加密传输

---

## 3. 大语言模型：阿里云百炼平台

### 3.1 服务概览

阿里云百炼平台提供多种大语言模型API服务，包括通义千问系列模型。

**官方网站**: https://www.aliyun.com/product/bailian

### 3.2 选型理由

#### 优势
- ✅ **国内服务**: 网络延迟低，访问稳定
- ✅ **价格优势**: 相比国外模型更经济
- ✅ **合规性**: 符合国内数据安全要求
- ✅ **中文能力强**: 对中文旅游内容理解更好
- ✅ **免费额度**: 新用户有免费试用额度
- ✅ **API稳定**: 阿里云基础设施可靠

#### 使用限制
⚠️ **使用上限**: 
- 免费额度有调用次数限制
- 需要注意QPS（每秒请求数）限制
- 建议实施缓存策略

### 3.3 推荐模型

| 模型名称 | 适用场景 | 特点 |
|---------|---------|------|
| **通义千问-Turbo** | 行程规划 | 速度快，成本低 |
| **通义千问-Plus** | 复杂规划 | 能力强，质量高 |
| **通义千问-Max** | 高质量输出 | 最强能力 |

**推荐策略**: 优先使用Turbo模型，复杂场景使用Plus

### 3.4 应用场景

#### 场景1: 行程规划生成
```typescript
// 输入：用户需求
const prompt = `
请根据以下信息生成详细的旅行计划：
- 目的地: ${destination}
- 天数: ${days}
- 预算: ${budget}
- 偏好: ${preferences}
...
`;

// 输出：JSON格式的行程数据
```

#### 场景2: 预算分析
```typescript
// 基于目的地和需求，分析预算分配
const budgetAnalysis = await callLLM({
  prompt: "分析去日本5天的预算分配...",
  model: "qwen-turbo"
});
```

#### 场景3: 行程优化建议
```typescript
// 优化现有行程，提供改进建议
const optimization = await callLLM({
  prompt: "优化以下行程安排...",
  model: "qwen-plus"
});
```

### 3.5 成本控制策略

1. **请求缓存**: 相似请求使用缓存结果
2. **Prompt优化**: 减少token使用量
3. **结果复用**: 保存常见目的地的模板
4. **用户限制**: 每日请求次数限制
5. **监控告警**: 设置费用告警阈值

### 3.6 API配置

```typescript
// 配置示例
const config = {
  apiKey: process.env.BAILIAN_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/api/v1',
  model: 'qwen-turbo',
  maxTokens: 2000,
  temperature: 0.7
}
```

---

## 4. 语音识别：科大讯飞录音文件转写API

### 4.1 服务概览

科大讯飞提供专业的语音识别服务，包括实时语音转写和录音文件转写。

**官方网站**: https://www.xfyun.cn/

### 4.2 选型：录音文件转写API

**产品名称**: 语音听写（录音文件转写）

#### 选型理由
- ✅ **准确率高**: 国内领先的语音识别技术
- ✅ **中文支持好**: 对中文方言、口音支持好
- ✅ **免费额度**: 每日有免费调用量
- ✅ **API简单**: 接入方便
- ✅ **支持多格式**: 支持多种音频格式

#### 使用限制
⚠️ **使用上限**:
- 免费版：每日500次调用
- 音频时长限制：单次最长5小时
- 需要注意并发限制

### 4.3 技术方案

#### 工作流程
```
1. 前端录音 (MediaRecorder API)
   ↓
2. 生成音频文件 (WAV/MP3)
   ↓
3. 上传到后端/Supabase Storage
   ↓
4. 调用科大讯飞API转写
   ↓
5. 返回文字结果到前端
```

#### 支持格式
- WAV (推荐)
- MP3
- PCM
- 采样率: 16000Hz (推荐)

### 4.4 API集成

```typescript
// 录音文件转写API调用示例
const transcribeAudio = async (audioFile: File) => {
  // 1. 上传文件到Supabase Storage
  const { data: uploadData } = await supabase.storage
    .from('audio-files')
    .upload(`${userId}/${Date.now()}.wav`, audioFile);
  
  // 2. 获取文件URL
  const audioUrl = uploadData.publicUrl;
  
  // 3. 调用科大讯飞API
  const result = await axios.post('/api/speech/transcribe', {
    audioUrl,
    language: 'zh_cn'
  });
  
  return result.data.text;
}
```

### 4.5 前端录音实现

```typescript
// 使用 MediaRecorder API
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ 
    audio: true 
  });
  const mediaRecorder = new MediaRecorder(stream);
  
  mediaRecorder.ondataavailable = (e) => {
    audioChunks.push(e.data);
  };
  
  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const text = await transcribeAudio(audioBlob);
    // 处理转写结果
  };
  
  mediaRecorder.start();
}
```

### 4.6 成本控制策略

1. **录音时长限制**: 建议单次录音≤60秒
2. **本地降噪**: 提高识别准确率，减少重试
3. **缓存策略**: 相同音频不重复调用
4. **用户提示**: 提示用户清晰表达
5. **降级方案**: 提供文字输入备选

### 4.7 备选方案

- **Web Speech API**: 浏览器原生，免费但兼容性有限
- **阿里云语音识别**: 备用方案

---

## 5. 地图服务：高德地图API

### 5.1 服务概览

高德地图是国内领先的地图服务提供商，提供Web端地图API。

**官方网站**: https://lbs.amap.com/

### 5.2 选型理由

#### 优势
- ✅ **国内数据准确**: POI数据丰富，国内地点精确
- ✅ **免费额度充足**: 
  - 个人开发者：每天30万次配额
  - Web端API免费
  
- ✅ **功能丰富**: 地图展示、路径规划、地点搜索
- ✅ **文档完善**: 中文文档，示例丰富
- ✅ **性能好**: 加载快，体验流畅
- ✅ **导航支持**: 支持跳转到高德地图APP

#### 使用限制
⚠️ **使用上限**:
- 个人开发者：30万次/天
- 需要申请API Key
- 需要验证域名（生产环境）

### 5.3 使用的API服务

| API服务 | 用途 | 版本 |
|---------|------|------|
| **JS API** | 地图展示、标注 | 2.0 |
| **Web服务API** | 地点搜索、路径规划 | v3 |
| **Place API** | POI搜索 | v3 |
| **Direction API** | 路线规划 | v3 |

### 5.4 核心功能实现

#### 功能1: 地图展示
```typescript
// 使用 @amap/amap-jsapi-loader
import AMapLoader from '@amap/amap-jsapi-loader';

const initMap = async () => {
  const AMap = await AMapLoader.load({
    key: process.env.VITE_AMAP_KEY,
    version: '2.0',
    plugins: ['AMap.Marker', 'AMap.Polyline']
  });
  
  const map = new AMap.Map('map-container', {
    zoom: 11,
    center: [116.397428, 39.90923]
  });
}
```

#### 功能2: 景点标注
```typescript
// 添加标记
const addMarkers = (points: Array<{lng: number, lat: number}>) => {
  points.forEach((point, index) => {
    new AMap.Marker({
      position: [point.lng, point.lat],
      label: { content: `景点${index + 1}` },
      map: map
    });
  });
}
```

#### 功能3: 路线规划
```typescript
// 驾车路线规划
const planRoute = async (origin: [number, number], destination: [number, number]) => {
  const driving = new AMap.Driving({
    map: map,
    panel: "route-panel"
  });
  
  driving.search(origin, destination, (status, result) => {
    if (status === 'complete') {
      // 显示路线
      console.log('距离:', result.routes[0].distance);
      console.log('时间:', result.routes[0].time);
    }
  });
}
```

#### 功能4: POI搜索
```typescript
// 搜索周边餐厅
const searchNearby = async (keyword: string, center: [number, number]) => {
  const placeSearch = new AMap.PlaceSearch({
    type: keyword,
    city: '全国',
    pageSize: 10,
    pageIndex: 1
  });
  
  placeSearch.searchNearBy('', center, 1000, (status, result) => {
    if (status === 'complete') {
      // 处理搜索结果
      console.log(result.poiList.pois);
    }
  });
}
```

### 5.5 React集成方案

推荐使用封装库：
- `@amap/amap-react` (官方React组件)
- 或自行封装hooks

```typescript
// 自定义hook示例
const useAMap = () => {
  const [map, setMap] = useState<any>(null);
  
  useEffect(() => {
    AMapLoader.load({...}).then(AMap => {
      const mapInstance = new AMap.Map('container', {...});
      setMap(mapInstance);
    });
  }, []);
  
  return { map };
}
```

### 5.6 导航功能

```typescript
// 跳转到高德地图APP导航
const navigateToDestination = (lat: number, lng: number, name: string) => {
  const url = `https://uri.amap.com/navigation?` +
    `to=${lng},${lat},${name}&` +
    `mode=car&` +
    `coordinate=gaode&` +
    `callnative=1`;
  
  window.open(url, '_blank');
}
```

### 5.7 成本控制

1. **地图懒加载**: 需要时才加载
2. **缓存策略**: 缓存POI搜索结果
3. **请求合并**: 批量查询
4. **监控配额**: 监控每日使用量

### 5.8 备选方案

- **百度地图**: 备用方案
- **腾讯地图**: 备用方案

---

## 6. 其他技术选型

### 6.1 开发工具

| 工具 | 用途 |
|------|------|
| **VS Code** | 代码编辑器 |
| **Git** | 版本控制 |
| **GitHub** | 代码托管 |
| **Postman** | API测试 |
| **Chrome DevTools** | 前端调试 |

### 6.2 代码质量工具

| 工具 | 用途 |
|------|------|
| **ESLint** | 代码检查 |
| **Prettier** | 代码格式化 |
| **TypeScript** | 类型检查 |
| **Husky** | Git hooks |
| **lint-staged** | 提交前检查 |

### 6.3 测试工具（可选）

| 工具 | 用途 |
|------|------|
| **Vitest** | 单元测试 |
| **React Testing Library** | 组件测试 |
| **Playwright** | E2E测试 |

### 6.4 部署平台

推荐使用免费部署平台：
- **Vercel** (推荐): 自动部署，性能好
- **Netlify**: 备选方案
- **Cloudflare Pages**: 备选方案

---

## 7. 开发环境配置

### 7.1 环境变量配置

创建 `.env` 文件（不提交到Git）：

```bash
# Supabase配置
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 阿里云百炼API
VITE_BAILIAN_API_KEY=your_bailian_api_key

# 科大讯飞API
VITE_XFYUN_APP_ID=your_app_id
VITE_XFYUN_API_KEY=your_api_key
VITE_XFYUN_API_SECRET=your_api_secret

# 高德地图API
VITE_AMAP_KEY=your_amap_key
VITE_AMAP_SECRET=your_amap_secret
```

### 7.2 .gitignore配置

```gitignore
# 环境变量
.env
.env.local
.env.development
.env.production

# 依赖
node_modules/

# 构建输出
dist/
build/

# IDE
.vscode/
.idea/

# 日志
*.log
```

### 7.3 package.json依赖

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    "react-router-dom": "^6.20.0",
    "@amap/amap-jsapi-loader": "^1.0.1",
    "antd": "^5.11.0",
    "recharts": "^2.10.0",
    "date-fns": "^2.30.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0",
    "tailwindcss": "^3.3.0"
  }
}
```

---

## 8. API服务对比总结

### 8.1 费用对比

| 服务 | 免费额度 | 计费方式 | 成本评估 |
|------|---------|---------|---------|
| **阿里云百炼** | 新用户试用额度 | 按token计费 | ⚠️ 中等（需控制） |
| **科大讯飞** | 500次/天 | 按次数计费 | ✅ 低（够用） |
| **高德地图** | 30万次/天 | 超额按次计费 | ✅ 低（充足） |
| **Supabase** | 500MB数据库 | 超额按资源计费 | ✅ 低（够用） |

### 8.2 风险评估

| 服务 | 风险等级 | 风险描述 | 应对措施 |
|------|---------|---------|---------|
| **阿里云百炼** | 🟡 中 | 调用成本可能超支 | 实施缓存、限制请求 |
| **科大讯飞** | 🟢 低 | 500次/天可能不够 | 优化录音时长、文字输入降级 |
| **高德地图** | 🟢 低 | 30万次充足 | 正常使用即可 |
| **Supabase** | 🟢 低 | 免费额度够用 | 定期清理测试数据 |

---

## 9. 技术调研总结

### 9.1 优势
✅ 全部采用国内服务，访问稳定、延迟低  
✅ 都有免费额度，适合项目开发和小规模使用  
✅ 文档齐全，中文支持好，降低开发难度  
✅ React + Supabase组合成熟，开发效率高  

### 9.2 挑战
⚠️ 需要仔细管理API调用次数，避免超额  
⚠️ 需要实施良好的错误处理和降级方案  
⚠️ 阿里云百炼token消耗需要优化控制  

### 9.3 建议
1. **优先完成核心功能**: 先实现基本流程，再优化
2. **及早测试API**: 尽快申请并测试各个API
3. **监控使用量**: 设置监控和告警
4. **准备降级方案**: 每个服务准备备选方案
5. **用户限制**: 在应用层面做好请求频率限制

---

## 10. 下一步行动

### 10.1 立即执行
- [x] ✅ 确定技术选型
- [ ] 注册各服务平台账号
- [ ] 申请API Key
- [ ] 搭建开发环境
- [ ] 创建项目骨架

### 10.2 本周完成
- [ ] 完成React + Vite项目初始化
- [ ] 配置Supabase项目
- [ ] 测试各API的基本调用
- [ ] 搭建基础开发环境

---

## 📚 参考文档

- [React官方文档](https://react.dev/)
- [Vite官方文档](https://vitejs.dev/)
- [Supabase文档](https://supabase.com/docs)
- [阿里云百炼平台](https://www.aliyun.com/product/bailian)
- [科大讯飞开放平台](https://www.xfyun.cn/doc/)
- [高德地图开放平台](https://lbs.amap.com/api/javascript-api/summary)

---

**文档版本**: v1.0  
**最后更新**: 2025年10月22日  
**状态**: ✅ 已确认

---

## 附录：快速链接

### 服务注册链接
- [Supabase控制台](https://app.supabase.com/)
- [阿里云百炼](https://bailian.console.aliyun.com/)
- [科大讯飞控制台](https://console.xfyun.cn/)
- [高德开放平台](https://console.amap.com/)

### 获取API Key流程
1. **阿里云百炼**: 注册 → 创建应用 → 获取API Key
2. **科大讯飞**: 注册 → 创建应用 → 获取APPID、APIKey、APISecret
3. **高德地图**: 注册 → 创建应用 → 获取Key和Secret
4. **Supabase**: 注册 → 创建项目 → 获取URL和AnonKey

**重要提醒**: 所有API Key都不要提交到Git仓库！⚠️

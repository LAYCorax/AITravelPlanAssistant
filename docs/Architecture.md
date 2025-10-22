# AI Travel Planner - 前端架构设计

## 📐 整体架构

### 技术栈
- **框架**: React 18.x
- **构建工具**: Vite 5.x
- **语言**: TypeScript
- **状态管理**: React Context + useReducer
- **路由**: React Router v6
- **UI组件库**: Ant Design + Tailwind CSS
- **HTTP客户端**: Axios
- **后端服务**: Supabase

## 📁 目录结构

```
frontend/
├── public/                 # 静态资源
├── src/
│   ├── assets/            # 图片、字体等资源
│   ├── components/        # 可复用组件
│   │   ├── common/       # 通用组件 (Button, Input, Modal等)
│   │   ├── layout/       # 布局组件 (Header, Footer, Sidebar)
│   │   ├── travel/       # 旅行相关组件
│   │   ├── voice/        # 语音输入组件
│   │   ├── map/          # 地图组件
│   │   ├── expense/      # 费用管理组件
│   │   └── settings/     # 设置组件
│   ├── pages/            # 页面组件
│   │   ├── Auth/         # 登录/注册
│   │   ├── Home/         # 主页
│   │   ├── TravelPlanner/ # 行程规划
│   │   ├── MyPlans/      # 我的计划
│   │   └── Settings/     # 设置
│   ├── layouts/          # 布局容器
│   │   ├── MainLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── EmptyLayout.tsx
│   ├── store/            # 全局状态管理
│   │   ├── auth/         # 认证状态
│   │   ├── travel/       # 旅行计划状态
│   │   └── index.tsx     # 根Provider
│   ├── contexts/         # React Contexts
│   │   ├── ThemeContext.tsx
│   │   └── LanguageContext.tsx
│   ├── hooks/            # 自定义Hooks
│   │   ├── useAuth.ts
│   │   ├── useTravelPlan.ts
│   │   ├── useVoiceInput.ts
│   │   └── useMap.ts
│   ├── services/         # API服务
│   │   ├── api/          # RESTful API
│   │   ├── supabase/     # Supabase客户端
│   │   ├── llm/          # LLM集成
│   │   ├── voice/        # 语音服务
│   │   └── map/          # 地图服务
│   ├── types/            # TypeScript类型定义
│   │   ├── user.ts
│   │   ├── travel.ts
│   │   ├── expense.ts
│   │   └── api.ts
│   ├── utils/            # 工具函数
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── storage.ts
│   ├── constants/        # 常量配置
│   │   ├── routes.ts
│   │   ├── api.ts
│   │   └── config.ts
│   ├── App.tsx           # 根组件
│   ├── main.tsx          # 入口文件
│   └── vite-env.d.ts     # Vite类型声明
├── .env.example          # 环境变量模板
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎨 组件架构

### 组件层次
```
App (根组件)
├── Providers (状态管理)
│   ├── AuthProvider
│   ├── TravelProvider
│   └── ThemeProvider
├── Router
│   └── Layout
│       └── Page
│           └── Components
```

### 组件分类

#### 1. 页面组件 (Pages)
- **职责**: 路由对应的顶层容器
- **特点**: 
  - 管理页面级状态
  - 调用API服务
  - 组合多个组件
  - 处理路由逻辑

#### 2. 布局组件 (Layouts)
- **MainLayout**: 带导航栏和侧边栏的主布局
- **AuthLayout**: 认证页面布局（居中卡片）
- **EmptyLayout**: 空白布局（仅内容）

#### 3. 业务组件 (Feature Components)
- **特点**: 
  - 封装特定业务逻辑
  - 可在多个页面复用
  - 有自己的状态管理
  
**示例**:
- `TravelCard`: 旅行计划卡片
- `ItineraryTimeline`: 行程时间轴
- `VoiceRecorder`: 语音录制器
- `MapView`: 地图视图
- `ExpenseChart`: 费用图表

#### 4. 通用组件 (Common Components)
- **特点**:
  - 纯UI组件
  - 无业务逻辑
  - 高度可复用
  
**示例**:
- `Button`, `Input`, `Modal`, `Card`
- `Loading`, `Empty`, `ErrorBoundary`

## 🔄 状态管理

### 使用 Context + useReducer 模式

```typescript
// 状态管理结构
store/
├── auth/
│   ├── AuthContext.tsx      // Context定义和Provider
│   ├── authReducer.ts       // Reducer函数
│   ├── authActions.ts       // Action创建函数
│   └── types.ts             // 类型定义
├── travel/
│   ├── TravelContext.tsx
│   ├── travelReducer.ts
│   ├── travelActions.ts
│   └── types.ts
└── index.tsx                // 组合所有Provider
```

### 状态划分

#### 1. 认证状态 (AuthContext)
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

#### 2. 旅行计划状态 (TravelContext)
```typescript
interface TravelState {
  plans: TravelPlan[];
  currentPlan: TravelPlan | null;
  isLoading: boolean;
  error: string | null;
}
```

#### 3. UI状态 (ThemeContext)
```typescript
interface ThemeState {
  mode: 'light' | 'dark';
  language: 'zh' | 'en';
}
```

## 🛣️ 路由设计

### 路由结构
```typescript
const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/planner', element: <PlannerInput /> },
      { path: '/plans', element: <MyPlans /> },
      { path: '/plans/:id', element: <PlanDetails /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },
  { path: '*', element: <NotFound /> },
];
```

### 路由守卫
```typescript
// ProtectedRoute组件
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/auth/login" />;
}
```

## 🔌 API服务层

### 服务分层
```
Services Layer
├── Supabase Client      # 数据库操作
├── API Services         # 业务API封装
│   ├── authService      # 认证服务
│   ├── travelService    # 旅行计划服务
│   └── expenseService   # 费用服务
└── Third-party APIs     # 第三方API集成
    ├── llmService       # LLM服务
    ├── voiceService     # 语音识别
    └── mapService       # 地图服务
```

### API调用流程
```
Component → Custom Hook → Service → Supabase/API → Response
```

## 🎯 数据流

### 典型数据流程

1. **用户登录**
```
LoginPage → useAuth hook → authService.login() 
→ Supabase Auth → Update AuthContext → Redirect to Home
```

2. **创建旅行计划**
```
PlannerInput → useTravelPlan hook → llmService.generatePlan()
→ LLM API → travelService.savePlan() → Supabase → Update TravelContext
```

3. **查看地图**
```
PlanDetails → useMap hook → mapService.loadMap()
→ Amap API → Render map markers
```

## 🔐 安全设计

### API密钥管理
- 存储在Supabase用户表的加密字段
- 前端仅在调用时从数据库获取
- 使用环境变量存储应用级密钥

### 认证流程
- 使用Supabase Auth进行认证
- JWT Token存储在localStorage
- 路由守卫保护私有页面
- API请求自动携带Token

## 📱 响应式设计

### 断点定义
```css
/* Tailwind断点 */
sm: 640px   /* 手机横屏 */
md: 768px   /* 平板 */
lg: 1024px  /* 桌面 */
xl: 1280px  /* 大屏 */
```

### 移动端适配策略
- 使用Flexbox/Grid布局
- 移动端隐藏侧边栏，改为抽屉
- 触摸友好的组件尺寸
- 地图组件移动端优化

## ⚡ 性能优化

### 代码分割
```typescript
// 路由级代码分割
const Home = lazy(() => import('./pages/Home'));
const Settings = lazy(() => import('./pages/Settings'));
```

### 组件优化
- 使用 `React.memo` 避免不必要的重渲染
- 使用 `useMemo` 和 `useCallback` 优化计算和函数
- 虚拟滚动处理长列表

### 资源优化
- 图片懒加载
- 压缩和优化图片
- 使用CDN加速静态资源

## 🧪 测试策略

### 测试分层
1. **单元测试**: 工具函数、Hooks
2. **组件测试**: UI组件交互
3. **集成测试**: 页面流程
4. **E2E测试**: 关键业务流程

### 测试工具
- **框架**: Vitest
- **组件测试**: React Testing Library
- **E2E**: Playwright (可选)

## 🚀 构建部署

### 环境配置
- **开发环境**: `npm run dev`
- **构建**: `npm run build`
- **预览**: `npm run preview`

### 部署平台
- **推荐**: Vercel / Netlify
- **特点**: 自动CI/CD、HTTPS、CDN

## 📝 编码规范

### 命名约定
- **组件**: PascalCase (`TravelCard.tsx`)
- **函数/变量**: camelCase (`getUserData`)
- **常量**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **类型/接口**: PascalCase (`User`, `TravelPlan`)

### 文件组织
```typescript
// 组件文件结构
TravelCard/
├── TravelCard.tsx        // 组件实现
├── TravelCard.module.css // 样式
├── TravelCard.test.tsx   // 测试
└── index.ts              // 导出
```

### TypeScript规范
- 所有组件必须定义Props类型
- 避免使用 `any`，优先 `unknown`
- 使用接口定义对象结构
- 导出可复用的类型定义

## 🔄 开发工作流

1. **创建新功能分支**: `git checkout -b feature/xxx`
2. **开发**: 编写代码 + 测试
3. **代码检查**: ESLint + Prettier
4. **提交**: Conventional Commits规范
5. **合并**: Pull Request到develop分支
6. **部署**: develop → main → 生产环境

---

**文档版本**: v1.0  
**更新日期**: 2025-10-23

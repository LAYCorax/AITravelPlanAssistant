# 开发环境搭建指南

## 📋 前置要求

在开始之前，请确保你的系统已安装以下软件：

### 必需软件
- **Node.js**: v20.11.1 或更高版本
  - 下载地址: https://nodejs.org/
  - 验证安装: `node --version`
- **npm**: v10.2.4 或更高版本
  - 通常随 Node.js 一起安装
  - 验证安装: `npm --version`
- **Git**: 最新版本
  - 下载地址: https://git-scm.com/
  - 验证安装: `git --version`

### 推荐工具
- **VS Code**: 推荐的代码编辑器
  - 下载地址: https://code.visualstudio.com/
- **推荐 VS Code 插件**:
  - ESLint
  - Prettier - Code formatter
  - TypeScript Vue Plugin (Volar)
  - GitLens
  - Auto Rename Tag
  - Path Intellisense

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/LAYCorax/AITravelPlanAssistant.git
cd AITravelPlanAssistant
```

### 2. 安装依赖

```bash
cd frontend
npm install
```

### 3. 配置环境变量

#### 复制环境变量模板
```bash
cp .env.example .env
```

#### 编辑 .env 文件并填入你的 API 密钥

```bash
# 使用文本编辑器打开 .env 文件
code .env  # 或使用其他编辑器
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:5173` 启动

## 🔑 API 密钥配置

### 阿里云百炼平台 (大语言模型)

1. 访问 [阿里云百炼控制台](https://bailian.console.aliyun.com/)
2. 登录/注册账号
3. 创建应用并获取 API Key
4. 将 API Key 填入 `.env` 文件：
   ```
   VITE_LLM_API_KEY=sk-your-api-key-here
   ```

**获取步骤**:
- 进入控制台 → 创建应用 → 选择模型 → 获取 API Key

### 科大讯飞语音识别

1. 访问 [讯飞开放平台](https://www.xfyun.cn/)
2. 注册开发者账号
3. 创建应用（选择"录音文件转写"服务）
4. 获取 APPID、APISecret、APIKey
5. 填入 `.env` 文件：
   ```
   VITE_VOICE_APP_ID=your-app-id
   VITE_VOICE_API_SECRET=your-api-secret
   VITE_VOICE_API_KEY=your-api-key
   ```

**获取步骤**:
- 控制台 → 创建应用 → 选择"语音听写/录音文件转写" → 获取凭证

### 高德地图 API

1. 访问 [高德开放平台](https://console.amap.com/)
2. 注册开发者账号
3. 进入"应用管理" → "我的应用" → "创建新应用"
4. 添加 Key（选择 Web 端（JS API））
5. 填入 `.env` 文件：
   ```
   VITE_AMAP_KEY=your-amap-key
   VITE_AMAP_SECRET=your-amap-secret
   ```

**获取步骤**:
- 控制台 → 应用管理 → 创建应用 → 添加 Key → 选择"Web 服务"

### Supabase (后端服务)

1. 访问 [Supabase](https://app.supabase.com/)
2. 使用 GitHub 账号登录
3. 创建新项目
4. 在项目设置中找到 API 凭证
5. 填入 `.env` 文件：
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

**获取步骤**:
- 创建项目 → Project Settings → API → 复制 URL 和 anon key

## 📁 项目结构

```
AITravelPlanAssistant/
├── frontend/                # 前端项目目录
│   ├── src/                # 源代码
│   │   ├── assets/        # 静态资源（图片、字体等）
│   │   ├── components/    # React 组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API 服务
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── utils/         # 工具函数
│   │   ├── types/         # TypeScript 类型定义
│   │   ├── styles/        # 全局样式
│   │   ├── App.tsx        # 根组件
│   │   ├── main.tsx       # 入口文件
│   │   └── vite-env.d.ts  # Vite 环境变量类型定义
│   ├── public/            # 公共资源
│   ├── .env               # 环境变量（不提交到 git）
│   ├── .env.example       # 环境变量模板
│   ├── .gitignore         # Git 忽略文件
│   ├── .prettierrc.json   # Prettier 配置
│   ├── eslint.config.js   # ESLint 配置
│   ├── tsconfig.json      # TypeScript 配置
│   ├── vite.config.ts     # Vite 配置
│   └── package.json       # 项目依赖
├── docs/                   # 项目文档
│   ├── TechStack.md       # 技术栈文档
│   ├── GitWorkflow.md     # Git 工作流程
│   └── DevEnvironment.md  # 本文档
├── PRD.md                 # 产品需求文档
├── WorkPlan.md            # 工作计划
└── README.md              # 项目说明
```

## 🛠️ 开发命令

### 常用命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint

# 自动修复代码问题
npm run lint:fix

# 代码格式化
npm run format

# 检查代码格式
npm run format:check
```

### 推荐开发流程

```bash
# 1. 确保代码是最新的
git pull origin develop

# 2. 创建功能分支
git checkout -b feature/your-feature-name

# 3. 启动开发服务器
npm run dev

# 4. 开发功能...

# 5. 格式化代码
npm run format

# 6. 检查代码质量
npm run lint:fix

# 7. 提交代码
git add .
git commit -m "feat: add your feature description"

# 8. 推送到远程
git push origin feature/your-feature-name
```

## 🔧 开发工具配置

### VS Code 配置

在项目根目录创建 `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "frontend/node_modules/typescript/lib",
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### 推荐的 VS Code 扩展

在 `.vscode/extensions.json` 中添加：

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "eamodio.gitlens"
  ]
}
```

## 📝 代码规范

### TypeScript

- 使用 TypeScript 进行类型检查
- 避免使用 `any` 类型
- 为函数参数和返回值添加类型注解
- 使用接口定义数据结构

### React

- 使用函数组件和 Hooks
- 遵循 React 命名规范（组件大写开头）
- 合理使用 `useEffect`、`useMemo`、`useCallback`
- 避免不必要的重渲染

### 样式

- 使用 Tailwind CSS 工具类
- 组件样式模块化
- 遵循移动优先的响应式设计

### 文件命名

- 组件文件：PascalCase（如 `UserProfile.tsx`）
- 工具函数：camelCase（如 `formatDate.ts`）
- 类型定义：PascalCase（如 `User.types.ts`）
- 常量：UPPER_SNAKE_CASE（如 `API_ENDPOINTS.ts`）

## 🐛 常见问题

### 1. 端口被占用

```bash
# 错误: Port 5173 is already in use
# 解决方案: 在 vite.config.ts 中修改端口
server: {
  port: 3000
}
```

### 2. 依赖安装失败

```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

### 3. TypeScript 类型错误

```bash
# 重启 TypeScript 服务器（VS Code）
Ctrl+Shift+P -> TypeScript: Restart TS Server
```

### 4. ESLint 配置冲突

```bash
# 删除缓存
rm -rf node_modules/.cache
npm run lint:fix
```

### 5. 环境变量不生效

- 确保 `.env` 文件在 `frontend` 目录下
- 重启开发服务器
- 变量名必须以 `VITE_` 开头

## 🔐 安全注意事项

### ⚠️ 绝对不要做的事情

1. **不要** 将 `.env` 文件提交到 Git
2. **不要** 在代码中硬编码 API 密钥
3. **不要** 在公开场合分享你的 API 密钥
4. **不要** 使用生产环境的密钥进行开发

### ✅ 应该做的事情

1. ✅ 使用 `.env.example` 作为模板
2. ✅ 定期更换 API 密钥
3. ✅ 为不同环境使用不同的密钥
4. ✅ 使用环境变量管理敏感信息

## 📊 性能优化建议

### 开发环境

- 使用 React DevTools 进行组件分析
- 启用 Vite 的 HMR（热模块替换）
- 合理使用 `React.memo` 和 `useMemo`

### 生产环境

- 代码分割（Code Splitting）
- 懒加载路由和组件
- 图片优化（WebP 格式、懒加载）
- 启用 Gzip 压缩

## 🧪 测试

### 运行测试（后续添加）

```bash
# 运行单元测试
npm run test

# 运行测试覆盖率
npm run test:coverage

# 运行 E2E 测试
npm run test:e2e
```

## 📚 学习资源

### 官方文档
- [React 官方文档](https://react.dev/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Vite 文档](https://vitejs.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

### 教程推荐
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Vite 构建指南](https://vitejs.dev/guide/)
- [Modern React 最佳实践](https://react.dev/learn)

## 🆘 获取帮助

### 遇到问题？

1. **查看文档**: 首先查看项目文档和官方文档
2. **搜索 Issues**: 在 GitHub Issues 中搜索相似问题
3. **提交 Issue**: 如果问题未解决，创建新的 Issue
4. **联系团队**: 通过项目协作工具联系团队成员

### Issue 模板

```markdown
**问题描述**
清晰简洁地描述问题

**复现步骤**
1. 执行命令 '...'
2. 点击 '...'
3. 看到错误

**期望行为**
描述你期望发生什么

**截图**
如果适用，添加截图帮助解释问题

**环境信息**
- OS: [e.g. Windows 11]
- Node 版本: [e.g. v20.11.1]
- npm 版本: [e.g. 10.2.4]
- 浏览器: [e.g. Chrome 120]
```

## ✅ 环境验证清单

完成环境搭建后，请检查：

- [ ] Node.js 和 npm 版本正确
- [ ] 项目依赖安装成功
- [ ] `.env` 文件配置完成
- [ ] 所有 API 密钥已获取
- [ ] 开发服务器可以正常启动
- [ ] 没有将 `.env` 文件提交到 git
- [ ] ESLint 和 Prettier 正常工作
- [ ] 可以访问 `http://localhost:5173`

---

**祝开发愉快！** 🎉

如果有任何问题，请随时查阅文档或联系团队成员。

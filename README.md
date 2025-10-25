# 🧳 AI旅行规划助手

一款基于人工智能的智能旅行规划Web应用，通过语音和文字交互，为用户提供个性化旅行方案。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)

## ✨ 核心功能

- 🎤 **智能语音输入** - 用语音描述旅行需求
- 🤖 **AI行程生成** - 基于大语言模型自动规划详细方案
- 🗺️ **地图可视化** - 地图展示所有景点和路线规划
- 💰 **费用管理** - 记录开销、预算追踪、智能分析
- 📱 **多端同步** - 云端数据存储，随时随地访问
- ✏️ **行程编辑** - 自由调整行程安排

## 🚀 快速开始

### 环境要求

- Node.js 18+
- 现代浏览器

### 安装与运行

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:5173` 开始使用。

### 配置

1. 创建 `frontend/.env` 文件：

```env
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

2. 初始化数据库（在 Supabase SQL Editor 中执行）：

```bash
docs/database-setup.sql          # 基础表
docs/user-profiles-setup.sql     # 用户表
docs/api-configs-setup.sql       # API配置
docs/travel-plans-setup.sql      # 旅行计划
docs/expenses-setup.sql          # 费用管理
docs/storage-policies.sql        # 存储策略
```

3. 在系统设置页面配置 API 密钥：
   - 阿里云通义千问（大语言模型）
   - 讯飞语音识别
   - 高德地图服务

## 📚 文档

- [用户使用指南](USER_GUIDE.md) - 详细的功能使用说明
- [产品需求文档](PRD.md) - 完整的产品设计文档
- [技术文档](docs/) - 架构、API、数据库设计等

## 🛠️ 技术栈

### 前端
- React 18 + TypeScript
- Vite 5
- Ant Design 5
- React Router 6

### 后端 & 数据库
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Storage

### 第三方服务
- 阿里云通义千问（AI生成）
- 讯飞语音识别
- 高德地图 Web API

## 📸 功能截图

### 智能行程规划
输入旅行需求，AI自动生成详细方案。

### 地图可视化
在地图上查看所有景点位置和路线。

### 费用管理
记录和追踪旅行开销，智能预算分析。

## 🗂️ 项目结构

```
AITravelPlanAssistant/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/      # 组件
│   │   ├── pages/           # 页面
│   │   ├── services/        # API服务
│   │   ├── hooks/           # 自定义Hooks
│   │   ├── types/           # 类型定义
│   │   └── utils/           # 工具函数
│   └── package.json
├── docs/                    # 文档
│   ├── *.sql               # 数据库脚本
│   └── *.md                # 技术文档
├── Dockerfile              # Docker镜像构建文件
├── docker-compose.yml      # Docker Compose配置
├── nginx.conf              # Nginx配置
├── PRD.md                  # 产品需求文档
├── USER_GUIDE.md           # 用户指南
├── PROJECT_SUMMARY.md      # 项目总结
├── DOCKER_DEPLOYMENT.md    # Docker部署指南
└── README.md               # 项目说明
```

## 📦 部署

### 🐳 Docker部署(推荐)

快速使用Docker容器化部署:

```bash
# 使用Docker Compose
docker-compose up -d

# 或使用Docker直接运行
docker build -t ai-travel-planner:latest .
docker run -d -p 80:80 --name ai-travel-planner ai-travel-planner:latest
```

**详细说明请查看:** [Docker部署指南](DOCKER_DEPLOYMENT.md)

### ☁️ 云平台部署

推荐使用 Vercel、Netlify 或 Cloudflare Pages 进行部署。

**步骤：**
1. 将代码推送到 GitHub
2. 在部署平台连接仓库
3. 配置构建命令：`cd frontend && npm run build`
4. 配置输出目录：`frontend/dist`
5. 添加环境变量（Supabase URL 和 Key）

### 数据库初始化

在 Supabase 控制台执行 `docs/` 目录下的 SQL 脚本。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 开源协议

本项目基于 [MIT](LICENSE) 协议开源。

## 🙏 致谢

- [React](https://react.dev/)
- [Ant Design](https://ant.design/)
- [Supabase](https://supabase.com/)
- [阿里云](https://www.aliyun.com/)
- [讯飞开放平台](https://www.xfyun.cn/)
- [高德地图](https://lbs.amap.com/)

---

**祝您使用愉快！** 🎉

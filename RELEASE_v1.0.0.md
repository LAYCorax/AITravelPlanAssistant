# 🎉 AI旅行规划助手 v1.0.0 正式发布

**发布日期**: 2025年10月25日  
**版本号**: v1.0.0  
**仓库地址**: https://github.com/LAYCorax/AITravelPlanAssistant

---

## 📦 下载方式

### 方式一：下载 Docker 镜像（推荐）

从 GitHub Release 页面下载已构建的 Docker 镜像压缩包：

**下载地址**: https://github.com/LAYCorax/AITravelPlanAssistant/releases/tag/v1.0.0

下载后加载并运行：

```bash
# 1. 下载镜像文件 ai-travel-planner-v1.0.0.tar.gz

# 2. 加载镜像
docker load < ai-travel-planner-v1.0.0.tar.gz

# 3. 查看已加载的镜像
docker images | grep ai-travel-planner

# 4. 运行容器（需要配置 Supabase 环境变量）
docker run -d \
  --name ai-travel-planner \
  -p 80:80 \
  -e SUPABASE_URL=你的Supabase项目URL \
  -e SUPABASE_ANON_KEY=你的Supabase匿名密钥 \
  --restart unless-stopped \
  ai-travel-planner:v1.0.0
```

> 🔒 **安全提示**: 镜像中不包含任何敏感信息，Supabase 配置在运行时通过环境变量注入。

### 方式二：源码部署

```bash
# 克隆仓库
git clone https://github.com/LAYCorax/AITravelPlanAssistant.git
cd AITravelPlanAssistant

# 切换到v1.0.0标签
git checkout v1.0.0

# 使用Docker Compose部署
docker-compose up -d
```

### 方式三：从源码构建

```bash
# 1. 克隆仓库
git clone https://github.com/LAYCorax/AITravelPlanAssistant.git
cd AITravelPlanAssistant

# 2. 切换到v1.0.0标签
git checkout v1.0.0

# 3. 构建Docker镜像
docker build -t ai-travel-planner:v1.0.0 .

# 4. 运行容器
docker run -d -p 80:80 --name ai-travel-planner ai-travel-planner:v1.0.0
```

---

## 🚀 快速开始指南

### 第一步：启动应用

使用上述任一方式启动应用后，在浏览器访问：

```
http://localhost
```

或使用自定义端口：

```bash
docker run -d -p 8080:80 --name ai-travel-planner laycorax/ai-travel-planner:v1.0.0
# 访问 http://localhost:8080
```

### 第二步：配置 Supabase

应用需要 Supabase 作为后端数据库，请按以下步骤配置：

#### 2.1 创建 Supabase 项目

1. 访问 https://supabase.com/ 注册账号（免费）
2. 创建新项目，等待初始化（约2分钟）
3. 记录项目的 **URL** 和 **anon public key**
   - 在项目设置 → API 中找到这两个值
   - 例如：
     - URL: `https://xxxxx.supabase.co`
     - Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### 2.2 初始化数据库

在 Supabase 控制台的 **SQL Editor** 中执行：

```bash
# 克隆仓库获取SQL脚本
git clone https://github.com/LAYCorax/AITravelPlanAssistant.git
cd AITravelPlanAssistant/docs

# 依次在 Supabase SQL Editor 中执行以下文件：
1. database-setup.sql
2. user-profiles-setup.sql
3. api-configs-setup.sql
4. travel-plans-setup.sql
5. expenses-setup.sql
6. storage-policies.sql
```

> 💡 **提示**: 可以直接复制 SQL 文件内容粘贴到 SQL Editor 中执行。

### 第三步：启动容器

使用获取的 Supabase 配置启动容器：

```bash
# 替换为你的实际 Supabase 配置
docker run -d \
  --name ai-travel-planner \
  -p 80:80 \
  -e SUPABASE_URL=https://your-project.supabase.co \
  -e SUPABASE_ANON_KEY=your-anon-key \
  --restart unless-stopped \
  ai-travel-planner:v1.0.0
```

或使用 Docker Compose（推荐）：

```bash
# 1. 创建 .env 文件
cat > .env << EOF
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
EOF

# 2. 启动服务
docker-compose up -d
```

> � **安全说明**: 
> - 环境变量仅在容器启动时注入，不会存储在镜像中
> - 建议使用 `.env` 文件管理敏感信息，不要提交到代码仓库
> - 可以使用 Docker Secrets 或其他密钥管理工具进一步提升安全性

### 第四步：访问应用

打开浏览器访问：`http://localhost`

首次使用需要注册账号：
1. 点击"注册"按钮
2. 输入邮箱和密码（密码至少6个字符）
3. 注册成功后登录系统

> 💡 **提示**: 如果 Supabase 开启了邮箱验证，需要点击验证邮件中的链接。

### 第五步：配置 API 密钥（可选但推荐）

登录后进入**设置页面 → API配置**，配置以下服务：

#### 5.1 阿里云通义千问（AI行程生成）

1. 访问 [阿里云百炼平台](https://bailian.console.aliyun.com/)
2. 创建 API Key
3. 在应用中填入 API Key

**费用**: 通义千问有免费额度，按Token计费

#### 5.2 讯飞语音识别（语音输入）

1. 访问 [讯飞开放平台](https://www.xfyun.cn/)
2. 创建应用，开通"实时语音转写"服务
3. 获取 APPID、APISecret、APIKey
4. 在应用中填入这三个密钥

**费用**: 每日有免费额度

#### 5.3 高德地图（地图展示和路线规划）

1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 创建应用（Web端）
3. 获取 API Key 和安全密钥
4. 在应用中填入密钥

**费用**: 每日有免费调用配额（足够个人使用）

> 📝 **说明**: 不配置这些 API 也可以使用应用，但无法使用 AI 生成、语音输入和地图功能。

### 第六步：开始使用

1. 点击"创建新计划"
2. 输入旅行需求，例如：
   ```
   我想去日本东京，5天4晚，预算10000元，2人出行，喜欢美食和动漫文化
   ```
3. 点击"生成行程"
4. 查看AI生成的详细旅行方案
5. 在地图上查看景点位置和路线
6. 使用费用管理功能记录开销

---

## ✨ 主要功能

### 🎯 核心功能

- ✅ **用户认证系统** - 注册、登录、会话管理、密码重置
- ✅ **AI智能行程生成** - 基于大语言模型生成个性化旅行方案
- ✅ **语音输入支持** - 使用语音描述旅行需求
- ✅ **地图可视化** - 在地图上展示景点和规划路线
- ✅ **费用管理** - 记录开销、预算追踪、图表分析
- ✅ **行程编辑器** - 自由编辑和调整行程安排
- ✅ **多端同步** - 云端数据存储，多设备访问

### 💡 特色亮点

1. **智能语音记账** - 说"午餐花了50元"自动记录费用
2. **预算预警** - 超出预算自动提醒
3. **多维度费用分析** - 饼图、柱状图、趋势图
4. **响应式设计** - 完美支持手机、平板、电脑

---

## 🛠️ 技术架构

### 前端技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **UI组件库**: Ant Design 5
- **路由**: React Router 6
- **状态管理**: Context API
- **地图**: 高德地图 Web API
- **图表**: Recharts

### 后端服务

- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **存储**: Supabase Storage
- **实时订阅**: Supabase Realtime

### AI 服务

- **大语言模型**: 阿里云通义千问
- **语音识别**: 讯飞语音识别 API
- **地图服务**: 高德地图 API

### 部署方案

- **容器化**: Docker + Docker Compose
- **Web服务器**: Nginx (Alpine)
- **构建优化**: 多阶段构建，镜像体积约 50-80MB

---

## 📊 系统要求

### 服务器要求

- **CPU**: 1核心或以上
- **内存**: 512MB 或以上
- **存储**: 1GB 或以上
- **Docker**: 20.10+ 版本

### 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 网络要求

- 需要访问以下服务：
  - Supabase API
  - 阿里云 API（可选）
  - 讯飞 API（可选）
  - 高德地图 API（可选）

---

## 📖 完整文档

### 用户文档

- [用户使用指南](https://github.com/LAYCorax/AITravelPlanAssistant/blob/main/USER_GUIDE.md) - 详细的功能使用说明
- [Docker部署指南](https://github.com/LAYCorax/AITravelPlanAssistant/blob/main/DOCKER_DEPLOYMENT.md) - 容器化部署完整指南

### 开发文档

- [产品需求文档](https://github.com/LAYCorax/AITravelPlanAssistant/blob/main/PRD.md) - 完整的产品设计
- [技术架构文档](https://github.com/LAYCorax/AITravelPlanAssistant/blob/main/docs/Architecture.md) - 系统架构设计
- [数据库设计文档](https://github.com/LAYCorax/AITravelPlanAssistant/blob/main/docs/DatabaseDesign.md) - 数据库表结构
- [API规范文档](https://github.com/LAYCorax/AITravelPlanAssistant/blob/main/docs/APISpecification.md) - API接口说明

---

## 🐛 已知问题

### 限制和注意事项

1. **环境变量配置**: 由于前端是静态构建，Supabase 配置需要在构建时注入
2. **API限制**: 第三方 API 服务有调用频率和额度限制
3. **浏览器权限**: 语音功能需要浏览器允许麦克风权限
4. **HTTPS要求**: 某些功能（如语音）在非 HTTPS 环境可能无法使用

### 计划改进

- [ ] 添加行程导出为 PDF 功能
- [ ] 支持多语言界面（英文、日文等）
- [ ] 添加社交分享功能
- [ ] 优化移动端体验
- [ ] 添加离线缓存支持

---

## 🔄 更新记录

### v1.0.0 (2025-10-25)

**新增功能**
- ✅ 完整的用户认证系统
- ✅ AI智能行程生成功能
- ✅ 语音输入和语音记账
- ✅ 地图可视化展示
- ✅ 费用管理和预算追踪
- ✅ 行程编辑器
- ✅ Docker容器化部署

**技术优化**
- ✅ TypeScript 完整类型支持
- ✅ 组件化架构设计
- ✅ 响应式布局适配
- ✅ 多阶段 Docker 构建
- ✅ Nginx 性能优化

**修复问题**
- 🐛 修复 Docker 构建时的 TypeScript 编译错误
- 🐛 修复未使用导入导致的编译警告

---

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

### 贡献方式

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 开发指南

请参考 [开发环境配置文档](https://github.com/LAYCorax/AITravelPlanAssistant/blob/main/docs/DevEnvironment.md)

---

## 📞 技术支持

### 获取帮助

- 📧 Email: 联系仓库维护者
- 💬 Issues: [GitHub Issues](https://github.com/LAYCorax/AITravelPlanAssistant/issues)
- 📖 文档: [完整文档](https://github.com/LAYCorax/AITravelPlanAssistant/tree/main/docs)

### 常见问题

查看 [用户指南](https://github.com/LAYCorax/AITravelPlanAssistant/blob/main/USER_GUIDE.md) 中的"常见问题"章节。

---

## 📄 开源协议

本项目基于 [MIT License](https://github.com/LAYCorax/AITravelPlanAssistant/blob/main/LICENSE) 开源。

---

## 🙏 致谢

感谢以下开源项目和服务提供商：

- [React](https://react.dev/) - 前端框架
- [Ant Design](https://ant.design/) - UI组件库
- [Vite](https://vitejs.dev/) - 构建工具
- [Supabase](https://supabase.com/) - 后端服务
- [阿里云](https://www.aliyun.com/) - AI服务
- [讯飞开放平台](https://www.xfyun.cn/) - 语音服务
- [高德地图](https://lbs.amap.com/) - 地图服务

---

## 📸 应用截图

### 首页
![首页](https://via.placeholder.com/800x450?text=Home+Page)

### 智能行程生成
![行程生成](https://via.placeholder.com/800x450?text=AI+Planning)

### 地图可视化
![地图展示](https://via.placeholder.com/800x450?text=Map+View)

### 费用管理
![费用管理](https://via.placeholder.com/800x450?text=Expense+Management)

---

## 🎯 路线图

### 近期计划 (v1.1.0)

- [ ] PDF 导出功能
- [ ] 分享旅行计划
- [ ] 协作编辑支持
- [ ] 移动端 PWA 支持

### 长期计划 (v2.0.0)

- [ ] 小程序版本
- [ ] 移动端 App
- [ ] AI 助手对话模式
- [ ] 社区功能（游记分享、攻略推荐）

---

**立即开始你的智能旅行规划之旅！** 🚀✨

**仓库地址**: https://github.com/LAYCorax/AITravelPlanAssistant  
**发布标签**: v1.0.0  
**发布日期**: 2025-10-25

# 🐳 Docker 镜像使用快速指南

> **仓库地址**: https://github.com/LAYCorax/AITravelPlanAssistant  
> **镜像下载**: https://github.com/LAYCorax/AITravelPlanAssistant/releases/tag/v1.0.0

---

## 📦 一键启动（5分钟上手）

```bash
# 1. 从 GitHub Release 下载镜像文件 ai-travel-planner-v1.0.0.tar.gz

# 2. 加载镜像
docker load < ai-travel-planner-v1.0.0.tar.gz

# 3. 运行容器（需要配置 Supabase 环境变量）
docker run -d \
  --name ai-travel-planner \
  -p 80:80 \
  -e SUPABASE_URL=你的Supabase项目URL \
  -e SUPABASE_ANON_KEY=你的Supabase匿名密钥 \
  --restart unless-stopped \
  ai-travel-planner:v1.0.0

# 4. 访问应用
# 打开浏览器访问: http://localhost
```

> 🔒 **安全提示**: 镜像中不包含任何敏感配置，Supabase 凭据在运行时通过环境变量注入。

就这么简单！🎉

---

## 🚀 完整部署步骤

### 步骤 1: 下载并加载镜像

```bash
# 方式A: 从 GitHub Release 下载（推荐）
# 1. 访问 https://github.com/LAYCorax/AITravelPlanAssistant/releases/tag/v1.0.0
# 2. 下载 ai-travel-planner-v1.0.0.tar.gz

# 3. 加载镜像
docker load < ai-travel-planner-v1.0.0.tar.gz

# 4. 验证镜像已加载
docker images | grep ai-travel-planner

# 方式B: 从源码构建
git clone https://github.com/LAYCorax/AITravelPlanAssistant.git
cd AITravelPlanAssistant
docker build -t ai-travel-planner:v1.0.0 .
```

### 步骤 2: 准备 Supabase

应用需要 Supabase 作为后端数据库，请按以下步骤配置：

#### 2.1 创建 Supabase 项目

1. 访问 https://supabase.com/ 注册账号（免费）
2. 创建新项目，等待初始化（约2分钟）
3. 记录项目的 **URL** 和 **anon public key**

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

### 步骤 3: 获取 Supabase 配置

应用需要 Supabase 作为后端数据库：

#### 3.1 创建 Supabase 项目

1. 访问 https://supabase.com/ 注册（免费）
2. 创建新项目，等待初始化
3. 在项目设置 → API 中找到：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIs...`

#### 3.2 初始化数据库

克隆仓库获取 SQL 脚本：

```bash
git clone https://github.com/LAYCorax/AITravelPlanAssistant.git
cd AITravelPlanAssistant/docs
```

在 Supabase SQL Editor 中依次执行：
1. `database-setup.sql`
2. `user-profiles-setup.sql`
3. `api-configs-setup.sql`
4. `travel-plans-setup.sql`
5. `expenses-setup.sql`
6. `storage-policies.sql`

### 步骤 4: 启动容器

使用获取的 Supabase 配置启动容器：

```bash
docker run -d \
  --name ai-travel-planner \
  -p 80:80 \
  -e SUPABASE_URL=https://your-project.supabase.co \
  -e SUPABASE_ANON_KEY=your-anon-key \
  --restart unless-stopped \
  ai-travel-planner:v1.0.0
```

> 💡 **提示**: 将 `your-project` 和 `your-anon-key` 替换为你的实际配置。

### 步骤 5: 访问应用

打开浏览器访问: http://localhost

---

## 🎯 使用 Docker Compose（推荐）

更简单的方式是使用 Docker Compose：

### 1. 下载并加载镜像

```bash
# 从 GitHub Release 下载镜像
docker load < ai-travel-planner-v1.0.0.tar.gz
```

### 2. 创建 docker-compose.yml

```bash
git clone https://github.com/LAYCorax/AITravelPlanAssistant.git
cd AITravelPlanAssistant
```

### 3. 配置环境变量

创建 `.env` 文件：

```bash
cat > .env << EOF
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
EOF
```

或复制示例文件：

```bash
cp .env.example .env
# 编辑 .env 文件填入你的配置
```

### 4. 启动服务

```bash
cd ..
docker-compose up -d
```

### 5. 查看状态

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

---

## ⚙️ 常用操作

### 查看容器日志

```bash
docker logs -f ai-travel-planner
```

### 停止容器

```bash
docker stop ai-travel-planner
```

### 启动容器

```bash
docker start ai-travel-planner
```

### 重启容器

```bash
docker restart ai-travel-planner
```

### 删除容器

```bash
# 停止并删除
docker stop ai-travel-planner
docker rm ai-travel-planner
```

### 更新到新版本

```bash
# 1. 停止并删除旧容器
docker stop ai-travel-planner
docker rm ai-travel-planner

# 2. 从 GitHub Release 下载新版本镜像
# 访问: https://github.com/LAYCorax/AITravelPlanAssistant/releases

# 3. 加载新镜像
docker load < ai-travel-planner-v1.x.x.tar.gz

# 4. 启动新容器
docker run -d \
  --name ai-travel-planner \
  -p 80:80 \
  --restart unless-stopped \
  ai-travel-planner:v1.x.x
```

---

## 🔧 自定义配置

### 更改端口

```bash
# 将应用映射到 8080 端口
docker run -d \
  --name ai-travel-planner \
  -p 8080:80 \
  -e SUPABASE_URL=your-url \
  -e SUPABASE_ANON_KEY=your-key \
  ai-travel-planner:v1.0.0

# 访问: http://localhost:8080
```

### 使用不同的容器名

```bash
docker run -d \
  --name my-travel-app \
  -p 80:80 \
  -e SUPABASE_URL=your-url \
  -e SUPABASE_ANON_KEY=your-key \
  ai-travel-planner:v1.0.0
```

### 设置资源限制

```bash
docker run -d \
  --name ai-travel-planner \
  -p 80:80 \
  -e SUPABASE_URL=your-url \
  -e SUPABASE_ANON_KEY=your-key \
  --memory="512m" \
  --cpus="1.0" \
  ai-travel-planner:v1.0.0
```

### 使用环境变量文件

创建 `docker.env` 文件：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

然后运行：

```bash
docker run -d \
  --name ai-travel-planner \
  -p 80:80 \
  --env-file docker.env \
  --restart unless-stopped \
  ai-travel-planner:v1.0.0
```

---

## 💾 导出和分享镜像

### 导出镜像文件

如需在其他机器或离线环境使用：

```bash
# 导出镜像为压缩文件
docker save ai-travel-planner:v1.0.0 | gzip > ai-travel-planner-v1.0.0.tar.gz

# 传输到其他机器后，加载镜像
docker load < ai-travel-planner-v1.0.0.tar.gz
```

### 推送到私有镜像仓库

如需使用私有镜像仓库（阿里云、AWS ECR等）：

```bash
# 以阿里云为例
docker login --username=your-username registry.cn-hangzhou.aliyuncs.com
docker tag ai-travel-planner:v1.0.0 registry.cn-hangzhou.aliyuncs.com/namespace/ai-travel-planner:v1.0.0
docker push registry.cn-hangzhou.aliyuncs.com/namespace/ai-travel-planner:v1.0.0
```

---

## 📝 配置 API 密钥

启动应用后，登录系统并在**设置页面**配置以下 API（可选）：

### 1. 阿里云通义千问（AI 行程生成）

- 访问: https://bailian.console.aliyun.com/
- 创建 API Key
- 在应用设置中填入

### 2. 讯飞语音识别（语音输入）

- 访问: https://www.xfyun.cn/
- 创建应用，获取 APPID、APISecret、APIKey
- 在应用设置中填入

### 3. 高德地图（地图展示）

- 访问: https://lbs.amap.com/
- 创建应用，获取 Web API Key
- 在应用设置中填入

> 💡 **提示**: 不配置这些 API 也能使用基本功能，但无法使用 AI 生成、语音和地图功能。

---

## 🐛 故障排查

### 问题 1: 端口被占用

```bash
# Windows
netstat -ano | findstr :80

# Linux/Mac
lsof -i :80

# 解决: 使用其他端口
docker run -d -p 8080:80 --name ai-travel-planner laycorax/ai-travel-planner:v1.0.0
```

### 问题 2: 容器无法启动

```bash
# 查看详细日志
docker logs ai-travel-planner

# 检查容器状态
docker ps -a | grep ai-travel-planner
```

### 问题 3: 无法访问应用

1. 检查容器是否运行: `docker ps`
2. 检查防火墙设置
3. 确认端口映射正确
4. 检查 Supabase 配置是否正确

### 问题 4: 构建失败

```bash
# 清理缓存重新构建
docker build --no-cache -t ai-travel-planner:custom .
```

---

## 📊 系统要求

### 最低要求

- Docker 20.10+
- 512MB 可用内存
- 1GB 可用磁盘空间

### 推荐配置

- Docker 24.0+
- 1GB 可用内存
- 2GB 可用磁盘空间

---

## 🌐 生产环境部署

### 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 启用 HTTPS

使用 Let's Encrypt 获取免费 SSL 证书：

```bash
# 安装 certbot
apt-get install certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d your-domain.com
```

### 使用 Docker Compose + Nginx

参考项目中的 `docker-compose.yml` 文件。

---

## 📚 更多文档

- **完整文档**: https://github.com/LAYCorax/AITravelPlanAssistant/blob/main/DOCKER_DEPLOYMENT.md
- **用户指南**: https://github.com/LAYCorax/AITravelPlanAssistant/blob/main/USER_GUIDE.md
- **发布说明**: https://github.com/LAYCorax/AITravelPlanAssistant/blob/main/RELEASE_v1.0.0.md
- **仓库主页**: https://github.com/LAYCorax/AITravelPlanAssistant

---

## 💬 获取帮助

- 📖 查看文档: [GitHub Docs](https://github.com/LAYCorax/AITravelPlanAssistant/tree/main/docs)
- 🐛 报告问题: [GitHub Issues](https://github.com/LAYCorax/AITravelPlanAssistant/issues)
- 💡 功能建议: [GitHub Discussions](https://github.com/LAYCorax/AITravelPlanAssistant/discussions)

---

**祝您使用愉快！** 🎉

**仓库地址**: https://github.com/LAYCorax/AITravelPlanAssistant  
**版本**: v1.0.0  
**更新日期**: 2025-10-25

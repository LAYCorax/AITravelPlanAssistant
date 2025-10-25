# Docker部署指南

## 🐳 Docker镜像构建与部署

本项目已配置好Docker支持,可快速构建并部署为容器化应用。

---

## 📋 前置要求

- Docker 20.10+
- Docker Compose 2.0+ (可选)
- 2GB+ 可用内存

---

## 🚀 快速开始

### 方式一:使用Docker Compose(推荐)

```bash
# 1. 克隆项目
git clone <repository-url>
cd AITravelPlanAssistant

# 2. 配置环境变量
# 在frontend目录创建.env文件
cd frontend
cp .env.example .env
# 编辑.env文件,填入Supabase配置

# 3. 构建并启动
cd ..
docker-compose up -d

# 4. 查看日志
docker-compose logs -f

# 5. 访问应用
# 打开浏览器访问 http://localhost
```

### 方式二:直接使用Docker

```bash
# 1. 构建镜像
docker build -t ai-travel-planner:latest .

# 2. 运行容器
docker run -d \
  --name ai-travel-planner \
  -p 80:80 \
  --restart unless-stopped \
  ai-travel-planner:latest

# 3. 查看日志
docker logs -f ai-travel-planner

# 4. 访问应用
# 打开浏览器访问 http://localhost
```

---

## 🔧 环境变量配置

在构建前,需要在`frontend/.env`文件中配置以下变量:

```env
# Supabase配置(必需)
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥

# 应用配置(可选)
VITE_APP_NAME=AI旅行规划助手
VITE_APP_VERSION=1.0.0
```

> **重要提示**:其他API密钥(大语言模型、语音识别、地图服务)在应用启动后通过设置页面配置,无需在环境变量中设置。

---

## 📦 镜像详情

### 构建信息

- **基础镜像**:
  - 构建阶段: `node:18-alpine` (轻量级Node.js环境)
  - 运行阶段: `nginx:alpine` (轻量级Nginx服务器)
- **镜像大小**:约50-80MB(压缩后)
- **端口**:80

### 多阶段构建优势

1. **体积小**:最终镜像只包含构建产物和Nginx,无Node.js依赖
2. **安全**:减少攻击面,生产环境不包含开发工具
3. **高效**:Nginx提供优秀的静态文件服务性能

---

## 🛠️ 常用操作

### 停止容器

```bash
# Docker Compose
docker-compose down

# Docker
docker stop ai-travel-planner
```

### 重启容器

```bash
# Docker Compose
docker-compose restart

# Docker
docker restart ai-travel-planner
```

### 查看容器状态

```bash
# Docker Compose
docker-compose ps

# Docker
docker ps -a | grep ai-travel-planner
```

### 进入容器

```bash
# Docker Compose
docker-compose exec frontend sh

# Docker
docker exec -it ai-travel-planner sh
```

### 删除容器和镜像

```bash
# 停止并删除容器
docker-compose down
# 或
docker stop ai-travel-planner
docker rm ai-travel-planner

# 删除镜像
docker rmi ai-travel-planner:latest
```

---

## 🌐 生产环境部署

### 1. 自定义端口

修改`docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # 将80改为8080
```

### 2. 启用HTTPS

使用Nginx反向代理或Traefik:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. 性能优化

在`nginx.conf`中已配置:
- ✅ Gzip压缩
- ✅ 静态资源缓存
- ✅ 安全头

### 4. 日志管理

```bash
# 查看实时日志
docker-compose logs -f --tail=100

# 导出日志
docker-compose logs > app.log
```

---

## 🔍 健康检查

容器内置健康检查,每30秒检查一次应用状态:

```bash
# 查看健康状态
docker inspect --format='{{.State.Health.Status}}' ai-travel-planner
```

---

## 📊 监控建议

推荐使用以下工具监控容器:

- **Portainer**:可视化Docker管理
- **Prometheus + Grafana**:指标监控
- **ELK Stack**:日志分析

---

## 🐞 故障排查

### 问题1:构建失败

```bash
# 清理缓存重新构建
docker-compose build --no-cache
```

### 问题2:容器启动失败

```bash
# 查看详细日志
docker logs ai-travel-planner

# 检查端口占用
netstat -ano | findstr :80  # Windows
lsof -i :80                 # Linux/Mac
```

### 问题3:无法访问应用

1. 检查容器是否运行:`docker ps`
2. 检查防火墙设置
3. 检查Supabase配置是否正确

---

## 📝 更新部署

### 更新代码后重新部署

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新构建镜像
docker-compose build

# 3. 重启容器
docker-compose up -d

# 4. 清理旧镜像
docker image prune -f
```

---

## 🎯 云平台部署

### Docker Hub

```bash
# 1. 登录Docker Hub
docker login

# 2. 标记镜像
docker tag ai-travel-planner:latest username/ai-travel-planner:latest

# 3. 推送镜像
docker push username/ai-travel-planner:latest
```

### 阿里云容器镜像服务

```bash
# 1. 登录阿里云
docker login --username=your-username registry.cn-hangzhou.aliyuncs.com

# 2. 标记镜像
docker tag ai-travel-planner:latest registry.cn-hangzhou.aliyuncs.com/namespace/ai-travel-planner:latest

# 3. 推送镜像
docker push registry.cn-hangzhou.aliyuncs.com/namespace/ai-travel-planner:latest
```

### AWS ECS / Azure Container Instances / Google Cloud Run

参考各平台文档进行部署配置。

---

## 💡 最佳实践

1. **使用.dockerignore**:已配置,排除不必要的文件
2. **多阶段构建**:已实现,减小镜像体积
3. **健康检查**:已配置,确保容器健康
4. **日志轮转**:建议配置Docker日志驱动
5. **资源限制**:生产环境建议设置内存和CPU限制

```yaml
services:
  frontend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

---

## 📞 支持

遇到问题?

1. 查看日志:`docker-compose logs -f`
2. 查看项目文档:`docs/`目录
3. 提交Issue到GitHub仓库

---

**构建日期**:2025-10-25  
**Docker版本要求**:20.10+

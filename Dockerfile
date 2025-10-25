# 多阶段构建 - 前端
FROM node:18-alpine AS frontend-builder

# 设置工作目录
WORKDIR /app/frontend

# 复制前端依赖文件
COPY frontend/package*.json ./

# 安装依赖
RUN npm ci

# 复制前端源代码
COPY frontend/ .

# 构建前端
RUN npm run build

# 生产镜像 - Nginx
FROM nginx:alpine

# 复制构建产物到Nginx
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# 复制Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]

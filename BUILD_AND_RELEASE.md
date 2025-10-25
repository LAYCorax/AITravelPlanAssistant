# 🚀 构建和发布 Docker 镜像指南

本文档说明如何构建 Docker 镜像并上传到 GitHub Release。

---

## 📦 构建 Docker 镜像

### 1. 准备构建环境

> 🔒 **安全说明**: 
> - 从 v1.0.0 开始，Supabase 配置不再在构建时注入
> - 镜像中不包含任何敏感信息
> - 用户在运行时通过环境变量提供自己的 Supabase 配置

**不需要配置 .env 文件！** 直接构建即可。

### 2. 构建镜像

```bash
# 进入项目根目录
cd D:\Learning\College\homework\res1\llm\2\AITravelPlanAssistant

# 构建镜像
docker build -t ai-travel-planner:v1.0.0 .

# 同时标记为 latest
docker tag ai-travel-planner:v1.0.0 ai-travel-planner:latest
```

### 3. 测试镜像

```bash
# 运行容器测试（需要提供 Supabase 配置）
docker run -d \
  -p 8080:80 \
  -e SUPABASE_URL=https://your-test-project.supabase.co \
  -e SUPABASE_ANON_KEY=your-test-key \
  --name test-travel-planner \
  ai-travel-planner:v1.0.0

# 访问 http://localhost:8080 测试功能

# 测试完成后删除容器
docker stop test-travel-planner
docker rm test-travel-planner
```

> 💡 **提示**: 可以使用测试用的 Supabase 项目进行测试。

---

## 💾 导出镜像文件

### 导出为压缩文件

```bash
# 导出 v1.0.0 版本
docker save ai-travel-planner:v1.0.0 | gzip > ai-travel-planner-v1.0.0.tar.gz

# 查看文件大小
# Windows PowerShell
Get-Item ai-travel-planner-v1.0.0.tar.gz | Select-Object Name, Length

# 或使用 ls 查看
ls -lh ai-travel-planner-v1.0.0.tar.gz
```

**预期文件大小**: 约 150-250 MB（压缩后）

### 可选：导出多个版本

```bash
# 同时导出 latest 标签
docker save ai-travel-planner:latest | gzip > ai-travel-planner-latest.tar.gz
```

---

## 📤 上传到 GitHub Release

### 方式一：通过 GitHub Web 界面（推荐）

1. **访问仓库的 Releases 页面**
   ```
   https://github.com/LAYCorax/AITravelPlanAssistant/releases
   ```

2. **点击 "Draft a new release"**

3. **填写 Release 信息**
   - **Tag**: 选择 `v1.0.0`（已存在）
   - **Release title**: `v1.0.0 - AI智能旅行规划助手首次发布`
   - **Description**: 复制 `RELEASE_v1.0.0.md` 的内容

4. **上传镜像文件**
   - 将 `ai-travel-planner-v1.0.0.tar.gz` 拖拽到 "Attach binaries" 区域
   - 等待上传完成（可能需要几分钟）

5. **发布**
   - 勾选 "Set as the latest release"
   - 点击 "Publish release"

### 方式二：使用 GitHub CLI

```bash
# 安装 GitHub CLI (如果未安装)
# Windows: winget install --id GitHub.cli

# 登录 GitHub
gh auth login

# 创建 Release 并上传文件
gh release create v1.0.0 \
  ai-travel-planner-v1.0.0.tar.gz \
  --title "v1.0.0 - AI智能旅行规划助手首次发布" \
  --notes-file RELEASE_v1.0.0.md
```

---

## 📝 Release Checklist

发布前请确认：

- [ ] 代码已提交并推送到 GitHub
- [ ] Tag `v1.0.0` 已创建并推送
- [ ] Docker 镜像已构建并测试通过
- [ ] 镜像文件已导出为 `.tar.gz` 格式
- [ ] `RELEASE_v1.0.0.md` 内容已更新
- [ ] `DOCKER_QUICK_START.md` 内容已更新
- [ ] 文档中的下载链接已确认正确
- [ ] 准备好 Supabase 配置说明
- [ ] 确认镜像中不包含敏感信息
- [ ] 环境变量注入机制测试通过

---

## 🔄 版本更新流程

后续版本发布流程：

```bash
# 1. 更新代码并提交
git add .
git commit -m "feat: 新功能"
git push origin main

# 2. 创建新版本 tag
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0

# 3. 构建新镜像
docker build -t ai-travel-planner:v1.1.0 .

# 4. 导出镜像
docker save ai-travel-planner:v1.1.0 | gzip > ai-travel-planner-v1.1.0.tar.gz

# 5. 创建 GitHub Release 并上传
gh release create v1.1.0 \
  ai-travel-planner-v1.1.0.tar.gz \
  --title "v1.1.0 - 更新说明" \
  --notes "更新内容..."
```

---

## 💡 最佳实践

### 1. 版本管理

- 使用语义化版本号: `v主版本.次版本.修订号`
- 主版本号：重大变更
- 次版本号：新功能
- 修订号：bug 修复

### 2. 镜像大小优化

当前镜像使用了多阶段构建，已经相对较小。如需进一步优化：

```dockerfile
# 在 Dockerfile 中启用更激进的压缩
# 或移除不必要的依赖
```

### 3. 安全性

- 不要在镜像中包含敏感信息（API密钥等）
- 定期更新基础镜像以获取安全补丁
- 扫描镜像漏洞

```bash
# 使用 Docker Scout 扫描漏洞（可选）
docker scout quickview ai-travel-planner:v1.0.0
```

### 4. 文档维护

- 每次发布都更新 Release Notes
- 保持 README.md 中的版本信息同步
- 更新 CHANGELOG.md（如果有）

---

## 🐛 常见问题

### Q: 上传到 GitHub Release 失败？

**A**: 
- 检查文件大小，GitHub 单个文件限制 2GB
- 确保网络连接稳定
- 尝试使用 GitHub CLI 而非 Web 界面

### Q: 镜像文件太大？

**A**:
- 当前多阶段构建已经很精简
- 可以考虑拆分为多个较小的镜像
- 或提供源码构建方式作为替代

### Q: 用户如何配置 Supabase？

**A**:
用户在运行容器时通过环境变量提供：

```bash
docker run -d \
  -e SUPABASE_URL=their-url \
  -e SUPABASE_ANON_KEY=their-key \
  -p 80:80 \
  ai-travel-planner:v1.0.0
```

或使用 Docker Compose 的 `.env` 文件。

**优势**:
- ✅ 镜像不包含敏感信息，更安全
- ✅ 每个用户使用自己的 Supabase 实例
- ✅ 便于在不同环境中部署

---

## 📚 相关文档

- [RELEASE_v1.0.0.md](./RELEASE_v1.0.0.md) - 完整发布说明
- [DOCKER_QUICK_START.md](./DOCKER_QUICK_START.md) - Docker 使用指南
- [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - 详细部署文档
- [USER_GUIDE.md](./USER_GUIDE.md) - 用户使用指南

---

**准备就绪？开始构建和发布吧！** 🚀

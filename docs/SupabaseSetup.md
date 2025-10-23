# Supabase 配置指南

本指南将帮助你配置 Supabase 后端服务。

## 步骤 1: 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/)
2. 点击 "Start your project" 创建免费账号
3. 创建新项目：
   - 输入项目名称（例如：ai-travel-planner）
   - 设置数据库密码（请妥善保存）
   - 选择区域（推荐：Singapore 或 Tokyo）
4. 等待项目初始化完成（约2分钟）

## 步骤 2: 获取 API 密钥

1. 在项目面板中，点击左侧菜单的 "Project Settings"
2. 选择 "API" 标签
3. 找到以下信息：
   - **Project URL**: 项目URL
   - **anon/public key**: 匿名公钥

## 步骤 3: 配置环境变量

1. 复制 `frontend/.env.example` 为 `frontend/.env`
2. 填入获取的 Supabase 信息：

```env
VITE_SUPABASE_URL=你的项目URL
VITE_SUPABASE_ANON_KEY=你的anon密钥
```

## 步骤 4: 创建数据库表

1. 在 Supabase 项目中，点击左侧菜单的 "SQL Editor"
2. 点击 "New query"
3. 复制 `docs/database-setup.sql` 文件的内容
4. 粘贴到 SQL 编辑器中
5. 点击 "Run" 执行 SQL

这将创建以下表：
- `user_profiles`: 用户配置信息
- `user_preferences`: 用户偏好设置
- `api_configs`: API密钥配置

## 步骤 5: 配置认证

1. 在 Supabase 项目中，点击 "Authentication"
2. 在 "Providers" 标签中，确保 "Email" 已启用
3. 在 "URL Configuration" 中，设置：
   - Site URL: `http://localhost:5173`（开发环境）
   - Redirect URLs: `http://localhost:5173/**`

## 步骤 6: 测试连接

1. 启动开发服务器：
```bash
cd frontend
npm run dev
```

2. 访问 `http://localhost:5173`
3. 尝试注册新账号
4. 检查 Supabase Dashboard 中的 "Authentication" 看是否有新用户

## 常见问题

### Q: 无法连接到 Supabase
A: 检查 `.env` 文件中的 URL 和密钥是否正确，确保没有多余的空格或引号。

### Q: 注册时报错
A: 确保已经执行了 `database-setup.sql` 创建了必要的表。

### Q: RLS 策略错误
A: 确保在 SQL 编辑器中执行了完整的 SQL 脚本，包括 RLS 策略部分。

## 生产环境配置

在部署到生产环境时：

1. 更新 Supabase 项目的 URL Configuration
2. 添加生产环境的域名到 Redirect URLs
3. 使用环境变量管理密钥，不要将 `.env` 文件提交到代码仓库

## 安全建议

- ✅ 永远不要将 `.env` 文件提交到 Git
- ✅ 定期更换 API 密钥
- ✅ 使用 Row Level Security 保护数据
- ✅ 在生产环境启用 SSL
- ✅ 限制 API 请求频率

## 下一步

完成 Supabase 配置后，你可以：
1. 运行应用并测试用户注册/登录
2. 开始开发旅行计划功能
3. 集成其他第三方 API

有问题？查看 [Supabase 官方文档](https://supabase.com/docs)

# Week 6 设置指南

## 📋 本周完成的功能

### 1. API密钥管理系统
- ✅ 创建了 `api_configs` 数据库表
- ✅ 实现了API密钥的加密存储
- ✅ 创建了Settings页面和API配置界面

### 2. 用户认证优化
- ✅ 修复了注册流程
- ✅ 添加了邮箱确认处理

---

## 🔧 Supabase配置步骤

### 步骤1：禁用邮箱确认（开发环境）

如果您在开发环境中不希望每次注册都需要确认邮箱，请按以下步骤操作：

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的项目
3. 进入 **Authentication** → **Settings**
4. 找到 **Email Auth** 部分
5. **关闭** "Enable email confirmations" 选项

> ⚠️ **注意**: 生产环境应该启用邮箱确认以确保安全性！

### 步骤2：创建API配置表

在Supabase SQL Editor中执行以下SQL：

```sql
-- 运行 docs/api-configs-setup.sql 文件中的内容
```

或者直接在SQL编辑器中粘贴 `docs/api-configs-setup.sql` 的内容。

### 步骤3：验证数据库表

确保以下表已创建：

- ✅ `user_profiles`
- ✅ `travel_plans`
- ✅ `itinerary_details`
- ✅ `api_configs` (新增)

可以在Supabase的 **Table Editor** 中查看。

---

## 🧪 测试注册功能

### 测试场景1：邮箱确认已禁用

1. 打开注册页面
2. 填写信息并提交
3. 应该直接登录并跳转到首页
4. 在Supabase的 **Authentication** → **Users** 中可以看到新用户

### 测试场景2：邮箱确认已启用

1. 打开注册页面
2. 填写信息并提交
3. 会显示提示："注册成功！请检查您的邮箱并点击确认链接以激活账户。"
4. 检查邮箱（可能在垃圾邮件中）
5. 点击确认链接
6. 返回登录页面登录

---

## 🔒 API密钥配置使用指南

### 配置LLM服务

1. 进入 **设置** → **API配置**
2. 展开 "大语言模型服务"
3. 填写：
   - 服务名称（如：通义千问）
   - API Key（从阿里云百炼平台获取）
4. 点击 "保存配置"

### 配置语音识别服务

1. 展开 "语音识别服务"
2. 填写：
   - 服务名称（如：科大讯飞）
   - App ID
   - API Key
   - API Secret
3. 点击 "保存配置"

### 配置地图服务

1. 展开 "地图服务"
2. 填写：
   - 服务名称（如：高德地图）
   - API Key
3. 点击 "保存配置"

---

## 🐛 常见问题解决

### 问题1：注册后显示"用户未登录"

**原因**: Supabase启用了邮箱确认功能

**解决方案**:
- 方案A：按照上面的步骤禁用邮箱确认（推荐用于开发）
- 方案B：检查邮箱并点击确认链接，然后重新登录

### 问题2：无法保存API配置

**原因**: `api_configs` 表未创建

**解决方案**:
```sql
-- 在Supabase SQL Editor中执行
-- 粘贴 docs/api-configs-setup.sql 的内容
```

### 问题3：API密钥保存后无法读取

**原因**: Row Level Security (RLS) 策略问题

**解决方案**:
检查 `api_configs` 表的RLS策略是否正确创建：

```sql
-- 检查RLS策略
SELECT * FROM pg_policies WHERE tablename = 'api_configs';
```

### 问题4：创建user_profile失败

**原因**: `user_profiles` 表不存在或RLS策略阻止

**解决方案**:
```sql
-- 确保user_profiles表存在
SELECT * FROM user_profiles LIMIT 1;

-- 如果不存在，运行 docs/database-setup.sql
```

---

## 📊 数据库表结构

### api_configs 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID（外键） |
| service_type | VARCHAR | 服务类型（llm/voice/map） |
| service_name | VARCHAR | 服务名称 |
| api_key_encrypted | TEXT | 加密后的API密钥 |
| api_secret_encrypted | TEXT | 加密后的API Secret |
| additional_config | JSONB | 额外配置 |
| is_active | BOOLEAN | 是否启用 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

---

## ✅ 完成检查清单

开发环境设置：
- [ ] Supabase邮箱确认已禁用
- [ ] `api_configs` 表已创建
- [ ] RLS策略已配置
- [ ] 注册功能测试通过
- [ ] 登录功能测试通过

API配置：
- [ ] 已获取LLM API密钥
- [ ] 已获取语音识别API密钥
- [ ] 已获取地图服务API密钥
- [ ] 在设置页面成功保存所有配置

功能测试：
- [ ] 注册→登录流程正常
- [ ] Settings页面正常显示
- [ ] API配置保存和读取正常
- [ ] 创建旅行计划功能正常
- [ ] 查看计划列表功能正常

---

## 🚀 下一步

完成Week 6设置后：

1. **测试完整流程**
   - 注册新用户
   - 配置API密钥
   - 创建旅行计划
   - 查看和管理计划

2. **准备Week 7开发**
   - 费用预算管理
   - AI预算分析
   - 费用记录功能

---

## 📞 获取帮助

如遇到问题：

1. 检查浏览器控制台的错误信息
2. 检查Supabase Dashboard的日志
3. 查看 `docs/Week6-Summary.md` 了解已知问题
4. 参考官方文档：
   - [Supabase文档](https://supabase.com/docs)
   - [Supabase Auth配置](https://supabase.com/docs/guides/auth)

---

**祝开发顺利！** 🎉

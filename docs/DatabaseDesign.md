# 数据库设计文档

## 概述

本项目使用 **Supabase** (基于PostgreSQL) 作为后端数据库服务。

## 数据库表设计

### 1. users (用户表)
> 由Supabase Auth自动管理，扩展字段存储在user_profiles表

### 2. user_profiles (用户配置表)
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**字段说明**:
- `id`: 用户ID，关联auth.users表
- `username`: 用户名
- `avatar_url`: 头像URL
- `created_at`: 创建时间
- `updated_at`: 更新时间

---

### 3. user_preferences (用户偏好表)
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  default_departure VARCHAR(100),
  travel_tags TEXT[],
  default_budget_min DECIMAL(10,2),
  default_budget_max DECIMAL(10,2),
  language VARCHAR(10) DEFAULT 'zh',
  theme VARCHAR(10) DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

**字段说明**:
- `user_id`: 用户ID
- `default_departure`: 常用出发地
- `travel_tags`: 旅行偏好标签 (数组)
- `default_budget_min/max`: 默认预算范围
- `language`: 语言偏好
- `theme`: 主题偏好

---

### 4. api_configs (API配置表)
```sql
CREATE TABLE api_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name VARCHAR(50) NOT NULL, -- 'llm', 'voice', 'map'
  api_key_encrypted TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, service_name)
);
```

**字段说明**:
- `service_name`: 服务名称 (llm/voice/map)
- `api_key_encrypted`: 加密后的API密钥
- `is_active`: 是否启用

**安全说明**: API密钥必须加密存储，使用Supabase的加密函数

---

### 5. travel_plans (旅行计划表)
```sql
CREATE TABLE travel_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
  budget DECIMAL(10,2),
  traveler_count INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'draft', -- draft, confirmed, completed, cancelled
  input_method VARCHAR(20), -- 'voice' or 'text'
  original_input TEXT,
  ai_generated_content JSONB, -- AI生成的完整内容
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX idx_travel_plans_status ON travel_plans(status);
CREATE INDEX idx_travel_plans_dates ON travel_plans(start_date, end_date);
```

**字段说明**:
- `title`: 计划标题
- `destination`: 目的地
- `start_date/end_date`: 开始/结束日期
- `days`: 天数 (自动计算)
- `budget`: 总预算
- `traveler_count`: 旅行人数
- `status`: 状态
- `input_method`: 输入方式
- `original_input`: 用户原始输入
- `ai_generated_content`: AI生成的JSON数据

---

### 6. itinerary_details (行程详情表)
```sql
CREATE TABLE itinerary_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES travel_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  time_slot VARCHAR(20), -- 'morning', 'afternoon', 'evening', 'night'
  activity_type VARCHAR(50), -- 'attraction', 'meal', 'transport', 'hotel'
  title VARCHAR(200) NOT NULL,
  description TEXT,
  location_name VARCHAR(200),
  location_address TEXT,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  estimated_duration INTEGER, -- 分钟
  estimated_cost DECIMAL(10,2),
  order_index INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_itinerary_plan_id ON itinerary_details(plan_id);
CREATE INDEX idx_itinerary_day ON itinerary_details(plan_id, day_number);
```

**字段说明**:
- `plan_id`: 关联的旅行计划
- `day_number`: 第几天
- `time_slot`: 时间段
- `activity_type`: 活动类型
- `location_lat/lng`: 地理坐标
- `estimated_duration`: 预计时长
- `estimated_cost`: 预计费用
- `order_index`: 排序索引

---

### 7. expenses (费用记录表)
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES travel_plans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, -- 'transport', 'accommodation', 'food', 'attraction', 'shopping', 'other'
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'CNY',
  description TEXT,
  expense_date DATE NOT NULL,
  payment_method VARCHAR(50), -- 'cash', 'card', 'alipay', 'wechat'
  input_method VARCHAR(20), -- 'voice' or 'manual'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_expenses_plan_id ON expenses(plan_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);
```

**字段说明**:
- `category`: 费用类别
- `amount`: 金额
- `currency`: 货币
- `expense_date`: 消费日期
- `payment_method`: 支付方式
- `input_method`: 录入方式

---

### 8. budget_allocations (预算分配表)
```sql
CREATE TABLE budget_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES travel_plans(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  allocated_amount DECIMAL(10,2) NOT NULL,
  spent_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, category)
);
```

**字段说明**:
- `category`: 预算类别
- `allocated_amount`: 分配金额
- `spent_amount`: 已花费金额

---

### 9. shared_plans (分享记录表)
```sql
CREATE TABLE shared_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES travel_plans(id) ON DELETE CASCADE,
  share_code VARCHAR(50) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shared_plans_code ON shared_plans(share_code);
```

**字段说明**:
- `share_code`: 分享码
- `is_active`: 是否有效
- `view_count`: 浏览次数
- `expires_at`: 过期时间

---

## 关系图

```
auth.users (Supabase Auth)
    │
    ├─── user_profiles (1:1)
    ├─── user_preferences (1:1)
    ├─── api_configs (1:N)
    ├─── travel_plans (1:N)
    │       │
    │       ├─── itinerary_details (1:N)
    │       ├─── expenses (1:N)
    │       ├─── budget_allocations (1:N)
    │       └─── shared_plans (1:N)
    └─── expenses (1:N)
```

## Row Level Security (RLS)

### 安全策略

所有表都启用RLS，确保用户只能访问自己的数据：

```sql
-- 示例：travel_plans表的RLS策略
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的计划
CREATE POLICY "Users can view own plans" 
  ON travel_plans FOR SELECT 
  USING (auth.uid() = user_id);

-- 用户只能插入自己的计划
CREATE POLICY "Users can insert own plans" 
  ON travel_plans FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的计划
CREATE POLICY "Users can update own plans" 
  ON travel_plans FOR UPDATE 
  USING (auth.uid() = user_id);

-- 用户只能删除自己的计划
CREATE POLICY "Users can delete own plans" 
  ON travel_plans FOR DELETE 
  USING (auth.uid() = user_id);
```

## 数据库函数

### 1. 更新时间戳触发器
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用到各表
CREATE TRIGGER update_travel_plans_updated_at
  BEFORE UPDATE ON travel_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. 计算预算使用情况
```sql
CREATE OR REPLACE FUNCTION calculate_budget_usage(p_plan_id UUID)
RETURNS TABLE(
  category VARCHAR,
  allocated DECIMAL,
  spent DECIMAL,
  remaining DECIMAL,
  percentage DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ba.category,
    ba.allocated_amount,
    COALESCE(SUM(e.amount), 0) as spent,
    ba.allocated_amount - COALESCE(SUM(e.amount), 0) as remaining,
    (COALESCE(SUM(e.amount), 0) / ba.allocated_amount * 100) as percentage
  FROM budget_allocations ba
  LEFT JOIN expenses e ON e.plan_id = ba.plan_id AND e.category = ba.category
  WHERE ba.plan_id = p_plan_id
  GROUP BY ba.category, ba.allocated_amount;
END;
$$ LANGUAGE plpgsql;
```

## 索引策略

- 为外键添加索引以优化JOIN查询
- 为常用查询字段添加索引 (user_id, status, date等)
- 为分享码添加唯一索引

## 备份策略

- Supabase自动每日备份
- 重要操作前手动备份
- 定期导出关键数据

## 迁移管理

使用Supabase Migration工具：

```bash
# 创建新迁移
supabase migration new create_travel_plans

# 应用迁移
supabase db push

# 回滚迁移
supabase db reset
```

---

**文档版本**: v1.0  
**更新日期**: 2025-10-23

# API 接口规范文档

## 概述

本文档定义前后端接口规范，包括请求/响应格式、错误处理、认证方式等。

## 基础信息

- **API类型**: RESTful API
- **数据格式**: JSON
- **字符编码**: UTF-8
- **认证方式**: JWT Token (Supabase Auth)
- **基础URL**: 通过Supabase SDK访问

## 通用规范

### 请求头
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

### 响应格式

#### 成功响应
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

#### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": { ... }
  }
}
```

### HTTP状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

### 错误码定义

| 错误码 | 说明 |
|--------|------|
| AUTH_001 | 未登录 |
| AUTH_002 | Token过期 |
| AUTH_003 | 无权限 |
| PLAN_001 | 计划不存在 |
| PLAN_002 | 计划创建失败 |
| API_001 | API密钥无效 |
| API_002 | API调用失败 |
| VALID_001 | 参数验证失败 |

---

## 认证接口

### 1. 用户注册
```
POST /auth/signup
```

**请求**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "用户名"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "用户名"
    },
    "session": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token"
    }
  }
}
```

### 2. 用户登录
```
POST /auth/login
```

**请求**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 3. 退出登录
```
POST /auth/logout
```

### 4. 刷新Token
```
POST /auth/refresh
```

---

## 旅行计划接口

### 1. 创建旅行计划
```
POST /api/travel-plans
```

**请求**:
```json
{
  "destination": "北京",
  "startDate": "2025-11-01",
  "endDate": "2025-11-05",
  "budget": 5000,
  "travelerCount": 2,
  "inputMethod": "voice",
  "originalInput": "我想11月去北京玩5天，预算5000元，两个人"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "北京5日游",
    "destination": "北京",
    "startDate": "2025-11-01",
    "endDate": "2025-11-05",
    "days": 5,
    "budget": 5000,
    "status": "draft",
    "createdAt": "2025-10-23T10:00:00Z"
  }
}
```

### 2. 获取计划列表
```
GET /api/travel-plans?status=draft&page=1&limit=10
```

**查询参数**:
- `status`: 状态筛选 (可选)
- `page`: 页码 (默认1)
- `limit`: 每页数量 (默认10)

**响应**:
```json
{
  "success": true,
  "data": {
    "plans": [...],
    "total": 25,
    "page": 1,
    "pageSize": 10,
    "totalPages": 3
  }
}
```

### 3. 获取计划详情
```
GET /api/travel-plans/:id
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "北京5日游",
    "destination": "北京",
    "startDate": "2025-11-01",
    "endDate": "2025-11-05",
    "days": 5,
    "budget": 5000,
    "itinerary": [...],
    "budgetAllocations": [...],
    "expenses": [...]
  }
}
```

### 4. 更新计划
```
PUT /api/travel-plans/:id
```

**请求**:
```json
{
  "title": "北京深度游",
  "status": "confirmed"
}
```

### 5. 删除计划
```
DELETE /api/travel-plans/:id
```

---

## 行程详情接口

### 1. 获取行程详情
```
GET /api/travel-plans/:planId/itinerary
```

### 2. 添加行程项
```
POST /api/travel-plans/:planId/itinerary
```

**请求**:
```json
{
  "dayNumber": 1,
  "timeSlot": "morning",
  "activityType": "attraction",
  "title": "故宫",
  "description": "参观故宫博物院",
  "locationName": "故宫博物院",
  "locationAddress": "北京市东城区景山前街4号",
  "locationLat": 39.9163,
  "locationLng": 116.3972,
  "estimatedDuration": 180,
  "estimatedCost": 60
}
```

### 3. 更新行程项
```
PUT /api/itinerary/:id
```

### 4. 删除行程项
```
DELETE /api/itinerary/:id
```

### 5. 调整行程顺序
```
PATCH /api/travel-plans/:planId/itinerary/reorder
```

**请求**:
```json
{
  "items": [
    { "id": "uuid1", "orderIndex": 1 },
    { "id": "uuid2", "orderIndex": 2 }
  ]
}
```

---

## 费用管理接口

### 1. 添加费用记录
```
POST /api/expenses
```

**请求**:
```json
{
  "planId": "uuid",
  "category": "food",
  "amount": 150.50,
  "currency": "CNY",
  "description": "午餐",
  "expenseDate": "2025-11-01",
  "paymentMethod": "wechat",
  "inputMethod": "voice"
}
```

### 2. 获取费用列表
```
GET /api/travel-plans/:planId/expenses
```

### 3. 更新费用记录
```
PUT /api/expenses/:id
```

### 4. 删除费用记录
```
DELETE /api/expenses/:id
```

### 5. 获取费用统计
```
GET /api/travel-plans/:planId/expenses/statistics
```

**响应**:
```json
{
  "success": true,
  "data": {
    "totalBudget": 5000,
    "totalSpent": 2350.50,
    "remaining": 2649.50,
    "byCategory": {
      "transport": 800,
      "accommodation": 1200,
      "food": 350.50
    },
    "dailySpending": [...]
  }
}
```

---

## 预算分配接口

### 1. 设置预算分配
```
POST /api/travel-plans/:planId/budget-allocations
```

**请求**:
```json
{
  "allocations": [
    { "category": "transport", "amount": 1000 },
    { "category": "accommodation", "amount": 2000 },
    { "category": "food", "amount": 1500 },
    { "category": "attraction", "amount": 500 }
  ]
}
```

### 2. 获取预算使用情况
```
GET /api/travel-plans/:planId/budget-allocations
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "category": "transport",
      "allocated": 1000,
      "spent": 800,
      "remaining": 200,
      "percentage": 80
    }
  ]
}
```

---

## AI服务接口

### 1. 生成旅行计划
```
POST /api/ai/generate-plan
```

**请求**:
```json
{
  "destination": "北京",
  "days": 5,
  "budget": 5000,
  "travelerCount": 2,
  "preferences": ["历史文化", "美食"],
  "userInput": "想去北京看长城故宫，吃烤鸭"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "title": "北京5日游",
    "itinerary": [
      {
        "day": 1,
        "activities": [...]
      }
    ],
    "budgetAllocation": {...},
    "recommendations": [...]
  }
}
```

### 2. 优化行程
```
POST /api/ai/optimize-itinerary
```

### 3. 生成预算建议
```
POST /api/ai/budget-suggestions
```

---

## 语音服务接口

### 1. 上传音频文件
```
POST /api/voice/upload
```

**请求**: multipart/form-data
```
audio: <file>
```

**响应**:
```json
{
  "success": true,
  "data": {
    "taskId": "task_id",
    "status": "processing"
  }
}
```

### 2. 获取转写结果
```
GET /api/voice/result/:taskId
```

**响应**:
```json
{
  "success": true,
  "data": {
    "status": "completed",
    "text": "我想去北京玩五天",
    "confidence": 0.95
  }
}
```

---

## 地图服务接口

### 1. 搜索地点
```
GET /api/map/search?keyword=故宫&city=北京
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "name": "故宫博物院",
      "address": "北京市东城区景山前街4号",
      "location": { "lat": 39.9163, "lng": 116.3972 },
      "type": "景点"
    }
  ]
}
```

### 2. 路线规划
```
POST /api/map/route
```

**请求**:
```json
{
  "origin": { "lat": 39.9163, "lng": 116.3972 },
  "destination": { "lat": 40.4319, "lng": 116.5704 },
  "mode": "transit"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "distance": 75000,
    "duration": 7200,
    "routes": [...],
    "polyline": "..."
  }
}
```

---

## 用户配置接口

### 1. 获取用户偏好
```
GET /api/user/preferences
```

### 2. 更新用户偏好
```
PUT /api/user/preferences
```

**请求**:
```json
{
  "defaultDeparture": "上海",
  "travelTags": ["历史文化", "美食"],
  "defaultBudgetMin": 3000,
  "defaultBudgetMax": 8000,
  "language": "zh",
  "theme": "light"
}
```

### 3. 获取API配置
```
GET /api/user/api-configs
```

### 4. 设置API密钥
```
POST /api/user/api-configs
```

**请求**:
```json
{
  "serviceName": "llm",
  "apiKey": "sk-xxxx"
}
```

---

## 分享接口

### 1. 生成分享链接
```
POST /api/travel-plans/:id/share
```

**请求**:
```json
{
  "expiresIn": 7
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "shareCode": "abc123",
    "shareUrl": "https://app.com/shared/abc123",
    "expiresAt": "2025-10-30T10:00:00Z"
  }
}
```

### 2. 访问分享计划
```
GET /api/shared/:shareCode
```

---

## 请求限流

### 限流规则
- 普通接口: 100次/分钟
- AI生成接口: 10次/分钟
- 语音转写接口: 20次/分钟

### 限流响应
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT",
    "message": "请求过于频繁，请稍后再试",
    "retryAfter": 60
  }
}
```

---

## WebSocket接口 (可选)

### AI流式生成
```
ws://api.com/ws/ai/stream
```

**消息格式**:
```json
{
  "type": "ai_chunk",
  "data": {
    "content": "第一天：...",
    "done": false
  }
}
```

---

## 开发与测试

### 环境变量
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### API Mock
开发时可使用MSW进行API Mock：
```typescript
// mocks/handlers.ts
export const handlers = [
  rest.get('/api/travel-plans', (req, res, ctx) => {
    return res(ctx.json({ success: true, data: [...] }))
  })
]
```

### API测试工具
- Postman
- Thunder Client (VS Code插件)
- curl命令

---

**文档版本**: v1.0  
**更新日期**: 2025-10-23

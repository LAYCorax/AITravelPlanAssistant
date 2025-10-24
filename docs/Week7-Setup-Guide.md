# Week 7 Setup Guide - 费用预算管理

## 概述

Week 7 实现了完整的费用预算管理功能，包括：
- ✅ AI预算分析（已在Week 4中实现）
- ✅ 费用记录功能
- ✅ 预算对比展示
- ✅ 费用统计和可视化

---

## 1. 数据库设置

### 创建expenses表

在Supabase SQL Editor中运行以下脚本：

```bash
# 位置
docs/expenses-setup.sql
```

**步骤**：
1. 登录Supabase Dashboard
2. 选择你的项目
3. 进入 **SQL Editor**
4. 创建新query
5. 复制 `docs/expenses-setup.sql` 的全部内容
6. 点击 **Run** 执行

**验证安装**：
```sql
-- 检查表是否创建成功
SELECT * FROM information_schema.tables 
WHERE table_name = 'expenses';

-- 检查RLS策略
SELECT * FROM pg_policies 
WHERE tablename = 'expenses';
```

---

## 2. 前端代码结构

### 新增文件

```
frontend/src/
├── types/
│   └── travel.ts                    # ✅ 已更新：添加Expense相关类型
├── services/
│   └── api/
│       └── expenses.ts              # ✅ 新增：费用API服务
└── components/
    └── expense/
        ├── ExpenseForm.tsx          # ✅ 新增：费用录入表单
        ├── ExpenseList.tsx          # ✅ 新增：费用列表展示
        ├── ExpenseList.css          # ✅ 新增：费用列表样式
        ├── ExpenseSummary.tsx       # ✅ 新增：费用统计卡片
        └── ExpenseSummaryCard.css   # ✅ 新增：统计卡片样式
```

### 修改的文件

```
frontend/src/
└── pages/
    └── TravelPlanner/
        └── PlanDetail.tsx           # ✅ 已更新：添加费用管理Tab
```

---

## 3. 功能特性

### 3.1 AI预算生成（Week 4已实现）

在创建旅行计划时，AI会自动生成详细的预算分配：

```typescript
// LLM Prompt中已包含预算要求
- 每日费用明细 (totalCost)
- 活动费用 (activity.cost)
- 住宿费用 (accommodation.cost)
- 交通费用 (transportation.cost)
- 餐饮费用 (meals.breakfast/lunch/dinner.cost)
```

### 3.2 费用记录

**功能**：
- ✅ 手动添加费用记录
- ✅ 分类管理（交通、住宿、餐饮、景点、购物、其他）
- ✅ 日期选择
- ✅ 金额输入（支持小数）
- ✅ 费用描述

**使用方法**：
1. 打开计划详情页
2. 切换到"费用管理"Tab
3. 点击"添加费用"按钮
4. 填写表单并提交

### 3.3 预算对比

**显示内容**：
- 总预算
- 已花费金额
- 剩余预算
- 预算使用率（进度条）
- 超支警告

**视觉反馈**：
- 🟢 绿色：使用率 < 70%（良好）
- 🟡 橙色：使用率 70-90%（警告）
- 🔴 红色：使用率 > 90%（接近超支）

### 3.4 分类统计

按以下类别统计费用：
- 🚗 交通
- 🏠 住宿
- ☕ 餐饮
- 🗺️ 景点门票
- 🛍️ 购物
- ⋯ 其他

每个类别显示：
- 花费金额
- 占总支出的百分比
- 彩色进度条

---

## 4. API使用示例

### 添加费用记录

```typescript
import { createExpense } from '@/services/api/expenses';

const result = await createExpense({
  plan_id: 'plan-uuid',
  category: 'food',
  amount: 85.50,
  description: '午餐 - 全聚德烤鸭',
  expense_date: '2025-11-01',
});

if (result.success) {
  console.log('费用记录添加成功', result.expense);
}
```

### 获取费用列表

```typescript
import { getExpensesByPlanId } from '@/services/api/expenses';

const result = await getExpensesByPlanId('plan-uuid');

if (result.success) {
  console.log('费用列表:', result.expenses);
}
```

### 获取费用统计

```typescript
import { getExpenseSummary } from '@/services/api/expenses';

const result = await getExpenseSummary('plan-uuid');

if (result.success) {
  console.log('总计:', result.summary.total);
  console.log('分类:', result.summary.byCategory);
}
```

---

## 5. 数据类型定义

### Expense

```typescript
interface Expense {
  id: string;
  plan_id: string;
  user_id: string;
  category: 'transport' | 'accommodation' | 'food' | 'attraction' | 'shopping' | 'other';
  amount: number;
  description: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
}
```

### ExpenseSummary

```typescript
interface ExpenseSummary {
  total: number;
  byCategory: {
    transport: number;
    accommodation: number;
    food: number;
    attraction: number;
    shopping: number;
    other: number;
  };
}
```

---

## 6. 测试清单

### 数据库测试

- [ ] expenses表创建成功
- [ ] 索引创建成功
- [ ] RLS策略生效（用户只能看到自己的费用）
- [ ] 触发器正常（updated_at自动更新）

### 功能测试

- [ ] 添加费用记录成功
- [ ] 费用列表正常显示
- [ ] 删除费用记录成功
- [ ] 费用统计计算正确
- [ ] 预算对比准确
- [ ] 分类统计准确

### UI测试

- [ ] ExpenseForm表单验证正常
- [ ] ExpenseList列表渲染正常
- [ ] ExpenseSummaryCard样式正确
- [ ] 进度条颜色根据百分比变化
- [ ] 响应式布局在移动端正常

### 边界测试

- [ ] 没有费用记录时显示Empty
- [ ] 预算为0时的处理
- [ ] 超支时的警告显示
- [ ] 金额精度（保留2位小数）

---

## 7. 已知限制

### 当前版本不支持的功能（P1优先级，Week 8实现）：

- ⏳ 语音记录费用（计划Week 8实现）
- ⏳ 费用编辑功能
- ⏳ 费用图片上传
- ⏳ 费用导出（PDF/Excel）
- ⏳ 多币种支持

---

## 8. 下一步计划

### Week 8: 费用追踪与行程编辑

**费用追踪**：
- 实现费用编辑功能
- 添加费用搜索和筛选
- 图表可视化（饼图、柱状图）
- 超支预警通知

**行程编辑**：
- 行程拖拽排序
- 景点添加/删除
- 时间调整
- 行程版本管理

---

## 9. 常见问题

### Q1: expenses表创建失败？

**A**: 确保先运行了 `travel-plans-setup.sql` 创建travel_plans表，因为expenses表有外键约束。

### Q2: RLS策略不生效？

**A**: 检查是否正确登录，`auth.uid()` 需要有效的用户会话。

### Q3: 费用统计不准确？

**A**: 检查amount字段是否为DECIMAL类型，确保数值精度。

### Q4: 删除计划后费用记录怎么办？

**A**: 设置了 `ON DELETE CASCADE`，删除计划时会自动删除关联的费用记录。

---

## 10. 性能优化建议

### 数据库索引

已创建以下索引优化查询：
```sql
idx_expenses_plan_id      -- 按计划查询
idx_expenses_user_id      -- 按用户查询
idx_expenses_category     -- 按分类筛选
idx_expenses_date         -- 按日期排序
```

### 前端优化

- 使用React.memo优化ExpenseList渲染
- 费用统计使用useMemo缓存计算结果
- 列表虚拟化（如果费用记录超过100条）

---

## 11. 安全注意事项

### RLS策略

所有费用记录都受RLS保护：
- ✅ 用户只能查看自己的费用
- ✅ 用户只能创建自己的费用
- ✅ 用户只能更新/删除自己的费用

### 数据验证

- ✅ 金额必须 >= 0
- ✅ 分类只能是预定义的6种
- ✅ 描述长度限制200字
- ✅ 日期格式验证

---

## 完成 ✅

Week 7 的核心功能已全部实现！

**成果**：
- ✅ 费用记录数据库表
- ✅ 完整的CRUD API
- ✅ 3个费用管理组件
- ✅ 集成到计划详情页
- ✅ 预算对比和统计

**开发时间**: 约2-3小时

**下一步**: 
1. 在Supabase运行SQL脚本
2. 测试所有功能
3. 准备进入Week 8开发

---

**Good luck! 🚀**

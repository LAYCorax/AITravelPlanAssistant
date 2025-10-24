-- =====================================================
-- 费用记录表设置脚本 (Week 7)
-- AI旅行规划助手 - Expenses Table Setup
-- =====================================================
-- 
-- 说明：
-- 1. 在Supabase SQL Editor中运行此脚本
-- 2. 用于Week 7费用预算管理功能
-- 3. 支持用户记录实际旅行费用并与预算对比
--
-- =====================================================

-- 1. 创建费用记录表
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID NOT NULL REFERENCES public.travel_plans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 费用信息
    category TEXT NOT NULL CHECK (category IN ('transport', 'accommodation', 'food', 'attraction', 'shopping', 'other')),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    description TEXT NOT NULL,
    expense_date DATE NOT NULL,
    
    -- 可选：附件图片
    image_url TEXT,
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_expenses_plan_id ON public.expenses(plan_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);

-- 3. 创建更新时间戳的触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 为expenses表创建触发器
DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. 启用行级安全性 (RLS)
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 6. 创建RLS策略

-- 用户只能查看自己的费用记录
DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;
CREATE POLICY "Users can view their own expenses"
    ON public.expenses FOR SELECT
    USING (auth.uid() = user_id);

-- 用户只能创建自己的费用记录
DROP POLICY IF EXISTS "Users can create their own expenses" ON public.expenses;
CREATE POLICY "Users can create their own expenses"
    ON public.expenses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的费用记录
DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;
CREATE POLICY "Users can update their own expenses"
    ON public.expenses FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 用户只能删除自己的费用记录
DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;
CREATE POLICY "Users can delete their own expenses"
    ON public.expenses FOR DELETE
    USING (auth.uid() = user_id);

-- 7. 创建用于统计费用的视图（可选）
CREATE OR REPLACE VIEW public.expense_summary AS
SELECT 
    plan_id,
    user_id,
    COUNT(*) as total_count,
    SUM(amount) as total_amount,
    SUM(CASE WHEN category = 'transport' THEN amount ELSE 0 END) as transport_total,
    SUM(CASE WHEN category = 'accommodation' THEN amount ELSE 0 END) as accommodation_total,
    SUM(CASE WHEN category = 'food' THEN amount ELSE 0 END) as food_total,
    SUM(CASE WHEN category = 'attraction' THEN amount ELSE 0 END) as attraction_total,
    SUM(CASE WHEN category = 'shopping' THEN amount ELSE 0 END) as shopping_total,
    SUM(CASE WHEN category = 'other' THEN amount ELSE 0 END) as other_total
FROM public.expenses
GROUP BY plan_id, user_id;

-- 8. 授予视图访问权限
GRANT SELECT ON public.expense_summary TO authenticated;

-- =====================================================
-- 测试数据（可选，用于开发测试）
-- =====================================================

-- 注意：请替换下面的 UUID 为实际的 plan_id 和 user_id
-- 
-- INSERT INTO public.expenses (plan_id, user_id, category, amount, description, expense_date)
-- VALUES 
--     ('your-plan-id-here', 'your-user-id-here', 'food', 85.50, '午餐 - 全聚德烤鸭', '2025-11-01'),
--     ('your-plan-id-here', 'your-user-id-here', 'transport', 12.00, '地铁 - 天安门到颐和园', '2025-11-01'),
--     ('your-plan-id-here', 'your-user-id-here', 'attraction', 60.00, '故宫门票', '2025-11-01');

-- =====================================================
-- 验证安装
-- =====================================================

-- 检查表是否创建成功
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'expenses'
ORDER BY ordinal_position;

-- 检查索引
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'expenses';

-- 检查RLS策略
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'expenses';

-- =====================================================
-- 完成
-- =====================================================
-- 
-- 费用记录表已创建完成！
-- 
-- 下一步：
-- 1. 在前端创建 services/api/expenses.ts
-- 2. 实现费用记录的CRUD操作
-- 3. 创建费用录入和展示的UI组件
-- 4. 集成语音记录费用功能
--
-- =====================================================

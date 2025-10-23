-- 创建旅行计划表 (Travel Plans Table)
CREATE TABLE IF NOT EXISTS travel_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  destination VARCHAR(200) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  budget DECIMAL(10, 2) NOT NULL,
  traveler_count INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建行程详情表 (Itinerary Details Table)
CREATE TABLE IF NOT EXISTS itinerary_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES travel_plans(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  date DATE NOT NULL,
  title VARCHAR(200) NOT NULL,
  activities JSONB NOT NULL DEFAULT '[]'::jsonb,
  accommodation JSONB,
  transportation JSONB,
  meals JSONB,
  total_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_plan_day UNIQUE (plan_id, day)
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_plans_status ON travel_plans(status);
CREATE INDEX IF NOT EXISTS idx_travel_plans_start_date ON travel_plans(start_date);
CREATE INDEX IF NOT EXISTS idx_itinerary_details_plan_id ON itinerary_details(plan_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_details_day ON itinerary_details(day);

-- 启用行级安全策略 (Row Level Security)
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_details ENABLE ROW LEVEL SECURITY;

-- 旅行计划表的RLS策略
-- 用户只能查看自己的旅行计划
DROP POLICY IF EXISTS "Users can view own travel plans" ON travel_plans;
CREATE POLICY "Users can view own travel plans"
  ON travel_plans FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能创建自己的旅行计划
DROP POLICY IF EXISTS "Users can create own travel plans" ON travel_plans;
CREATE POLICY "Users can create own travel plans"
  ON travel_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的旅行计划
DROP POLICY IF EXISTS "Users can update own travel plans" ON travel_plans;
CREATE POLICY "Users can update own travel plans"
  ON travel_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- 用户只能删除自己的旅行计划
DROP POLICY IF EXISTS "Users can delete own travel plans" ON travel_plans;
CREATE POLICY "Users can delete own travel plans"
  ON travel_plans FOR DELETE
  USING (auth.uid() = user_id);

-- 行程详情表的RLS策略
-- 用户只能查看自己旅行计划的行程详情
DROP POLICY IF EXISTS "Users can view own itinerary details" ON itinerary_details;
CREATE POLICY "Users can view own itinerary details"
  ON itinerary_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = itinerary_details.plan_id
      AND travel_plans.user_id = auth.uid()
    )
  );

-- 用户只能创建自己旅行计划的行程详情
DROP POLICY IF EXISTS "Users can create own itinerary details" ON itinerary_details;
CREATE POLICY "Users can create own itinerary details"
  ON itinerary_details FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = itinerary_details.plan_id
      AND travel_plans.user_id = auth.uid()
    )
  );

-- 用户只能更新自己旅行计划的行程详情
DROP POLICY IF EXISTS "Users can update own itinerary details" ON itinerary_details;
CREATE POLICY "Users can update own itinerary details"
  ON itinerary_details FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = itinerary_details.plan_id
      AND travel_plans.user_id = auth.uid()
    )
  );

-- 用户只能删除自己旅行计划的行程详情
DROP POLICY IF EXISTS "Users can delete own itinerary details" ON itinerary_details;
CREATE POLICY "Users can delete own itinerary details"
  ON itinerary_details FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = itinerary_details.plan_id
      AND travel_plans.user_id = auth.uid()
    )
  );

-- 创建函数来自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 travel_plans 表创建触发器
DROP TRIGGER IF EXISTS update_travel_plans_updated_at ON travel_plans;
CREATE TRIGGER update_travel_plans_updated_at
  BEFORE UPDATE ON travel_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 添加注释
COMMENT ON TABLE travel_plans IS '旅行计划表';
COMMENT ON TABLE itinerary_details IS '行程详情表';
COMMENT ON COLUMN travel_plans.status IS '计划状态: draft-草稿, confirmed-已确认, in_progress-进行中, completed-已完成, cancelled-已取消';
COMMENT ON COLUMN itinerary_details.activities IS 'JSON数组，包含当日活动列表';
COMMENT ON COLUMN itinerary_details.accommodation IS 'JSON对象，包含住宿信息';
COMMENT ON COLUMN itinerary_details.transportation IS 'JSON对象，包含交通信息';
COMMENT ON COLUMN itinerary_details.meals IS 'JSON对象，包含餐饮信息';

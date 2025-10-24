-- 创建API配置表 (API Configurations Table)
CREATE TABLE IF NOT EXISTS api_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('llm', 'voice', 'map')),
  service_name VARCHAR(100), -- e.g., 'OpenAI', 'Alibaba Qwen', 'iFlytek', 'Amap'
  api_key_encrypted TEXT NOT NULL,
  api_secret_encrypted TEXT, -- 某些服务需要额外的secret
  additional_config JSONB DEFAULT '{}'::jsonb, -- 额外配置项（如appId等）
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_user_service UNIQUE (user_id, service_type)
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_api_configs_user_id ON api_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_configs_service_type ON api_configs(service_type);
CREATE INDEX IF NOT EXISTS idx_api_configs_is_active ON api_configs(is_active);

-- 启用行级安全策略 (Row Level Security)
ALTER TABLE api_configs ENABLE ROW LEVEL SECURITY;

-- API配置表的RLS策略
-- 用户只能查看自己的API配置
DROP POLICY IF EXISTS "Users can view own api configs" ON api_configs;
CREATE POLICY "Users can view own api configs"
  ON api_configs FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能创建自己的API配置
DROP POLICY IF EXISTS "Users can create own api configs" ON api_configs;
CREATE POLICY "Users can create own api configs"
  ON api_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的API配置
DROP POLICY IF EXISTS "Users can update own api configs" ON api_configs;
CREATE POLICY "Users can update own api configs"
  ON api_configs FOR UPDATE
  USING (auth.uid() = user_id);

-- 用户只能删除自己的API配置
DROP POLICY IF EXISTS "Users can delete own api configs" ON api_configs;
CREATE POLICY "Users can delete own api configs"
  ON api_configs FOR DELETE
  USING (auth.uid() = user_id);

-- 为 api_configs 表创建触发器以自动更新 updated_at
DROP TRIGGER IF EXISTS update_api_configs_updated_at ON api_configs;
CREATE TRIGGER update_api_configs_updated_at
  BEFORE UPDATE ON api_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 添加注释
COMMENT ON TABLE api_configs IS 'API密钥配置表 - 存储用户的第三方服务API密钥（加密存储）';
COMMENT ON COLUMN api_configs.service_type IS '服务类型: llm-大语言模型, voice-语音识别, map-地图服务';
COMMENT ON COLUMN api_configs.service_name IS '具体服务名称，如OpenAI、通义千问、科大讯飞、高德地图等';
COMMENT ON COLUMN api_configs.api_key_encrypted IS '加密后的API密钥';
COMMENT ON COLUMN api_configs.api_secret_encrypted IS '加密后的API Secret（某些服务需要）';
COMMENT ON COLUMN api_configs.additional_config IS 'JSON对象，存储额外配置（如appId、baseUrl等）';
COMMENT ON COLUMN api_configs.is_active IS '是否启用该配置';
